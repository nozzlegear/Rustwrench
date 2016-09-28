using Rustwrench.Interfaces;
using System;
using System.Collections.Generic;

namespace Rustwrench.Models
{
    /// <summary>
    /// Represents the JSON Web Token used by this app for authentication and session management.
    /// </summary>
    public class SessionToken : IUser
    {
        public SessionToken() { }

        /// <summary>
        /// Creates a new <see cref="SessionToken" /> from a <see cref="User" /> object.
        /// </summary>
        public SessionToken(User user, int expirationDays = 30)
        {
            AutoMapper.Mapper.Map(user, this);

            exp = DateTime.UtcNow.AddDays(expirationDays).ToEpochTime();
            token = JWT.JsonWebToken.Encode(this, Config.JwtSecretKey, JWT.JwtHashAlgorithm.HS512);
        }

        /// <summary>
        /// Part of the JWT spec, this value is the date and time that the session is valid for in UNIX epoch seconds.
        /// </summary>
        public long exp { get; set; }

        /// <summary>
        /// This <see cref="SessionToken"/> token, serialized to a JWT token string.
        /// </summary>
        public string token { get; private set; }
        
        /// <summary>
        /// The user's username/id. MyCouch will automatically set this as the CouchDB id.
        /// </summary>
        public string UserId { get; set; }

        public string ShopifyAccessToken { get; set; }

        public string ShopifyUrl { get; set; }

        public string ShopName { get; set; }

        public long? ShopId { get; set; }

        public long? ShopifyChargeId { get; set; }

        public List<string> Permissions { get; set; } = new List<string>();
    }
}