import { v4 as uuidv4 } from 'uuid';
import { User } from "../interfaces/user.js";
import { ElasticSearchManager } from "./ElasticSearchManager.js";
import { hashPassword } from "../utility/hashPassword.js";

export class UserManager {
    private esModel: ElasticSearchManager;
    private userIndex: string; // Variable to hold the user index name

    constructor() {
        this.esModel = new ElasticSearchManager(); // Instantiate the Elasticsearch model
        this.userIndex = 'user'; // Set the index name for user data
    }


    async indexUser(user: User): Promise<void> {
        const id = uuidv4();
        user.password = await hashPassword(user.password)
        const body = { email: user?.email, password: user?.password };
        this.esModel.indexDocument(this.userIndex, id, body)
    }

    async searchUserIndexByEmail(email: String): Promise<any[]> {
        const body = { query: { match: { email: email } } }
        return this.esModel.search(this.userIndex, body)
    }

    async searchUserIndexById(id: String): Promise<any[]> {
        const query = { query: { match: { _id: id } } }
        return this.esModel.search(this.userIndex, query)
    }


    async validateUser(user: User): Promise<User> {
        // const validatedUser = userSchema.parse(user);
        // return validatedUser;
        return user;
    }


    async addAcessAndRefreshToken(id: string, accessToken: string, refreshToken: string): Promise<void> {
        const body = {
            doc: {
                accessToken: accessToken,
                refreshToken: refreshToken
            },
            doc_as_upsert: true
        }
        this.esModel.updateDocument(this.userIndex, id, body)
    }

    async addOutlookAcessAndRefreshToken(id: string, outlookAccessToken: string, outlookRefreshToken: string): Promise<void> {
        const body = {
            doc: {
                outlookAccessToken: outlookAccessToken,
                outlookRefreshToken: outlookRefreshToken
            },
            doc_as_upsert: true
        }
        this.esModel.updateDocument(this.userIndex, id, body)
    }


    async updateMailsCount(userId: string): Promise<void> {
        try {
            const body = {
                script: {
                    source: `
                                if (ctx._source.outlookMailCount == null) {
                                    ctx._source.outlookMailCount = 1;
                                }else{
                                ctx._source.outlookMailCount += params.count;
                                } 
                                `,
                    params: { count: 1 }
                },
                retry_on_conflict: 2,
                refresh: 'true'
            };
            this.esModel.updateDocument(this.userIndex, userId, body);
        } catch (error) {
            console.error('Error incrementing mail count: ', error);
        }
    }

    async getAllUsers(): Promise<any[]> {
        const query = {
            query: {
                match_all: {}
            }
        };
        return this.esModel.search(this.userIndex, query)
    }


}
