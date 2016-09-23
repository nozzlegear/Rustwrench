using FluentValidation;

namespace Rustwrench.Models.Requests.Users
{
    public class CreateUserRequest
    {
        public string Username { get; set; }

        public string Password { get; set; }

        public string ConfirmPassword { get; set; }
    }

    public class CreateUserValidator : AbstractValidator<CreateUserRequest>
    {
        public CreateUserValidator()
        {
            RuleFor(v => v.Username).NotEmpty();
            RuleFor(v => v.Password).NotEmpty().Length(6, 100);
            RuleFor(v => v.ConfirmPassword).Equal(c => c.Password);
        }
    }
}