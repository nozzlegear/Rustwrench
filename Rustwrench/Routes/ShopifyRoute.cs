using System;
using System.Linq;
using System.Text.RegularExpressions;
using Rustwrench.Infrastructure;
using Rustwrench.Models;
using ShopifySharp;
using ShopifySharp.Enums;
using Nancy;
using Nancy.ModelBinding;
using Rustwrench.Models.Requests.Sessions;

namespace Rustwrench.Routes
{
    public class ShopifyRoute : SecureRoute
    {
        public ShopifyRoute() : base("/api/v1/shopify")
        {
            // Routes for finishing a user's Shopify integration, via API or redirects.
            Post["/integrate", true] = 
            Get["/integrate", true] = async (parameters, ct) =>
            {
                string shopifyAuthCode = parameters.code;
                string myShopifyUrl = parameters.shop;

                var getUser = await Database.Users.Entities.GetAsync<User>(this.SessionToken.UserId);

                if (!getUser.IsSuccess)
                {
                    throw new Exception("User not found.");
                }

                // Complete the OAuth process and integrate the user
                var user = getUser.Content;
                var accessToken = await ShopifyAuthorizationService.Authorize(shopifyAuthCode, myShopifyUrl, Config.ShopifyApiKey, Config.ShopifySecretKey);
                var shop = await new ShopifyShopService(myShopifyUrl, accessToken).GetAsync();

                user.ShopifyAccessToken = accessToken;
                user.ShopifyUrl = myShopifyUrl;
                user.ShopId = shop.Id;
                user.ShopName = shop.Name;

                // Create an App_Uninstalled webhook if we're not running on localhost
                if (! Regex.IsMatch(Request.Url.HostName, "localhost", RegexOptions.IgnoreCase))
                {
                    var service = new ShopifyWebhookService(user.ShopifyUrl, user.ShopifyAccessToken);
                    var url = new UriBuilder(Request.Url.ToString())
                    {
                        Scheme = Uri.UriSchemeHttps, // All Shopify webhooks must be https
                        Path = "/api/v1/webhooks/app_uninstalled",
                        Query = $"shop_id={shop.Id.Value}",   
                    };

                    try
                    {
                        await service.CreateAsync(new ShopifyWebhook()
                        {
                            Address = url.ToString(),
                            Topic = ShopifyWebhookTopic.AppUninstalled,
                        });
                    }
                    catch (ShopifyException ex) when (ex.Errors.Any(e => e.Key.EqualsIgnoreCase("address") && e.Value.Any(innerError => innerError.ContainsIgnoreCase("for this topic has already been taken"))))
                    {
                        // Webhook already exists.
                    }
                }

                // Update the user
                var update = await Database.Users.Entities.PutAsync(user);

                if (!update.IsSuccess)
                {
                    throw new Exception($"Failed to save user's integration. {update.StatusCode} {update.Reason}");
                }

                return Response.WithSessionToken(user);
            };

            // Routes for activating a user's charge, via API or redirects.
            Post["/activate_charge", true] = 
            Get["/activate_charge", true] = async (parameters, ct) =>
            {
                long chargeId = parameters.charge_id;
                var getUser = await Database.Users.Entities.GetAsync<User>(this.SessionToken.UserId);

                if (!getUser.IsSuccess)
                {
                    throw new Exception("User not found.");
                }

                // Activate the charge if its status is accepted.
                var user = getUser.Content;
                var service = new ShopifyRecurringChargeService(user.ShopifyUrl, user.ShopifyAccessToken);
                var charge = await service.GetAsync(chargeId);

                if (charge.Status != ShopifyChargeStatus.Accepted)
                {
                    throw new Exception($"Charge #${charge.Id.Value} has not been accepted.");
                }

                // Update the user
                var update = await Database.Users.Entities.PutAsync(user);

                if (!update.IsSuccess)
                {
                    throw new Exception($"Failed to save user's new charge. {update.StatusCode} {update.Reason}");
                }

                return Response.WithSessionToken(user);
            };

        }
    }

    public class UnsecureShopifyRoute : NancyModule
    {
        public UnsecureShopifyRoute(): base("/api/v1/shopify")
        {
            Post["/verify_url", true] = async (parameters, ct) =>
            {
                var model = this.Bind<VerifyUrlRequest>();
                var isValid = await ShopifyAuthorizationService.IsValidMyShopifyUrl(model.Url);
                
                return Response.AsJson(new
                {
                    isValid = isValid
                });
            };

            Post["/create_authorization_url"] = (parameters) =>
            {
                var reqUrl = Request.Url;
                var permissions = new ShopifyAuthorizationScope[] 
                {
                    ShopifyAuthorizationScope.ReadOrders
                };
                var model = this.Bind<VerifyUrlRequest>();
                var url = ShopifyAuthorizationService.BuildAuthorizationUrl(permissions, model.Url, Config.ShopifyApiKey, $"{reqUrl.Scheme}://{reqUrl.HostName}:{reqUrl.Port}/api/v1/shopify/integrate");

                return Response.AsJson(new 
                {
                    url = url
                });
            };
        }
    }
}