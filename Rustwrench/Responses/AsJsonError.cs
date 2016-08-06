using Nancy;

namespace Rustwrench.Responses
{
    public static partial class NancyResponses
    {
        /// <summary>
        /// Takes a Nancy response + error message and turns it into a JSON error message.
        /// </summary>
        public static Response AsJsonError(this IResponseFormatter response, string message, HttpStatusCode statusCode = HttpStatusCode.InternalServerError, object details = null)
        {
            return response.AsJson(new {message = message, details}, statusCode);
        }
    }
}