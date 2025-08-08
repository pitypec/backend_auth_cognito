"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const leaderboard_routes_1 = __importDefault(require("./leaderboard.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
exports.default = (router) => {
    new auth_routes_1.default(router);
    new leaderboard_routes_1.default(router);
};
