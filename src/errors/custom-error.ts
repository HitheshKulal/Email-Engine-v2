/**
 * A custom API error class that extends the base Error class.
 */
export class CustomAPIError extends Error {
    /**
     * The HTTP status code associated with the error.
     */
    statusCode: number;

    /**
     * Creates a new CustomAPIError.
     * @param {string} message - The error message.
     * @param {number} statusCode - The HTTP status code associated with the error.
     */
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

/**
 * Creates a custom API error.
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code associated with the error.
 * @returns {CustomAPIError} A custom API error instance.
 */
export const createCustomError = (
    message: string,
    statusCode: number,
): CustomAPIError => {
    return new CustomAPIError(message, statusCode);
};