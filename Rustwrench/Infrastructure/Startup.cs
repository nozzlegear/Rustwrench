using Nancy;
using Nancy.Bootstrapper;
using System.Reflection;

namespace Rustwrench.Infrastructure
{
    /// <summary>
    /// A utility class for handling Nancy's startup procedure, typically used to wire up the OnError, OnBeforeRequest and OnAfterRequest methods.
    /// </summary>
    /// <remarks>
    /// Nancy will automatically find all classes that implement IApplicationStartup and call them when Nancy starts.
    /// </remarks>
    public class Startup : IApplicationStartup
    {
        public void Initialize(IPipelines pipelines)
        {
            pipelines.BeforeRequest += (NancyContext context) =>
            {
                // A return value of null means that no action is taken by the hook and that the request should be 
                // processed by the matching route. However, if the interceptor returns a Response of its own, the 
                // request will never be processed by a route and the response will be sent back to the client.

                return null;
            };

            pipelines.AfterRequest += (NancyContext context) =>
            {
                // The After hook does not have any return value because one has already been produced by the 
                // appropriate route. Instead you get the option to modify(or completely replace) the existing 
                // response by accessing the Response property of the NancyContext that is passed in.

                context.Response.WithHeader("X-Powered-By", $"Rustwrench {Config.AppVersion}");
                context.Response.WithHeader("X-Rustwrench-Version", Config.AppVersion);
            };
        }
    }
}