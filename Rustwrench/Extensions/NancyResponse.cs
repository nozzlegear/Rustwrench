using Nancy;

namespace Rustwrench
{
    public static class NancyResponseExtensions
    {
        /// <summary>
        /// Takes a Nancy response + error message and turns it into a JSON error message.
        /// </summary>
        public static Response AsJsonError(this IResponseFormatter response, string message, HttpStatusCode statusCode, object details = null)
        {
            return response.AsJson(new {message = message, details}, statusCode);
        }
    }
}