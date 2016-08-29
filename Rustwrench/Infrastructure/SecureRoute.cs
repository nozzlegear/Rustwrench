using Nancy;
using System;
using System.Linq;
using Rustwrench.Models;

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

                    return Response.InvalidToken();
                }

                var header = ctx.Request.Headers[headerName].FirstOrDefault();

                try
                {
                    var token = this.DecodeSessionToken(header);
                    this.SessionToken = token;
                }
                catch (JWT.SignatureVerificationException)
                {
                    return Response.InvalidToken();                
                }
                catch (Exception e)
                {
                    Console.WriteLine("JWT Deserialization exception: " +  e.Message);

                    return Response.InvalidToken();
                }

                return null;
            });

            if (requiresShopifyToken)
            {
                Before += (NancyContext ctx) =>
                {
                    if (string.IsNullOrEmpty(this.SessionToken.UserId) || string.IsNullOrEmpty(this.SessionToken.ShopifyUrl))
                    {
                        return Response.ShopifyAuthenticationRequired();
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
    }
}