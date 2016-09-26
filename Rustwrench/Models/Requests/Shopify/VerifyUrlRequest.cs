using FluentValidation;

namespace Rustwrench.Models.Requests.Sessions
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
