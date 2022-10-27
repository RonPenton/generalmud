import passport from 'passport';
import passport_local from 'passport-local';
import * as bcrypt from 'bcryptjs';
import { ErrorRequestHandler } from 'express';
import { World } from './world/world';
const LocalStrategy = passport_local.Strategy;

export const hash = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

export const catchAuthErrorsMiddleware: ErrorRequestHandler = (err, req, res, next) => {
    if (err == MISSING_USER_RECORD || err == BANNED) {
        req.logout(() => { }); // So deserialization won't continue to fail.
        res.redirect("/login");
    } else {
        next();
    }
}

export const MISSING_USER_RECORD = "Missing User Record";
export const BANNED = "User is banned";

export const init = (world: World) => {
    passport.serializeUser<string>(function (player, done) {
        done(null, player.playerData.uniqueName);
    });

    passport.deserializeUser<string>(async function (id, done) {
        try {
            const user = world.getPlayer(id);
            if (!user) {
                return done(MISSING_USER_RECORD);
            }
            // if (user.suspendedUntil && user.suspendedUntil.isAfter(moment())) {
            //     return done(BANNED);
            // }
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    });

    passport.use("login", new LocalStrategy(async function (username, password, done) {
        const user = await world.getPlayer(username);
        if (!user) {
            return done(null, false, { message: "No user has that username!" });
        }

        bcrypt.compare(password, user.playerData.passwordHash, (err, result) => {
            if (err) return done(err);
            if (!result) return done(null, false, { message: "Invalid password." });
            // if (user.suspendedUntil && user.suspendedUntil.isAfter(moment())) {
            //     const reason = user.suspensionReason ? ` for ${user.suspensionReason}` : "";
            //     return done(null, false, { message: `You are suspended until ${user.suspendedUntil.format()}${reason}` });
            // }

            return done(null, user);
        });
    }));
};
