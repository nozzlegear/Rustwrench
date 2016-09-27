using System;
using System.Collections.Generic;
using Rustwrench.Interfaces;

namespace Rustwrench.Models
{
    public class User : IUser
    {
        /// <summary>
        /// The user's username/id. MyCouch will automatically set this as the CouchDB id.
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// The user's CouchDB revision id.
        /// </summary>
        public string Rev { get; set; }

        public List<string> Permissions { get; set; } = new List<string>();

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