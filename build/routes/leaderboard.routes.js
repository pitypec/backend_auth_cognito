"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("../config/env");
const leaderboard_controller_1 = __importDefault(require("../controller/leaderboard.controller"));
const BASE_URL = `${env_1.API_BASE_URL}/leaderboards`;
class LeaderboardRouter {
    constructor(router) {
        this.router = router;
        this.leaderboardController = new leaderboard_controller_1.default();
        this.loadRoutes();
    }
    loadRoutes() {
        console.log({ first: BASE_URL });
        this.router.get(`${BASE_URL}/top-score`, this.leaderboardController.getTopScore);
        this.router.post(`${BASE_URL}/submit-score`, this.leaderboardController.submitScore);
        this.router.get(`${BASE_URL}/get-leaderboard`, this.leaderboardController.getLeaderboard);
        this.router.post(`${BASE_URL}/register-connection`, this.leaderboardController.registerConnection);
    }
}
exports.default = LeaderboardRouter;
