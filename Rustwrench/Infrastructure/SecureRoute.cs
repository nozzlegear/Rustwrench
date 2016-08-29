using Nancy;
using System;
using System.Linq;
using Rustwrench.Models;
using ShopifySharp;

namespace Rustwrench.Infrastructure
{
    /// <summary>
    /// A secured Nancy module which uses JWT for authentication.
    /// </summary>
    public class SecureRoute : NancyModule
    {
        public SecureRoute() : base() { }

        public SecureRoute(string pathname = "", bool requiresShopifyToken = false) : base (pathname)
        {
            Before.AddItemToStartOfPipeline(ctx =>
            {
                string headerName = Config.AuthHeaderName;

                if (! ctx.Request.Headers.Keys.Any(k => k == headerName))
                {
                    var headers = ctx.Request.Headers.Select(h => $"{h.Key}={h.Value}");

                    return InvalidTokenResponse();
                }

                var header = ctx.Request.Headers[headerName].FirstOrDefault();

                try
                {
                    var token = this.DecodeSessionToken(header);
                    this.SessionToken = token;
                }
                catch (JWT.SignatureVerificationException)
                {
                    return InvalidTokenResponse();                
                }
                catch (Exception e)
                {
                    Console.WriteLine("JWT Deserialization exception: " +  e.Message);

                    return InvalidTokenResponse();
                }

                return null;
            });

            if (requiresShopifyToken)
            {
                Before += (NancyContext ctx) =>
                {
                    if (string.IsNullOrEmpty(this.SessionToken.UserId) || string.IsNullOrEmpty(this.SessionToken.ShopifyUrl))
                    {
                        return ShopifyAuthenticationRequired();
                    }

                    return null;
                };
            }

            OnError += (NancyContext ctx, Exception ex) =>
            {
                return this.Response.AsJson(new {
                    StatusCode = 500,
                    Message = ex.Message,
                    StackTrace = ex.StackTrace
                }).WithStatusCode(500);
            };
        }

        public SessionToken SessionToken { get; set; }

        /// <summary>
        /// Decodes a JWT token and returns its data.
        /// </summary>
        public SessionToken DecodeSessionToken(string tokenString)
        {
            SessionToken token = JWT.JsonWebToken.DecodeToObject<SessionToken>(tokenString, Config.JwtSecretKey, true);

            return token;
        }

        public Response InvalidTokenResponse()
        {
            return Response.AsJsonError("Missing or invalid X-SCI-Token header.", HttpStatusCode.Unauthorized);
        }

        public Response ShopifyAuthenticationRequired()
        {
            return Response.AsJsonError("Shopify OAuth integration required.", HttpStatusCode.PreconditionFailed);
        }

        /// <summary>
        /// Update's a user's JWT session token, passing it along with the response data as 'updatedSessionToken'. 
        /// </summary>
        public Response UpdateSessionToken(User userData)
        {
            return UpdateSessionToken(userData, new {});
        }

        /// <summary>
        /// Takes response data and updates the user's JWT session token, passing it along with the response data as 'updatedSessionToken'. 
        /// </summary>
        public Response UpdateSessionToken<T>(User userData, T outputData)
        {
            var data = outputData.ToDictionary();
            var token = new SessionToken(userData);

            data["updatedSessionToken"] = token.SerializeTokenString();

            return Response.AsJson(outputData);
        }
    }
}