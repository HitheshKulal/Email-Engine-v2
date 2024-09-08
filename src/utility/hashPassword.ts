import bcrypt from "bcrypt";

/**
 * Hashes a password using bcrypt with a generated salt.
 * @param password - The password to be hashed.
 * @returns A Promise that resolves to the hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = Number(process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};