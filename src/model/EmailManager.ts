import { v4 as uuidv4 } from 'uuid';
import { User } from "../interfaces/user.js";
import { Email } from "../interfaces/email.js";
import client from "../db/elasticSearch/connection.js";
import { EmailManagerInterface } from "../interfaces/EmailManagerInterface.js";
import { hashPassword } from "../utility/hashPassword.js";
import fetch from "../utility/fetch.js";
import { any } from "zod";
import { ElasticSearchManager } from './ElasticSearchManager.js';
import { UserManager } from './UserManager.js';
import { RateLimiter } from './RateLimiter.js';



export class EmailManager implements EmailManagerInterface {
    private static outlookMailURL = process.env.OUTLOOK_MAIL_URL;
    private static trackChangesURL = process.env.OUTLOOK_MAIL_TRACK_CHANGES_URL;
    private static mailCount = 0;
    private esModel: ElasticSearchManager;
    private rateLimiter: RateLimiter;
    private userModel: UserManager;
    private emailIndex: string;

    private isSyncing: boolean;
    private syncCount: number;



    constructor() {
        this.esModel = new ElasticSearchManager(); // Instantiate the Elasticsearch model
        this.userModel = new UserManager();
        this.rateLimiter = new RateLimiter(10000, 10);
        this.emailIndex = 'email';
        this.isSyncing = false;
        this.syncCount = 0;
    }

    async checkSyncCount(): Promise<boolean> {
        if (this.syncCount === 4) {
            return this.isSyncing = true;
        } else {
            this.syncCount += 1;
            return false;
        }
    }

    async incrementSyncCount(): Promise<void> {
        this.syncCount++;
    }

    async decrementSyncCount(): Promise<void> {
        this.syncCount--;
    }

    async updateIsSyncing(): Promise<void> {
        if (this.syncCount > 4) {
            this.isSyncing = false;
        } else {
            this.isSyncing = true;
        }
    }

    async initializeIndex(): Promise<void> {
        try {
            this.esModel.createIndex(this.emailIndex);
        } catch (error) {
            console.error('Error initializing indices');
        }
    }

    async indexEmails(emails: Email[]): Promise<void> {
        for (const email of emails) {
            try {
                const id = email.id;
                const emailResponse = await this.searchEmailById(id);
                if (emailResponse.length > 0) {
                    this.esModel.indexDocument(this.emailIndex, id, email);
                } else {
                    this.esModel.indexDocument(this.emailIndex, id, email);
                    // await this.updateMailsCount(email?.userId);
                }
            } catch (error) {
                console.error('Error indexing document: ', error);
            }
        }
    }
    async syncOutlookMails(userId: string, isSync: boolean): Promise<void> {
        if (!this.isSyncing) {
            const user = await this.userModel.searchUserIndexById(userId);
            console.log("123 " + process.env.OUTLOOK_MAIL_URL)
            let nextLink: string | undefined = isSync ? process.env.OUTLOOK_MAIL_TRACK_CHANGES_URL : process.env.OUTLOOK_MAIL_URL;
            await this.incrementSyncCount();
            await this.updateIsSyncing();
            if (!user[0]._source.outlookAccessTocken) {
                await this.processAndIndexEmails(user[0]._source.outlookAccessToken, user[0]._id, nextLink)
            }
            await this.decrementSyncCount();
            await this.updateIsSyncing();
            console.log("sync completed")
        } else {
            console.log("sync in progress, try later")

        }

    }

    async processAndIndexEmails(accessToken: string, userId: string, nextLink: string | undefined): Promise<void> {
        try {
            // Initial URL
            console.log(nextLink + " link  " + this.rateLimiter.checkLimit())
            while (nextLink && this.rateLimiter.checkLimit()) {
                const graphData: any = await fetch(nextLink, accessToken);
                console.log("graphData " + JSON.stringify(graphData));
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


    async mapGraphDataToEmail(graphData: any, userId: string): Promise<Email[]> {
        return graphData.value.map((item: any) => ({
            id: item.id,
            senderEmailAddress: item?.sender?.emailAddress?.address,
            senderName: item?.sender?.emailAddress?.name,
            createdDateTime: item.createdDateTime,
            lastModifiedDateTime: item.lastModifiedDateTime,
            subject: item.subject || '',
            hasAttachments: item.hasAttachments,
            importance: item.importance,
            isRead: item.isRead,
            isDraft: item.isDraft,
            receivedDateTime: item.receivedDateTime,
            flag: item.flag?.flagStatus || 'notFlagged',
            userId: userId
        }));
    }

    async updateMailsCount(userId: string): Promise<void> {
        try {
            this.userModel.updateMailsCount(userId);
        } catch (error) {
            console.error('Error incrementing mail count:', error);
        }
    }


    async searchEmailById(id: String): Promise<any[]> {
        const body = {
            query: {
                match: { _id: id }
            }
        };
        return this.esModel.search(this.emailIndex, body)
    }

    async searchEmailByUserId(userID: String): Promise<any[]> {
        const body = {
            query: {
                match: { userId: userID }
            }
        };
        return this.esModel.search(this.emailIndex, body)
    }

    async searchEmailByUserIdPagination(userID: String, currentCount: Number, pageSize: Number): Promise<any[]> {
        const body = {
            from: currentCount,
            size: pageSize,
            query: {
                match: { userId: userID }
            }
        }
        return this.esModel.search(this.emailIndex, body)
    }

    async returnSyncProgress(userId: string): Promise<string> {
        const emailCount = await this.searchEmailById(userId);
        return `${EmailManager.mailCount}/${emailCount.length}`;
    }


}
