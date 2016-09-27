using FluentValidation;

namespace Rustwrench.Models.Requests.Shopify
{
    public class VerifyUrlRequest
    {
        public string Url { get; set; }
    }

    public class VerifyUrlRequestValidator : AbstractValidator<VerifyUrlRequest>
    {
        public VerifyUrlRequestValidator()
        {
            RuleFor(r => r.Url).NotEmpty();
        }
    }
}
