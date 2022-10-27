import express from 'express';
import passport from "passport";

import { redirectToGameIfAuthenticated } from './index';

export function init(router: express.Router) {

    router.get("/login", redirectToGameIfAuthenticated, function (_, res) {
        res.render("login");
    });

    router.post("/login", passport.authenticate("login", {
        successRedirect: "/game",
        failureRedirect: "/login",
        session: true,
        failureFlash: true
    }));

    router.post("/logout", function (req, res) {
        req.logout(() => { });
        res.redirect("/");
    });
}