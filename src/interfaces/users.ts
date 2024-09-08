import { type User } from "./user.js";

/**
 * Represents a collection of users in the system.
 */
export interface Users {
    /**
     * An array containing individual user objects.
     */
    users: User[];
}
