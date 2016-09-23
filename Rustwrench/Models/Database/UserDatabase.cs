using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using MyCouch;
using MyCouch.Requests;
using Newtonsoft.Json;

namespace Rustwrench.Models.Database
{
    public class UserDatabase : MyCouchClient
    {
        /// <summary>
        /// The name of the database's design doc.
        /// </summary>
        private static string _designDocId { get; } = "docs";

        /// <summary>
        /// The name of the design doc's "sort by shop id" view.
        /// </summary>
        private static string _byShopId { get; } = "by_shopId";

        public UserDatabase(string address, string database) : base(address, database)
        {

        }

        /// <summary>
        /// Configures the database by creating the necessary design docs and views.
        /// </summary>
        public async Task ConfigureAsync()
        {
            // IMPORTANT: Always change the latest version when changes are made to the design doc.
            int latestVersion = 1;
            bool parseFailed = false;
            DesignDoc doc;

            // Check to see if the design doc exists and is on the current version
            var getDoc = await Documents.GetAsync($"_design/{_designDocId}");

            try 
            {
                doc = JsonConvert.DeserializeObject<DesignDoc>(getDoc?.Content);
            }
            catch (Exception)
            {
                doc = new DesignDoc()
                {
                    _id = $"_design/{_designDocId}",
                    version = -1,
                };

                parseFailed = true;
            }

            if (getDoc.StatusCode != HttpStatusCode.OK || doc.version != latestVersion || parseFailed)
            {
                Console.WriteLine("Updating UserDatabase's design doc...");

                // Create map functions on the order database to sort orders by their userid or their displayid
                doc.version = latestVersion;
                doc.views = new Dictionary<string, DesignDocView>() 
                {
                    {
                        _byShopId, 
                        new DesignDocView() 
                        {
                            map = "function (doc) {\n emit(doc.shopId, doc); \n}"
                        }
                    }
                };

                var update = await Documents.PutAsync(doc._id, JsonConvert.SerializeObject(doc));

                if (update.StatusCode != HttpStatusCode.OK && update.StatusCode != HttpStatusCode.Created)
                {
                    Console.WriteLine($"Failed to update UserDatabase's design doc. Response: {update.StatusCode} {update.Reason}");
                }
            }
        }

        /// <summary>
        /// Retrieves a user by their shop id. Will return null if no results are found.
        /// </summary>
        public async Task<User> GetByShopIdAsync(long shopId)
        {
            var query = new QueryViewRequest(_designDocId, _byShopId).Configure(c => c.Key(shopId).IncludeDocs(true).Limit(1));
            var result = await Views.QueryAsync<User, User>(query);
            
            if (! result.IsSuccess)
            {
                throw new Exception($"Error retrieving user by shop id {shopId}. Database responded with '{result.StatusCode} {result.Reason}' when request was sent to {result.RequestUri.ToString()}");
            }
            
            return result.Rows.FirstOrDefault()?.IncludedDoc;
        }
    }
}