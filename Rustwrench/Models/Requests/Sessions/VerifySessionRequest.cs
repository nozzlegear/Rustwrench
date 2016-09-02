using FluentValidation;

namespace Rustwrench.Models.Requests.Sessions
{
    public class VerifySessionRequest
    {
        public string Token { get; set; }
    }

    public class VerifySessionRequestValidator : AbstractValidator<VerifySessionRequest>
    {
        public VerifySessionRequestValidator()
        {
            RuleFor(r => r.Token).NotEmpty();
        }
    }
}
