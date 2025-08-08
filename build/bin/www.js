#!/usr/bin/env node
"use strict";
/**
 * Module dependencies.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const http_1 = __importDefault(require("http"));
const chalk_1 = __importDefault(require("chalk"));
const app_1 = __importDefault(require("../app"));
const env_1 = require("../config/env");
const debug = (0, debug_1.default)("thrive-commerce:server");
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    const port = parseInt(val, 10);
    if (Number.isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}
/**
 * Event listener for HTTP server 'error' event.
 */
function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }
    const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}
/**
 * Event listener for HTTP server 'listening' event.
 */
function onListening() {
    const addr = server.address();
    const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
    debug(`Listening on ${bind}`);
}
/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(env_1.PORT);
app_1.default.set("port", port);
/**
 * Create HTTP server.
 */
const server = http_1.default.createServer(app_1.default);
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, (err = null) => {
    if (err) {
        console.error(chalk_1.default.bold.red("ERROR - Unable to start server."));
    }
    else {
        console.info(chalk_1.default.bold.yellow(`INFO - Server spitting 🔥🔥🔥🔥🔥 on - ${env_1.HOST_NAME}:${port} [${env_1.NODE_ENV}]`));
        console.info(chalk_1.default.bold.green("Build something people want √√√√√√√√√"));
    }
});
server.on("error", onError);
server.on("listening", onListening);
