using System;
using Nancy;
using Nancy.Validation;
using Nancy.ModelBinding;
using Rustwrench.Models.Requests.Sessions;
using Crypto = BCrypt.Net.BCrypt;
using Rustwrench.Models;

namespace Rustwrench.Routes
{
    public class SessionsRoute : NancyModule
    {
        // Auth is not required for this route.
        public SessionsRoute() : base("/api/v1/sessions")
        {
            // Creates a new session
            Post["", true] = async (parameters, ct) =>
            {
                var model = this.BindAndValidate<CreateSessionRequest>();

                if (!ModelValidationResult.IsValid)
                {
                    return Response.AsJsonError("Request did not pass validation.", HttpStatusCode.NotAcceptable, ModelValidationResult.FormattedErrors);
                }

                // Ensure the username is correct
                var user = await Database.Users.Entities.GetAsync<User>(model.Username.ToLower());

                if ((int) user.StatusCode == 404)
                {
                    return Response.AsJsonError("Username not found.", HttpStatusCode.Unauthorized);
                }

                if (! Crypto.Verify(model.Password, user.Content.HashedPassword))
                {
                    return Response.AsJsonError("Password is incorrect.", HttpStatusCode.Unauthorized);
                }

                // Create a JWT that expires in 30 days
                return Response.WithSessionToken(user.Content);
            };

            Post["/verify"] = (parameters) =>
            {
                var model = this.Bind<VerifySessionRequest>();

                if (!ModelValidationResult.IsValid)
                {
                    return Response.AsJsonError("Request did not pass validation.", HttpStatusCode.NotAcceptable, ModelValidationResult.FormattedErrors);
                }

                try
                {
                    SessionToken token = JWT.JsonWebToken.DecodeToObject<SessionToken>(model.Token, Config.JwtSecretKey, true);

                    return Response.AsJson(token);
                }
                catch (JWT.SignatureVerificationException)
                {
                    // Exception is thrown when the token has expired or does not verify.
                }
                catch (Exception e)
                {
                    Console.WriteLine("JWT deserialization exception: " +  e.Message);
                }

                return Response.AsJsonError("Session token has expired or is invalid.", HttpStatusCode.Unauthorized);
            };
        }
    }
}