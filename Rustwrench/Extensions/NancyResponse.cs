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
        /// Update's a user's JWT session token, passing it along with the response data as 'updatedSessionToken'. 
        /// </summary>
        public static Response WithSessionToken(this IResponseFormatter response, User userData)
        {
            return response.WithSessionToken(userData, new {});
        }

        /// <summary>
        /// Takes response data and updates the user's JWT session token, passing it along with the response data as 'updatedSessionToken'. 
        /// </summary>
        public static Response WithSessionToken<T>(this IResponseFormatter response, User userData, T outputData)
        {
            var data = outputData.ToDictionary();
            var payload = new SessionToken(userData);
            var token = payload.SerializeTokenString();

            data["rustwrench_token"] = token;
            data["rustwrench_token_payload"] = payload;

            return response.AsJson(data).WithCookie("Rustwrench_Auth", token);
        }

        public static Response InvalidToken(this IResponseFormatter response)
        {
            return response.AsJsonError("Missing or invalid X-SCI-Token header.", HttpStatusCode.Unauthorized);
        }

        public static Response ShopifyAuthenticationRequired(this IResponseFormatter response)
        {
            return response.AsJsonError("Shopify OAuth integration required.", HttpStatusCode.PreconditionFailed);
        }
    }
}