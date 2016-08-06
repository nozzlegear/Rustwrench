using System;
using Rustwrench.Infrastructure;

namespace Rustwrench.Routes
{
    public class UsersRoute : ApiNancyModule
    {
        public UsersRoute() : base ("/api/v1/users", false)
        {
            Post["", true] = (parameters, ct) =>
            {
                // TODO: Create a new user

                throw new NotImplementedException();
            };
        }
    }
}