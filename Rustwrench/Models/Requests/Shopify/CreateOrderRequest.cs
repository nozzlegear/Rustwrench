using FluentValidation;

namespace Rustwrench.Models.Requests.Shopify
{
    public class CreateOrderRequest
    {
        /// <summary>
        /// The customer's name.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// The customer's email address.
        /// </summary>
        public string Email { get; set; }

        public string Street { get; set; }

        public string City { get; set; }

        public string State { get; set; }

        public string Zip { get; set; }

        public string LineItem { get; set; }

        public string FinancialStatus { get; set; }

        public int Quantity { get; set; }
    }

    public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
    {
        public CreateOrderRequestValidator()
        {
            RuleFor(r => r.Name).NotEmpty();
            RuleFor(r => r.Email).EmailAddress();
            RuleFor(r => r.Street).NotEmpty();
            RuleFor(r => r.City).NotEmpty();
            RuleFor(r => r.State).NotEmpty();
            RuleFor(r => r.Zip).NotEmpty();
            RuleFor(r => r.LineItem).NotEmpty();
            RuleFor(r => r.Quantity).GreaterThanOrEqualTo(1);
        }
    }
}
