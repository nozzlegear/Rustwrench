using System;
using Nancy;
using Nancy.ModelBinding;
using Nancy.Validation;
using Crypto = BCrypt.Net.BCrypt;
using Rustwrench.Models;
using Rustwrench.Models.Requests.Users;

namespace Rustwrench.Routes
{
    public class UsersRoute : NancyModule
    {
        public UsersRoute() : base ("api/v1/users")
        {
            Post["/", true] = async (parameters, ct) =>
            {
                var req = this.Bind<CreateUserRequest>();
                var validation = this.Validate(req);

                if (! validation.IsValid)
                {
                    return Response.AsJsonError("Request did not pass validation.", HttpStatusCode.NotAcceptable, validation.FormattedErrors);
                }

                // Check if the user already exists
                if ((await Database.Users.Documents.HeadAsync(req.Username.ToLower())).IsSuccess)
                {
                    return Response.AsJsonError("A user with that email address already exists.", HttpStatusCode.NotAcceptable);
                }
                
                var password = Crypto.HashPassword(req.Password);
                var user = new User()
                {
                    UserId = req.Username.ToLower(),
                    HashedPassword = password,
                };

                var create = await Database.Users.Entities.PutAsync(user);

                if (!create.IsSuccess)
                {
                    throw new Exception($"Failed to create new user. The database responsed with {create.StatusCode} {create.Reason}");
                }

                // Create and return a session token for the client
                return Response.WithSessionToken(user);
            };
        }
    }
}