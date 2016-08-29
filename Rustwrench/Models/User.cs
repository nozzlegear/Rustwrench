namespace Rustwrench.Models
{
    public class User
    {
        /// <summary>
        /// The user's username/id. MyCouch will automatically set this as the CouchDB id.
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// The user's BCrypt-hashed password.
        /// </summary>
        public string HashedPassword { get; set; }

        public string ShopifyAccessToken { get; set; }

        public string ShopifyUrl { get; set; }

        public string ShopName { get; set; }

        public long? ShopId { get; set; }

        public long? ShopifyChargeId { get; set; }
    }
}