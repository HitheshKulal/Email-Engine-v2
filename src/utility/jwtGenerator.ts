import jwt, { type Secret } from "jsonwebtoken";
import { EmailManager } from "../model/EmailManager";
// import { UserAuthenticationManager } from "../model/authenticationModel.js";

/**
 * Generates an access JWT for a given user ID.
 * @param id - The user ID for whom the access JWT is generated.
 * @returns  The generated access JWT.
 */
export const accessJWTGenerator = (id: string): string => {
    const jwtSecret = process.env.JWT_ACCESS_SECRET as Secret;
    return jwt.sign({ id: id }, jwtSecret, {
        expiresIn: process.env.JWT_ACCSESS_LIFETIME,
    });
};

/**
 * Generates a refresh JWT for a given user ID.
 * @param id - The user ID for whom the refresh JWT is generated.
 * @returns The generated refresh JWT.
 */
export const refreshJWTGenerator = (id: string): string => {
    const jwtSecret = process.env.JWT_REFRESH_SECRET as Secret;
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: process.env.JWT_REFRESH_LIFETIME,
    });
};

/**
 * Generates an access JWT and a refresh JWT for a given user ID.
 * @param email- The user ID for whom the tokens are generated.
 * @returns  A Promise that resolves to an object containing the access and refresh tokens.
 */
export const generateAccessTokenAndRefreshToken = async (
    id: string,
): Promise<{
    accessToken: string;
    refreshToken: string;
}> => {
    const accessToken = accessJWTGenerator(id);
    const refreshToken = refreshJWTGenerator(id);
    const emailManager = EmailManager.getInstance();
    // await emailManager.addRefreshToken(id, refreshToken);
    await emailManager.addAcessAndRefreshToken(id, accessToken, refreshToken)
    return { accessToken, refreshToken };
};
