namespace Rustwrench
{
    using Infrastructure;
    using Nancy;
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using Nancy.Bootstrapper;
    using Nancy.TinyIoc;

    public class Bootstrapper : DefaultNancyBootstrapper
    {
        // The bootstrapper enables you to reconfigure the composition of the framework,
        // by overriding the various methods and properties.
        // For more information https://github.com/NancyFx/Nancy/wiki/Bootstrapper
        public Bootstrapper()
        {
            var task = Task.Run(async () =>
            {
                await Database.ConfigureAsync();
            });

            task.ConfigureAwait(false);
            task.Wait();
        }

        protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
        {
            base.ApplicationStartup(container, pipelines);

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

        protected override IRootPathProvider RootPathProvider
        {
            get
            {
                return new Nancy.Hosting.Aspnet.AspNetRootPathProvider();
            }
        }
    }
}