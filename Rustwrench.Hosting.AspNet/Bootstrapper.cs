namespace Rustwrench.Hosting.AspNet
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
            var ct = new CancellationToken();

            var task = Task.Run(async () =>
            {
                await Startup.ConfigureAsync(null, ct);
            });

            task.ConfigureAwait(false);
            task.Wait();
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