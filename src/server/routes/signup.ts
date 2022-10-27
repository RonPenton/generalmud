import express from 'express';
import passport from 'passport';

import { redirectToGameIfAuthenticated } from './index';
import * as auth from '../auth';
import { World } from '../world/world';
import { getCanonicalName, isInvalidName, PlayerData } from '../models/actor';

export function init(router: express.Router, world: World) {

    router.get("/signup", redirectToGameIfAuthenticated, function (_, res) {
        res.render("signup");
    });

    router.post("/signup", async function (req, res, next) {
        const username = req.body.username as string;
        const password = req.body.password as string;

        try {
            if (isInvalidName(username)) {
                req.flash("error", "Invalid User Name. Names cannot contain spaces, numbers, symbols, or extended ASCII characters.");
                return res.redirect("/signup");
            }

            const existingPlayer = await world.getPlayer(username);
            if (existingPlayer) {
                req.flash("error", "Username already taken");
                return res.redirect("/signup");
            }

            const hash = await auth.hash(password);

            const now = new Date().toISOString();
            let playerData: PlayerData = {
                uniqueName: getCanonicalName(username),
                passwordHash: hash,
                created: now,
                lastLogin: now
            };

            try {
                const player = await world.createPlayer(playerData, username);

                req.login(player, (err: any) => {
                    if (err) {
                        req.flash("error", err);
                        return;
                    }
    
                    res.redirect("/game");
                });
            }
            catch (error: any) {
                console.log(error);
                req.flash("error", error);
                res.redirect("/signup")
            }
        }
        catch (error) {
            next(error);
        }
    }, passport.authenticate("login", {
        successRedirect: "/",
        failureRedirect: "/signup",
        failureFlash: true
    }));
}
