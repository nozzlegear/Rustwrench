/**
 * Attempts to deserialize an API error message from an XMLHttpRequest made by Reqwest.
 */
export default function getApiError(error: XMLHttpRequest | Error, defaultMessage: string) {
    let output = {
        message: defaultMessage,
        unauthorized: false,
        details: undefined
    };

    if (error instanceof Error) {        
        console.error(defaultMessage, error);
    }
    else {
        output.unauthorized = error.status === 401;

        try {
            const response: {message: string, details: any} = JSON.parse(error.responseText);

            output.message = response.message;
            output.details = response.details;
        }
        catch (e) {
            console.error("Error parsing response's error JSON.", e, error);

            output.message = defaultMessage;
        }
    }
     
    return output;
}