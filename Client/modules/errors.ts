/**
 * Attempts to deserialize an API error message from an XMLHttpRequest made by Reqwest.
 */
export default function getApiError(error: Error | Response, bodyText: string, defaultMessage: string) {
    let output = {
        message: defaultMessage,
        unauthorized: false,
        details: undefined
    };

    if (error instanceof Error) {
        console.error(error.message, error);
    } else {
        output.unauthorized = error.status === 401;

        try {
            const response: {message: string, details: {key: string, errors: string[]}[] } = JSON.parse(bodyText);

            output.message = Array.isArray(response.details) ? response.details.map(e => e.errors.join(", ")).join(", ") : response.message;
            output.details = response.details;

            console.log(response.message, response.details, error);
        } catch (e) {
            console.error("Could not parse response's error JSON.", e, error, bodyText);

            output.message = defaultMessage;
        }
    }

    return output;
}