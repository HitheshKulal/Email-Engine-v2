import { v4 as uuidv4 } from 'uuid';
import { User } from "../interfaces/user.js";
import { Email } from "../interfaces/email.js";
import client from "../db/elasticSearch/connection.js";
import { EmailManagerInterface } from "../interfaces/EmailManager.js";
import { hashPassword } from "../utility/hashPassword.js";
import fetch from "../utility/fetch.js";
import { any } from "zod";



export class EmailManager implements EmailManagerInterface {
    private static instance: EmailManager
    private static outlookMailURL = process.env.OUTLOOK_MAIL_URL;
    private static mailCount = 0;


    private constructor() {
        // this.initializeIndex();
    }

    static getInstance(): EmailManager {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new EmailManager();
        return this.instance;
    }

    async initializeIndex(): Promise<void> {
        try {
            await client.indices.create({ index: 'users' });
            await client.indices.create({ index: 'emails' });
            console.log('Indices initialized successfully.');
        } catch (error) {
            console.error('Error initializing indices');
            // throw error; // Re-throw the error to be handled by the wrapper
        }
    }

    async indexUser(user: User): Promise<void> {
        const id = uuidv4();
        console.log(id)
        console.log(user?.name)
        console.log(user?.password)
        user.password = await hashPassword(user.password)
        const response = await client.index({
            index: "users",
            id: id,
            body: {
                email: user?.email,
                password: user?.password,
            },
            refresh: true // Ensure the document is searchable immediately
        })
        console.log('Document indexed successfully:', response);

    }

    async searchUserIndexByEmail(email: String): Promise<any[]> {
        const response = await client.search({
            index: 'users', // Ensure the index name is correct
            body: {
                query: {
                    match: { email: email } // Match query for the 'name' field
                }
            }
        });
        return response.body.hits.hits;
    }

    async searchUserIndexById(id: String): Promise<any[]> {
        const response = await client.search({
            index: 'users', // Ensure the index name is correct
            body: {
                query: {
                    match: { _id: id } // Match query for the 'name' field
                }
            }
        });
        return response.body.hits.hits;
    }

    async searchUserIndexByName(email: String): Promise<[]> {
        const response = await client.search({
            index: 'users',
            body: {
                query: {
                    match: { name: email }
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

    async syncOutlookMails(userId: string): Promise<void> {
        const user = await this.searchUserIndexById(userId);
        console.log(user)
        console.log(JSON.stringify(user[0]._source.outlookAccessToken))
        if (!user[0]._source.outlookAccessTocken) {
            await this.processAndIndexEmails(user[0]._source.outlookAccessToken, user[0]._id)
        }
    }

    async processAndIndexEmails(accessToken: string, userId: string): Promise<void> {
        try {
            let nextLink: string | undefined = "https://graph.microsoft.com/v1.0/me/messages"; // Initial URL
            while (nextLink) {
                const graphData: any = await fetch(nextLink, accessToken);
                const emails = await this.mapGraphDataToEmail(graphData, userId);

                // Index the emails into Elasticsearch
                await this.indexEmails(emails);

                // Check for pagination
                nextLink = graphData["@odata.nextLink"];
                if (nextLink) {
                    console.log("Fetching next page of emails...");
                }
            }
        } catch (error) {
            console.error('Error processing and indexing emails:', error);
        }
    }

    /**
 * Maps the Graph API email data to the Email interface.
 * @param graphData - The raw data from the Microsoft Graph API.
 * @returns The mapped email data.
 */
    async mapGraphDataToEmail(graphData: any, userId: string): Promise<Email[]> {
        return graphData.value.map((item: any) => ({
            id: item.id,
            createdDateTime: item.createdDateTime,
            lastModifiedDateTime: item.lastModifiedDateTime,
            subject: item.subject || '', // Default to empty string if subject is undefined
            hasAttachments: item.hasAttachments,
            importance: item.importance,
            isRead: item.isRead,
            isDraft: item.isDraft,
            receivedDateTime: item.receivedDateTime,
            flag: item.flag?.flagStatus || 'notFlagged', // Default to 'notFlagged' if flagStatus is undefined
            userId: userId // Provide userId if necessary or extract from context
        }));
    }

    /**
     * Indexes a batch of Email documents into Elasticsearch.
     * @param emails - The array of Email objects to be indexed.
     */
    async indexEmails(emails: Email[]): Promise<void> {
        for (const email of emails) {
            try {
                const id = email.id; // Use email.id as the document ID
                const emailResponse = await this.searchEmailById(id);
                if (emailResponse.length < 1) {
                    const response = await client.index({
                        index: 'emails', // Name of the index
                        id: id,
                        body: email,
                        refresh: true // Ensure the document is searchable immediately
                    });
                    console.log('Document indexed successfully:', response);
                }
            } catch (error) {
                console.error('Error indexing document:', error);
            }
        }
        console.log("index successfull")
    }

    async searchEmailById(id: String): Promise<any[]> {
        const response = await client.search({
            index: 'emails', // Ensure the index name is correct
            body: {
                query: {
                    match: { _id: id } // Match query for the 'name' field
                }
            }
        });
        return response.body.hits.hits;
    }

    async searchEmailByUserId(userID: String): Promise<any[]> {
        const response = await client.search({
            index: 'emails', // Ensure the index name is correct
            body: {
                query: {
                    match: { userId: userID } // Match query for the 'name' field
                }
            }
        });
        return response.body.hits.hits;
    }

    async returnSyncProgress(userId: string): Promise<string> {
        const emailCount = await this.searchEmailById(userId);
        return `${EmailManager.mailCount}/${emailCount.length}`;
    }

    /**
     * Validates a user against a predefined schema.
     * @param user - The user to be validated.
     * @returns A promise that resolves with the validated user if the validation is successful.
     */
    async validateUser(user: User): Promise<User> {
        // const validatedUser = userSchema.parse(user);
        // return validatedUser;
        return user;
    }

    async addAcessAndRefreshToken(id: string, accessToken: string, refreshToken: string): Promise<void> {
        const response = await client.update({
            index: 'users',
            id: id,
            body: {
                doc: {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                },
                doc_as_upsert: true


            }
        });
    }

    async addOutlookAcessAndRefreshToken(id: string, outlookAccessToken: string, outlookRefreshToken: string): Promise<void> {
        const response = await client.update({
            index: 'users',
            id: id,
            body: {
                doc: {
                    outlookAccessToken: outlookAccessToken,
                    outlookRefreshToken: outlookRefreshToken
                },
                doc_as_upsert: true
            }
        });
    }

}
