#!/usr/bin/env node

/**
 * Module dependencies.
 */

import debugLib from "debug";
import http from "http";
import chalk from "chalk";
import app from "../app";
import { PORT, NODE_ENV, HOST_NAME } from "../config/env";

const debug = debugLib("thrive-commerce:server");

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: any) {
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

function onError(error: any) {
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
  const addr: any = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
}

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(PORT);
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, (err: any = null) => {
  if (err) {
    console.error(chalk.bold.red("ERROR - Unable to start server."));
  } else {
    console.info(
      chalk.bold.yellow(
        `INFO - Server spitting 🔥🔥🔥🔥🔥 on - ${HOST_NAME}:${port} [${NODE_ENV}]`
      )
    );
    console.info(chalk.bold.green("Build something people want √√√√√√√√√"));
  }
});
server.on("error", onError);
server.on("listening", onListening);
