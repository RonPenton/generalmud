import { getEnv } from '../environment';
import * as express from 'express';
import * as login from './login';
import * as signup from './signup';
import { World } from '../world/world';
const pack = require('../../../package.json');



const env = getEnv();

export const ensureAuthenticated: express.RequestHandler = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("info", "You must be logged in to see that page.");
        res.redirect("/login");
    }
}

export const redirectToGameIfAuthenticated: express.RequestHandler = (req, res, next) => {
    if (req.isAuthenticated()) {
        // redirect to game if they're already authenticated.
        res.redirect("/game");
        return;
    }
    next();
}

export function init(world: World) {
    const router = express.Router();

    router.use(function (req, res, next) {
        res.locals.currentUser = req.user;
        res.locals.errors = req.flash("error");
        res.locals.infos = req.flash("info");
        next();
    });

    router.get('/', function (_, res) {
        res.render('index', { title: `${env.GAME_NAME} (${pack.version})` });
    });

    router.get("/game", ensureAuthenticated, function (_, res) {
        res.render("game");
    });

    login.init(router);
    signup.init(router, world);

    return router;
}