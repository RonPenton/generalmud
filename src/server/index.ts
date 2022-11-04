import express from 'express';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import flash from 'connect-flash';

import { init as initRoutes } from './routes';
import * as auth from './auth';
import { getEnv } from './environment';

import connectPgSimple from 'connect-pg-simple';
import { getDbInstance } from './db';
import { createSchema } from './db/schema';
import { World } from './world/world';

import './commands';
import { PlayerActor } from './models/actor';
import { join } from 'path';
import { findUnreachableRooms } from './world/diagnostics';

const env = getEnv();
start();

async function start() {
    const port = env.PORT;
    await setupExpress(port);
}

const wrap = (middleware: any) => (socket: any, next: any) => middleware(socket.request, {} as any, next);

async function setupExpress(port: string | number) {

    const db = await getDbInstance();
    await createSchema(db);
    const world = await World.load(db);

    await findUnreachableRooms(world);

    const app = express();
    auth.init(world);
    app.set("port", port);
    console.log(path.join(__dirname, '../client/views'));
    app.set('views', path.join(__dirname, '../client/views'));
    app.set('view engine', 'ejs');

    app.use(logger('dev'));

    if (process.env.NODE_ENV === 'development') {
        const config = require(join(__dirname, '..//client//webpack.config.js'));
        const webpack = require('webpack');
        const compiler = webpack(config);
        const webpackDevMiddleware = require('webpack-dev-middleware');
        app.use(webpackDevMiddleware(compiler, {
            publicPath: config.output.publicPath,
        }));
        app.use(require('webpack-hot-middleware')(compiler));
        app.use(express.static(path.join(__dirname, '../../build/public')));
    }
    else {
        app.use(express.static(path.join(__dirname, '../../build/public')));
    }

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

    const pgSession = connectPgSimple(session);

    const sessionmw = session({
        store: new pgSession({
            pgPromise: db,
            tableName: '_session'
        }),
        secret: env.COOKIE_SECRET,
        resave: false,
        saveUninitialized: false
    });

    app.use(sessionmw);
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(auth.catchAuthErrorsMiddleware);

    app.use(initRoutes(world));

    const server = http.createServer(app);
    server.listen(port, () => console.log(`Listening at http://localhost:${port}`))

    const io = new Server(server);
    io.use(wrap(sessionmw));
    io.use(wrap(passport.initialize()));
    io.use(wrap(passport.session()));

    io.use((socket, next) => {
        const req: Express.Request = socket.request as any;
        if (req.user) {
            next();
        } else {
            next(new Error('unauthorized'))
        }
    });

    io.on('connection', function (socket) {
        console.log(`connected: ${socket.handshake.address}`);
        const req: Express.Request = socket.request as any;

        if (req.isUnauthenticated()) {
            // Probably not needed because the middleware prevents unauthorized connections
            // from getting this far. That being said, if the behavior ever changes, at least we're protected.
            if (socket)
                socket.emit('access-denied', {});
            socket.disconnect(true);
            return;
        }

        const user = req.user;

        if (!user)
            return;

        world.playerConnecting(user, socket);

        socket.on('disconnect', function () {
            world.playerDisconnecting(user);
            console.log("disconnected");
        });
    });

    return { server, sessionmw };
}


declare global {
    namespace Express {
        interface User extends PlayerActor {

        }
    }
}
