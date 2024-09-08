import { Email } from "./email.js";

/**
 * Represents a collection of emails in the system.
 */
export interface Emails {
    /**
     * An array containing individual email objects.
     */
    emails: Email[];
}
