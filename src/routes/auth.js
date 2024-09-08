import express from "express"
import { authProvider } from "../model/authProvider.js"
import { REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } from "../config/authConfig.js";
import authenticateUser from "../middlewares/authentication.js";
const router = express.Router();


router.get('/signin', (req, res) => {
    authProvider.login({
        scopes: ['User.Read', 'Mail.Read', 'offline_access', 'openid', "profile"],
        redirectUri: REDIRECT_URI,
        successRedirect: '/auth/acquireToken'
    })(req, res);
});

router.get('/acquireToken', authenticateUser, authProvider.acquireToken({
    scopes: ['User.Read', 'Mail.Read', 'offline_access', 'openid', "profile"],
    redirectUri: REDIRECT_URI,
    successRedirect: '/'
}));

router.post('/redirect', authProvider.handleRedirect());

router.get('/signout', authProvider.logout({
    postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI
}));

export default router;
