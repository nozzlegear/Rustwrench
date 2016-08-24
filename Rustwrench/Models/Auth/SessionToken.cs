using System.Reflection;

namespace Rustwrench.Models
{
    /// <summary>
    /// Represents the JSON Web Token used by this app for authentication and session management.
    /// </summary>
    public class SessionToken : User
    {
        public SessionToken() { }

        /// <summary>
        /// Creates a new <see cref="SessionToken" /> from a <see cref="User" /> object.
        /// </summary>
        public SessionToken(User user)
        {
            foreach (PropertyInfo prop in user.GetType().GetProperties())
            {
                GetType().GetProperty(prop.Name).SetValue(this, prop.GetValue(user, null), null);
            }
        }

        /// <summary>
        /// Part of the JWT spec, this value is the date and time that the session is valid for in UNIX epoch seconds.
        /// </summary>
        public long exp { get; set; }
    }
}