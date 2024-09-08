/**
 * Represents the structure of an Email.
 */
export interface Email {
    /**
     * Unique identifier for the Email.
     */
    id: string;

    /**
     * The date and time when the Email was created.
     */
    createdDateTime: string;

    /**
     * The date and time when the Email was last modified.
     */
    lastModifiedDateTime: string;

    /**
     * Subject of the Email.
     */
    subject: string;

    /**
     * Indicates if the Email has attachments.
     * Should be a boolean, but it's defined as a string here. Consider using `boolean` type.
     */
    hasAttachments: boolean;

    /**
     * Importance level of the Email.
     * Consider defining specific importance levels or using an enum.
     */
    importance: string;

    /**
     * Indicates if the Email has been read.
     * Should be a boolean, but it's defined as a string here. Consider using `boolean` type.
     */
    isRead: boolean;

    /**
     * Indicates if the Email is a draft.
     * Should be a boolean, but it's defined as a string here. Consider using `boolean` type.
     */
    isDraft: boolean;

    /**
     * The date and time when the Email was received.
     */
    receivedDateTime: string;

    /**
     * The flag status of the Email.
     */
    flag: string;

    /**
     * Unique identifier for the user associated with the Email.
     */
    userId: string;
}
