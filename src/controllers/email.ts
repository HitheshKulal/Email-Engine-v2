import { type NextFunction, type Response, type Request } from "express";
import { asyncWrapper } from "../utility/async-wrapper.js";
import { AuthenticatedRequest } from "../middlewares/authentication.js";
import { EmailManager } from "../model/EmailManager.js";
export const syncOutlookMails = asyncWrapper(
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const emailManager = EmailManager.getInstance();
        const { id } = req.body;
        console.log("inside sync")
        await emailManager.syncOutlookMails(id);
        res.status(201).json({ id });

    }
)

export const searchEmailsByUserId = asyncWrapper(
    async (
        req: AuthenticatedRequest,
        res: Response
    ): Promise<void> => {
        const emailManager = EmailManager.getInstance();
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
        const emailManager = EmailManager.getInstance();
        const { id } = req.body;
        const emails = await emailManager.searchEmailByUserId(req?.user?.id || "");
        res.status(201).json(emails);
    }
)
export const outlookSyncProgress = asyncWrapper(
    async (
        req: AuthenticatedRequest,
        res: Response
    ): Promise<void> => {
        const emailManager = EmailManager.getInstance();
        const { id } = req.body;
        const emails = await emailManager.returnSyncProgress(req?.user?.id || "");
        res.status(201).json(emails);
    }
)