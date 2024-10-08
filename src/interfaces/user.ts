
/**
 * Represents the structure of a user in the system.
 */
export interface User {
    /**
     * Unique identifier for the user.
     */
    id: string;
    /**
     * The name of the user.
     */
    name: string;
    /**
     * The email address of the user.
     */
    email: string;
    /**
     * The hashed password of the user.
     */
    password: string;
    /**
    * The access token associated with the user.
    */
    accessToken: string;
    /**
     * The refresh token associated with the user for token refresh.
     */
    refreshToken: string;

    outlookAccessTocken: String;

    outlookRefreshTocken: String;

    outlookMailCount?: number;

}