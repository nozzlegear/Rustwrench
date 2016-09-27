using FluentValidation;

namespace Rustwrench.Models.Requests.Shopify
{
    public class CreateAuthorizationUrlRequest
    {
        public string Url { get; set; }

        public string RedirectUrl { get; set; }
    }

    public class CreateAuthorizationUrlRequestValidator : AbstractValidator<CreateAuthorizationUrlRequest>
    {
        public CreateAuthorizationUrlRequestValidator()
        {
            RuleFor(r => r.Url).NotEmpty();
            RuleFor(r => r.RedirectUrl).NotEmpty();
        }
    }
}
