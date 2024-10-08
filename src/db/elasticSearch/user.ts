import { type NextFunction, type Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { User } from "../../interfaces/user.js";
import client from "../elasticSearch/connection.js";
import { asyncWrapper } from '../../utility/async-wrapper.js';
import { AuthenticatedRequest } from '../../middlewares/authentication.js';
import { EmailManagerInterface } from "../../interfaces/EmailManagerInterface.js";

// Define types for user


export class EmailManager implements EmailManagerInterface {
    private static instance: EmailManager

    private constructor() {
        this.initializeIndex();
    }

    static getInstance(): EmailManager {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new EmailManager();
        return this.instance;
    }

    async initializeIndex() {
        await client.indices.create({ index: 'users' });
        await client.indices.create({ index: 'emails' });
    }

    async indexDocumentUser(user: User): Promise<void> {
        const id = uuidv4();
        console.log(id)
        console.log(user?.name)
        console.log(user?.password)
        const response = await client.index({
            index: "users",
            id: id,
            body: {
                name: user?.name,
                password: user?.password,
            },
            refresh: true // Ensure the document is searchable immediately
        })
        console.log('Document indexed successfully:', response);
    }

    async searchUserIndex(username: String): Promise<[]> {
        const response = await client.search({
            index: 'users', // Ensure the index name is correct
            body: {
                query: {
                    match: { name: username } // Match query for the 'name' field
                }
            }
        });
        return response.body.hits.hits;
    }

    async searchUserIndexByName(username: String): Promise<[]> {
        const response = await client.search({
            index: 'users',
            body: {
                query: {
                    match: { name: name }
                }
            }
        }, {
            ignore: [404],
            maxRetries: 3
        });

        // Extract the hits (search results) from the response
        const hits = response.body.hits.hits.map((hit: any) => hit._source);

        return hits;
    }


    // /**
    //  * Finds a user by their user ID.
    //  * @param userId - The unique identifier of the user.
    //  * @returns A promise that resolves with the user.
    //  */
    // async findUserById(userId: string): Promise<User> {
    //     await this.db.read();
    //     return this.db.data.users.find((user) => user.userId === userId)!;
    // }

    // /**
    //  * Validates a Email item against the defined schema.
    //  * @param {Email} Email - The Email item to be validated.
    //  * @returns Promise that resolves to Email object.
    //  */
    // async validateEmail(Email: Email): Promise<Email> {
    //     const validatedEmail = EmailSchema.parse(Email);
    //     return validatedEmail;
    // }

    // /**
    //  * Retrieves all the IDs of existing Email items.
    //  * @returns  A Promise that resolves to an array of Email IDs.
    //  */
    // async getAllEmailIds(userID: string): Promise<number[]> {
    //     await this.db.read();
    //     const user = await this.findUserById(userID);
    //     const EmailIds = user.Emails.map((Email) => Email.id);
    //     return EmailIds;
    // }

    // /**
    //  * Creates a new Email item and adds it to the database.
    //  * @param {Email} newEmail - The new Email item to be created.
    //  * @returns A promise that resolves to true if the Email was created successfully or false if the ID already exists.
    //  */
    // async createEmail(userID: string, newEmail: Email): Promise<Email> {
    //     await this.db.read();
    //     const user = await this.findUserById(userID);
    //     user.Emails.push(newEmail);
    //     await this.db.write();
    //     return newEmail;
    // }

    // /**
    //  * Retrieve a subset of Emails from the database.
    //  * @param startIndex - The start index for selecting Emails.
    //  * @param endIndex  -  The end index for selecting Emails.
    //  * @returns A promise that resolves with an array of selected Emails.
    //  */
    // async getEmails(
    //     userID: string,
    //     startIndex: number,
    //     endIndex: number,
    // ): Promise<Email[]> {
    //     await this.db.read();
    //     const user = await this.findUserById(userID);
    //     const allEmails = user.Emails;
    //     const selectedEmails = allEmails.slice(startIndex, endIndex);
    //     return selectedEmails;
    // }

    // /**
    //  * Retrieve a Email item by its ID from the database.
    //  * @param EmailId - The unique identifier of the Email item to retrieve.
    //  * @returns  A Promise that resolves with the Email item if found, or undefined if not found.
    //  */
    // async getEmail(userID: string, EmailId: number): Promise<Email> {
    //     await this.db.read();
    //     const user = await this.findUserById(userID);
    //     const Email = user.Emails.find((Email) => Email.id === EmailId) as Email;
    //     return Email;
    // }

    // /**
    //  * Checks if a Email with the specified ID exists in the database.
    //  * @param EmailId - The ID of the Email to check for existence.
    //  * @returns  A Promise that resolves to a boolean indicating whether the Email with the given ID exists.
    //  *
    //  */
    // async idExist(userID: string, EmailId: number): Promise<boolean> {
    //     await this.db.read();
    //     const user = await this.findUserById(userID);
    //     const Email = user.Emails.find((Email) => Email.id === EmailId);
    //     return !!Email;
    // }

    // /**
    //  * Update a Email item in the database with the specified ID.
    //  * @param {number} EmailId - The ID of the Email item to update.
    //  * @param {Email} Email - The updated Email item with new values.
    //  * @returns A promise that resolves with the updated Email item ,if the update is successfu  or null if the specified ID is not found.
    //  */
    // async updateEmail(userID: string, EmailId: number, Email: Email): Promise<Email> {
    //     await this.db.read();
    //     const user = await this.findUserById(userID);
    //     const EmailToUpdate = user.Emails.find(
    //         (dbEmail) => dbEmail.id === EmailId,
    //     ) as Email;

    //     EmailToUpdate.title = Email.title;
    //     EmailToUpdate.description = Email.description;
    //     EmailToUpdate.dueDate = Email.dueDate;
    //     EmailToUpdate.completed = Email.completed;
    //     EmailToUpdate.updatedAt = Email.updatedAt;
    //     await this.db.write();
    //     return EmailToUpdate;
    // }

    // /**
    //  * Delete a Email item from the database.
    //  * @param EmailId - The ID of the Email item to be deleted.
    //  * @returns  A Promise that resolves when the deletion is completed.
    //  */
    // async deleteEmail(userID: string, EmailId: number): Promise<void> {
    //     await this.db.read();
    //     const user = await this.findUserById(userID);
    //     const indexTodelete = user.Emails.findIndex((Email) => Email.id === EmailId);
    //     user.Emails.splice(indexTodelete, 1);
    //     await this.db.write();
    // }

    // /**
    //  * Validates a user against a predefined schema.
    //  * @param user - The user to be validated.
    //  * @returns A promise that resolves with the validated user if the validation is successful.
    //  */
    // async validateUser(user: User): Promise<User> {
    //     const validatedUser = userSchema.parse(user);
    //     return validatedUser;
    // }

    // /**
    //  * Creates a new user and adds it to the database
    //  * @param user - The new user to be created.
    //  * @returns A promise that resolves with the created user if the creation is successful.
    //  */
    // async createUser(
    //     user: User,
    // ): Promise<Omit<User, "userPassword" | "Emails" | "refreshToken">> {
    //     await this.db.read();
    //     user.userPassword = await hashPassword(user.userPassword);
    //     this.db.data.users.push(user);
    //     await this.db.write();
    //     const createdUser = {
    //         userId: user.userId,
    //         userName: user.userName,
    //         userEmail: user.userEmail,
    //     };
    //     return createdUser;
    // }

    // /**
    //  * Retrieves a user by their email address.
    //  * @param email - The email address of the user to retrieve.
    //  * @returns A promise that resolves with the user if found, or undefined if not found.
    //  */
    // async getUser(email: string): Promise<User | undefined> {
    //     await this.db.read();
    //     const user = this.db.data.users.find((user) => user.userEmail === email);
    //     await this.db.write();
    //     return user;
    // }

    // /**
    //  * Adds a refresh token to a user's record.
    //  * @param userID - The unique identifier of the user.
    //  * @param refreshToken - The refresh token to be added.
    //  * @returns A promise that resolves when the refresh token is successfully added.
    //  */
    // async addRefreshToken(userID: string, refreshToken: string): Promise<void> {
    //     await this.db.read();
    //     const user = await this.findUserById(userID);
    //     user.refreshToken = refreshToken;
    //     await this.db.write();
    // }

    // /**
    // * Adds a refresh token to a user's record.
    // * @param userID - The unique identifier of the user.
    // * @param accessToken - The refresh token to be added.
    // * @returns A promise that resolves when the refresh token is successfully added.
    // */
    // async addAccessToken(userID: string, accessToken: string): Promise<void> {
    //     await this.db.read();
    //     const user = await this.findUserById(userID);
    //     user.accessToken = accessToken;
    //     await this.db.write();
    // }



    // /**
    //  * Retrieves the initial state of the database.
    //  * @returns the nitial state of the database.
    //  */
    // async getinitialDBstate(): Promise<Users> {
    //     try {
    //         await this.db.read();
    //         const initialState = this.db.data;
    //         return initialState;
    //     } catch (error) {
    //         throw new Error("Failed to retrieve the initial database state.");
    //     }
    // }

    // /**
    //  * Resets the database to the provided initial state.
    //  * @param initialState - The initial state to reset the database to.
    //  */
    // async resetDBToInitialState(initialState: Users): Promise<void> {
    //     try {
    //         await this.db.read();
    //         this.db.data = initialState;
    //         await this.db.write();
    //     } catch (error) {
    //         throw new Error("Failed to reset the database to the initial state.");
    //     }
    // }

}
// Function to create indices
const createUserIndex = async (): Promise<void> => {
    const userIndex = await client.indices.create({ index: 'users' });
    const emailIndex = await client.indices.create({ index: 'emails' });
    await syncEmails();
    console.log('User Index created successfully:');
    console.log('Emails Index created successfully:');
};

// Function to sync emails (currently empty)
const syncEmails = async (): Promise<void> => {
    // Implement syncEmails logic here
};

// Function to index a user document
const indexDocumentUser = async (user: User): Promise<void> => {
    const id = uuidv4();
    const response = await client.index({
        index: 'users',
        id: id,
        body: {
            name: user.name,
            password: user?.password,
        },
        refresh: true // Ensure the document is searchable immediately
    });
    console.log('Document indexed successfully:', response);
};

// Function to search for a user by username
const searchUserIndex = async (username: string): Promise<any[]> => {
    const response = await client.search({
        index: 'users', // Ensure the index name is correct
        body: {
            query: {
                match: { name: username } // Match query for the 'name' field
            }
        }
    });
    return response.body.hits.hits; // Correctly access the search hits
};

// Function to initialize Elasticsearch setup
const initializeElasticsearch = async (): Promise<void> => {
    await createUserIndex();
    console.log('Elasticsearch setup complete');
};

// Function to search for a user by name with additional options
const searchUserIndexByName = async (name: string): Promise<any[]> => {
    const response = await client.search({
        index: 'users',
        body: {
            query: {
                match: { name: name }
            }
        }
    }, {
        ignore: [404],
        maxRetries: 3
    });

    // Extract the hits (search results) from the response
    const hits = response.body.hits.hits.map((hit: any) => hit._source);

    return hits; // This returns an array of documents (_source fields)
};


// Export the client and functions
export {
    initializeElasticsearch,
    searchUserIndex,
    indexDocumentUser,
    searchUserIndexByName
};
