import { Router } from "express";
import { API_BASE_URL } from "../config/env";
import LeaderboardController from "../controller/leaderboard.controller";

const BASE_URL = `${API_BASE_URL}/leaderboards`;

class LeaderboardRouter {
  router: Router;
  leaderboardController;
  constructor(router: Router) {
    this.router = router;
    this.leaderboardController = new LeaderboardController();
    this.loadRoutes();
  }

  private loadRoutes() {
    console.log({ first: BASE_URL });
    this.router.get(
      `${BASE_URL}/top-score`,
      this.leaderboardController.getTopScore
    );
    this.router.post(
      `${BASE_URL}/submit-score`,
      this.leaderboardController.submitScore
    );
    this.router.get(
      `${BASE_URL}/get-leaderboard`,
      this.leaderboardController.getLeaderboard
    );
    this.router.post(
      `${BASE_URL}/register-connection`,
      this.leaderboardController.registerConnection
    );
  }
}

export default LeaderboardRouter;
