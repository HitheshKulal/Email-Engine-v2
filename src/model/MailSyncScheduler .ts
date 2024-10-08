import cron from 'node-cron';
import { EmailManager } from './EmailManager';
import { UserManager } from './UserManager';

export class MailSyncScheduler {
    private emailModel: EmailManager;
    private userModel: UserManager;

    constructor() {
        this.emailModel = new EmailManager();
        this.userModel = new UserManager();
        cron.schedule('*/5 * * * *', async () => {
            try {
                const users = await this.userModel.getAllUsers();
                await Promise.all(users.map(async (user: any) => {
                    await this.emailModel.syncOutlookMails(user.id, true);
                }));
            } catch (error) {
                console.error('Error occurred during mail sync:', error);
            }
        });

        console.log('Mail sync scheduler started. Syncing every 5 minutes.');
    }

}
