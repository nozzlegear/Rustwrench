using FluentValidation;
using Nancy.Helpers;
using ShopifySharp;

namespace Rustwrench.Models.Requests.Shopify
{
    public class AuthorizeRequest
    {
        public string Code { get; set; }

        public string ShopUrl { get; set; }

        public string FullQueryString { get; set; }
    }

    public class AuthorizeRequestValidator : AbstractValidator<AuthorizeRequest>
    {
        public AuthorizeRequestValidator()
        {
            RuleFor(r => r.Code).NotEmpty();
            RuleFor(r => r.ShopUrl).NotEmpty();
            RuleFor(r => r.FullQueryString).NotEmpty();
            RuleFor(r => r.FullQueryString).Must((qs) =>
            {
                var kvps = HttpUtility.ParseQueryString(qs);

                return ShopifyAuthorizationService.IsAuthenticRequest(kvps, Config.ShopifySecretKey);
            }).WithMessage("Request did not pass Shopify's validation scheme.");
        }
    }
}
