import z from "zod";
import { v4 as uuidv4 } from "uuid";

export const userSchema = z.object({
    /**
     * User ID property with a default value generated using uuidv4.
     */
    userId: z.string().default(() => uuidv4()),
    /**
     * User name property with a maximum length of 10 characters.
     */
    userName: z
        .string()
        .max(10, { message: "UserName must contain at most 10 character(s)" }),
    /**
     * User email property validated for the correct email format.
     */
    userEmail: z.string().email(),
    /**
     *  User password property with a minimum length of 8 characters.
     */
    userPassword: z
        .string()
        .min(8, { message: "Password must contain at least 8 character(s)" }),
    /**
     * User todos property representing an array of todos, defaulting to an empty array.
     */
    /**
     * Refresh token property with a default empty string value.
     */
    refreshToken: z.string().default(""),
});