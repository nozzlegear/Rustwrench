using Nancy;
using ShopifySharp;
using Nancy.ModelBinding;
using System;

namespace Rustwrench.Routes
{
    public class WebhooksRoute : NancyModule
    {
        public WebhooksRoute() : base("/api/v1/webhooks")
        {
            Get["/app_uninstalled", true] = async (parameters, ct) =>
            {
                var shop = this.Bind<ShopifyShop>();
                var user = await Database.Users.GetByShopIdAsync(shop.Id.Value);

                if (user == null)
                {
                    // Sometimes the AppUninstalled webhook gets sent more than once. If that's the case, 
                    // searching for the user will return null (because their shop id was deleted).
                    // When that happens, return 200 OK or Shopify will continue retrying this endpoint.
                    return Response.AsJson(new { message = "User not found. Returning 200 ok." });
                }

                // The user's Shopify access token has already been invalidated by this point. No further
                // API calls are possible with their token, so we delete it and their Shopify data.
                user.ShopifyAccessToken = null;
                user.ShopifyChargeId = null;
                user.ShopifyUrl = null;
                user.ShopName = null;
                user.ShopId = null;

                var update = await Database.Users.Entities.PutAsync(user);
                
                if (!update.IsSuccess)
                {
                    throw new Exception($"Failed to save user's app removal changes. Their shop id was {shop.Id.Value} Database responded with {update.StatusCode} {update.Reason}");
                }

                // TODO: Will need some way to invalidate current the user's current JWT token. Refer to Gearworks
                // for working implementation.
                
                return Response.AsJson(new { });
            };
        }
    }
}