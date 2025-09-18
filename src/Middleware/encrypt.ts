/**
 * password.utils.ts
 * -----------------------------------------------------
 * Central place for password hashing & verification.
 * Keeps our code clean and reusable.
 *
 * - hashPassword:    Encrypt a plain text password
 * - comparePassword: Verify a plain text password with a hash
 */

import bcrypt from "bcrypt";

// How many times the salt gets applied (higher = more secure but slower)
const SALT_ROUNDS = 10;

/**
 * Hashes a password using bcrypt.
 * Example: const hash = await hashPassword("mySecret123");
 */
export const hashPassword = async (plainPassword: string): Promise<string> => {
    if (!plainPassword) {
        throw new Error("Password must not be empty");
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(plainPassword, salt);
};

/**
 * Compares a candidate password with a stored hash.
 * Example: const isValid = await comparePassword("input", user.password);
 */
export const comparePassword = async (
    plainPassword: string,
    hashedPassword: string
): Promise<boolean> => {
    if (!plainPassword || !hashedPassword) {
        throw new Error("Passwords cannot be empty");
    }

    return bcrypt.compare(plainPassword, hashedPassword);
};
