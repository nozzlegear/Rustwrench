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
using System.Collections.Generic;

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
                user.Permissions = Config.ShopifyPermissions;

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
                var model = this.Bind<CreateAuthorizationUrlRequest>();
                var url = ShopifyAuthorizationService.BuildAuthorizationUrl(Config.ShopifyPermissions, model.Url, Config.ShopifyApiKey, model.RedirectUrl);

                return Response.AsJson(new 
                {
                    url = url
                });
            };

            Get["/orders", true] = async (parameters, ct) =>
            {
                int? limit = Request.Query.limit;
                int? page = Request.Query.page;
                var service = new ShopifyOrderService(SessionToken.ShopifyUrl, SessionToken.ShopifyAccessToken);
                var orders = await service.ListAsync(new ShopifySharp.Filters.ShopifyOrderFilter()
                {
                    Limit = limit,
                    Page = page,
                });

                return Response.AsJson(orders);
            };

            Post["/orders", true] = async (parameters, ct) =>
            {
                var model = this.BindAndValidate<CreateOrderRequest>();
                
                if (!ModelValidationResult.IsValid)
                {
                    return Response.AsJsonError("Request did not pass validation.", HttpStatusCode.NotAcceptable, ModelValidationResult.FormattedErrors);
                }

                var service = new ShopifyOrderService(SessionToken.ShopifyUrl, SessionToken.ShopifyAccessToken);
                var order = await service.CreateAsync(new ShopifyOrder()
                {
                    CreatedAt = DateTime.UtcNow,
                    BillingAddress = new ShopifyAddress()
                    {
                        Address1 = model.Street,
                        City = model.City,
                        Province = model.State,
                        //ProvinceCode = "MN",
                        Zip = model.Zip,
                        Name = model.Name,
                        CountryCode = "US",
                        Default = true,
                    },
                    LineItems = new List<ShopifyLineItem>()
                    {
                        new ShopifyLineItem()
                        {
                            Name = model.LineItem,
                            Title = model.LineItem,
                            Quantity = model.Quantity,
                            Price = 5,
                        },
                    },
                    FinancialStatus = "authorized",
                    Email = model.Email,
                });

                return Response.AsJson(order);
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