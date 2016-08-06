using Nancy;
using System;
using System.Linq;

namespace Rustwrench.Security
{
    public static class NancyModuleSecurityExtensions
    {
        const string HeaderName = "X-Rustwrench-API-Key";

        public static void RequiresApiKey(this NancyModule module)
        {
            module.Before.AddItemToEndOfPipeline(ctx => 
            {
                var header = ctx.Request.Headers.FirstOrDefault(h => h.Key.Equals(HeaderName, StringComparison.OrdinalIgnoreCase));

                if (string.IsNullOrEmpty(header.Key) || header.Value.All(h => h != Config.SciApiKey))
                {
                    return module.Response.AsJsonError("Missing valid X-Rustwrench-Api-Key header.", HttpStatusCode.Unauthorized);
                }

                return null;
            });
        }
    }
}