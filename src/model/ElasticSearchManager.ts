import { Client } from "@elastic/elasticsearch";
import client from "../db/elasticSearch/connection.js";

export class ElasticSearchManager {
    private client: Client;
    private static instance: ElasticSearchManager
    private userIndex: string;
    private emailIndex: string;



    constructor() {
        this.client = client;
        this.userIndex = 'user';
        this.emailIndex = 'email';
    }

    async initializeIndex(): Promise<void> {
        try {
            this.createIndex(this.userIndex);
            this.createIndex(this.emailIndex);
        } catch (error) {
            console.error('Error initializing indices');
        }
    }

    static getInstance(): ElasticSearchManager {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ElasticSearchManager();
        return this.instance;
    }

    async createIndex(index: string): Promise<void> {
        try {
            await this.client.indices.create({ index });
        } catch (error) {
            console.error(`Error initializing index ${index}:`, error);
        }
    }

    async indexDocument(index: string, id: string, body: any): Promise<void> {
        await this.client.index({
            index: index,
            id: id,
            body: body,
            refresh: true
        });
    }

    async search(index: string, query: any): Promise<any[]> {
        const response = await this.client.search({
            index: index,
            body: query
        });
        return response.body.hits.hits;
    }

    async updateDocument(index: string, id: string, updateBody: any): Promise<void> {
        await this.client.update({
            index: index,
            id: id,
            body: updateBody
        });
    }
}
