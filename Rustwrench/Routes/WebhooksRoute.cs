using Nancy;
using ShopifySharp;
using Nancy.ModelBinding;

namespace API.Routes
{
    public class WebhooksRoute : NancyModule
    {
        public WebhooksRoute() : base("/api/v1/webhooks")
        {
            Get["/app_uninstalled", true] = async (parameters, ct) =>
            {
                var shop = this.Bind<ShopifyShop>();

                // TODO: Find the user by their ShopId and delete their shop data. 
                // Will need some way to invalidate current the user's current JWT token.
                
                return Response.AsJson(new { });
            };
        }
    }
}