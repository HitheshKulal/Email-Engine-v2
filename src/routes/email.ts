import express from "express";
import {
    searchEmailsByUserId,
    syncOutlookMails,
    outlookInbox,
    outlookSyncProgress
} from "../controllers/email.js"

const router = express.Router();

function isAuthenticated(req: any, res: any, next: any) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/signin'); // redirect to sign-in route
    }

    next();
};

router.get("/syncOutlookMails", (req, res) => {
    res.render("syncOutlookMails");
});

router.post("/syncOutlookMails", syncOutlookMails)

router.get("/search", isAuthenticated, (req, res) => {
    res.render("search");
});
router.post("/search", searchEmailsByUserId)
router.get("/inbox", outlookInbox)
router.get("/progress", outlookSyncProgress)
export default router;
