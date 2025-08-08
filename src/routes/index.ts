import { Router } from "express";
import LeaderboardRouter from "./leaderboard.routes";
import AuthRouter from "./auth.routes";

export default (router: Router) => {
  new AuthRouter(router);
  new LeaderboardRouter(router);
};
