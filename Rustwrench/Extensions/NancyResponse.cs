using Nancy;
using Rustwrench.Models;
using ShopifySharp;

namespace Rustwrench
{
    public static class NancyResponseExtensions
    {
        /// <summary>
        /// Takes a Nancy response + error message and turns it into a JSON error message.
        /// </summary>
        public static Response AsJsonError(this IResponseFormatter response, string message, HttpStatusCode statusCode, object details = null)
        {
            return response.AsJson(new {message = message, details}, statusCode);
        }

        /// <summary>
        /// Takes a user object and encodes it as a new JWT session token.
        /// </summary>
        public static Response WithSessionToken(this IResponseFormatter response, User user, int expirationDays = 30)
        {
            var token = new SessionToken(user, expirationDays);

            // Never return the token's ShopifyAccessToken to the client
            token.ShopifyAccessToken = null;

            return response.AsJson(token).WithCookie("Rustwrench_Auth", token.token);
        }

        public static Response InvalidToken(this IResponseFormatter response)
        {
            return response.AsJsonError($"Missing or invalid {Config.AuthHeaderName} header.", HttpStatusCode.Unauthorized);
        }

        public static Response ShopifyAuthenticationRequired(this IResponseFormatter response)
        {
            return response.AsJsonError("Shopify OAuth integration required.", HttpStatusCode.PreconditionFailed);
        }
    }
}