import bcrypt from "bcrypt";

/**
 * Compares a user-provided password with a hashed password using bcrypt.
 * @param userProvidedPassword - The password provided by the user for comparison.
 * @param hashedPassword - The hashed password stored in the database.
 * @returns - A Promise that resolves to true if the passwords match, and false otherwise.
 */
export const comparePassword = async (
    userProvidedPassword: string,
    hashedPassword: string,
): Promise<boolean> => {
    return await bcrypt.compare(userProvidedPassword, hashedPassword);
};