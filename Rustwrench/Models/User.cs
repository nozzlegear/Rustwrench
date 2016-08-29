namespace Rustwrench.Models
{
    public class User
    {
        /// <summary>
        /// The user's username/id. MyCouch will automatically set this as the CouchDB id.
        /// </summary>
        public string UserId { get; set; }

        public string ShopifyAccessToken { get; set; }

        public string ShopifyUrl { get; set; }

        public string ShopName { get; set; }
    }
}