using System;
using System.Linq;
using System.Text.RegularExpressions;
using Rustwrench.Infrastructure;
using Rustwrench.Models;
using ShopifySharp;
using ShopifySharp.Enums;
using Nancy;
using Nancy.ModelBinding;
using Rustwrench.Models.Requests.Shopify;
using Nancy.Validation;

namespace Rustwrench.Routes
{
    public class ShopifyRoute : SecureRoute
    {
        public ShopifyRoute() : base("/api/v1/shopify")
        {
            Post["/authorize", true] = async (parameters, ct) =>
            {
                var model = this.BindAndValidate<AuthorizeRequest>();
                
                if (!ModelValidationResult.IsValid)
                {
                    return Response.AsJsonError("Request did not pass validation.", HttpStatusCode.NotAcceptable, ModelValidationResult.FormattedErrors);
                }

                var getUser = await Database.Users.Entities.GetAsync<User>(SessionToken.UserId);

                if (!getUser.IsSuccess)
                {
                    return Response.AsJsonError("Could not find user in database.", HttpStatusCode.NotFound);
                }

                // Complete the OAuth process and integrate the user
                var user = getUser.Content;
                string accessToken;

                try
                {
                    accessToken = await ShopifyAuthorizationService.Authorize(model.Code, model.ShopUrl, Config.ShopifyApiKey, Config.ShopifySecretKey);
                }
                catch (ShopifyException e) when (e.JsonError.ContainsIgnoreCase("authorization code was not found or was already used"))
                {
                    return Response.AsJsonError("Integration failed: the authorization code was not found or was already used.", HttpStatusCode.BadRequest);
                }

                var shop = await new ShopifyShopService(model.ShopUrl, accessToken).GetAsync();

                user.ShopifyAccessToken = accessToken;
                user.ShopifyUrl = model.ShopUrl;
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
                            Topic = "app/uninstalled",
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
                    throw new Exception($"Failed to save user's integration. {(int)update.StatusCode} {update.Reason}");
                }

                return Response.WithSessionToken(user);
            };

            Post["/activate_charge", true] = async (parameters, ct) =>
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

                if (charge.Status != "accepted")
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

            Post["/create_authorization_url"] = (parameters) =>
            {
                var permissions = new ShopifyAuthorizationScope[] 
                {
                    ShopifyAuthorizationScope.ReadOrders
                };
                var model = this.Bind<CreateAuthorizationUrlRequest>();
                var url = ShopifyAuthorizationService.BuildAuthorizationUrl(permissions, model.Url, Config.ShopifyApiKey, model.RedirectUrl);

                return Response.AsJson(new 
                {
                    url = url
                });
            };
        }
    }

    public class UnsecureShopifyRoute : NancyModule
    {
        public UnsecureShopifyRoute(): base("/api/v1/shopify")
        {
            Post["/verify_url", true] = async (parameters, ct) =>
            {
                var model = this.BindAndValidate<VerifyUrlRequest>();
                
                if (!ModelValidationResult.IsValid)
                {
                    return Response.AsJsonError("Request did not pass validation.", HttpStatusCode.NotAcceptable, ModelValidationResult.FormattedErrors);
                }
                
                var isValid = await ShopifyAuthorizationService.IsValidMyShopifyUrl(model.Url);
                
                return Response.AsJson(new
                {
                    isValid = isValid
                });
            };

        }
    }
}