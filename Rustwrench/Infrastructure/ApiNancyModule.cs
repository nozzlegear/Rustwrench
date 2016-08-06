using Nancy;
using System;
using MyCouch;
using Rustwrench.Security;

namespace Rustwrench.Infrastructure
{
    /// <summary>
    /// A base Nancy module for the API, which wires up database connections and implements security.
    /// </summary>
    public class ApiNancyModule : NancyModule
    {
        public ApiNancyModule() : base() { }

        public ApiNancyModule(string pathname = "", bool requireApiKey = false) : base (pathname)
        {
            if (requireApiKey)
            {
                this.RequiresApiKey();
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

        public MyCouchClient Users { get; } = new MyCouchClient("http://localhost:5984", "users");
    }
}