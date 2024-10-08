import { type NextFunction, type Response, type Request } from "express";
import { asyncWrapper } from "../utility/async-wrapper.js";
import { AuthenticatedRequest } from "../middlewares/authentication.js";
import { EmailManager } from "../model/EmailManager.js";
import { User } from "../interfaces/user.js";
import { UserManager } from "../model/UserManager.js";
export const syncOutlookMails = asyncWrapper(
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const emailManager = new EmailManager();
        const { id } = req.body;
        console.log("inside sync")
        await emailManager.syncOutlookMails(id, false);
        res.status(201).json({ id });

    }
)

export const searchEmailsByUserId = asyncWrapper(
    async (
        req: AuthenticatedRequest,
        res: Response
    ): Promise<void> => {
        const emailManager = new EmailManager();
        const { id } = req.body;
        const emails = await emailManager.searchEmailByUserId(id);
        res.status(201).json(emails);
    }
)

export const outlookInbox = asyncWrapper(
    async (
        req: AuthenticatedRequest,
        res: Response
    ): Promise<void> => {
        const userManger = new UserManager();
        const emailManager = new EmailManager();
        const pageSize = 10;
        const page = Number(req.query?.page) > 0 ? Number(req.query?.page) : 1;
        const emails = await emailManager.searchEmailByUserIdPagination(req?.user?.id || "", (page - 1) * pageSize, pageSize);
        const sources = emails.map(item => item._source);
        const user = await userManger.searchUserIndexById(req?.user?.id || "");
        console.log("user 1" + JSON.stringify(user))
        console.log(JSON.stringify(req?.user?.id))
        res.render('inbox', {
            emails: sources,
            pageTitle: 'inbox',
            path: '/',
            hasEmails: sources?.length > 0,
            activeShop: true,
            productCSS: true,
            currentPage: page,
            // hasNextPage: pageSize * page < user[0]._source?.outlookMailCount,
            hasNextPage: true,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            // lastPage: Math.ceil(user[0]._source?.outlookMailCount / pageSize)
        });
    }
)
export const outlookSyncProgress = asyncWrapper(
    async (
        req: AuthenticatedRequest,
        res: Response
    ): Promise<void> => {
        const emailManager = new EmailManager();
        const { id } = req.body;
        const emails = await emailManager.returnSyncProgress(req?.user?.id || "");
        res.status(201).json(emails);
    }
)