using System.Threading.Tasks;
using MyCouch;

namespace Rustwrench.Models.Database
{
    public class UserDatabase : MyCouchClient
    {
        public UserDatabase(string address, string database) : base(address, database)
        {

        }

        /// <summary>
        /// Configures the database by creating the necessary design docs and views.
        /// </summary>
        public async Task ConfigureAsync()
        {
            // TODO: Configure design documents
        }
    }
}