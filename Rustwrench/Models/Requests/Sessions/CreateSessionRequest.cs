using FluentValidation;

namespace Rustwrench.Models.Requests.Sessions
{
    public class CreateSessionRequest
    {
        public string Username { get; set; }

        public string Password { get; set; }
    }

    public class CreateSessionRequestValidator : AbstractValidator<CreateSessionRequest>
    {
        public CreateSessionRequestValidator()
        {
            RuleFor(r => r.Username).NotEmpty();
            RuleFor(r => r.Password).NotEmpty();
        }
    }
}