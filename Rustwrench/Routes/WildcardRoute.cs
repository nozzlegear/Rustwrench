using Nancy;

namespace Rustwrench.Routes
{
    public class WildcardRoute: NancyModule
    {
        public WildcardRoute()
        {
            Get["/"] =
            Get["/{uri*}"] = parameters =>
            {
                return Response.AsText($"<h1>Hello, world!</h1> You requested the {parameters.uri ?? "/"} route, but it was captured by the wildcard route. Eventually this route will activate the ReactJS SPA frontend.", "text/html");
            };
        }
    }
}