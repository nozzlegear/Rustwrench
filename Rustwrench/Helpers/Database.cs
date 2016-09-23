using System.Threading.Tasks;
using Rustwrench.Models.Database;

namespace Rustwrench
{
    public static class Database
    {
        /// <summary>
        /// Configures the database, ensuring they've been created on the server and then initializing their connections.
        /// </summary>
        public static async Task ConfigureAsync()
        {
            Users = new UserDatabase(Config.DatabaseUrl, "rustwrench_users");

            // Client must create the databases if they don't exist. Methods will silently fail if the databases don't exist.
            var createTasks = new [] { Users.Database.PutAsync() };

            await Task.WhenAll(createTasks);

            // Configure the databases
            var configTasks = new [] { Users.ConfigureAsync() };

            await Task.WhenAll(configTasks);
        }

        public static UserDatabase Users { get; private set; }
    }
}