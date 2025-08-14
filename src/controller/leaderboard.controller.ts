import { APIGatewayProxyEvent } from "aws-lambda";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { toLambdaEvent } from "../types/event";
import leaderboardService from "../services/leaderboard.service";

class LeaderboardController {
  public async registerConnection(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const event: APIGatewayProxyEvent = toLambdaEvent(req);
    console.log({ event });

    try {
      const authHeader =
        event.headers.Authorization || event.headers.authorization;
      if (!authHeader) {
        return res.status(400).json({
          code: "00",
          status: "failure",
          statusCode: 400,
          message: "Missing Authorization header",
        });
      }
      console.log({ authHeader });

      const token = authHeader.replace("Bearer ", "");
      const decoded = jwt.decode(token) as JwtPayload;
      console.log({ decoded });
      const userId = decoded?.sub;

      let connectionId = event.requestContext.connectionId;
      console.log({ connectionId });
      const parsedBody = JSON.parse(event.body as string);

      // Fallback: get connectionId from body if missing (manual call)
      if (!connectionId && event.body) {
        connectionId = parsedBody.connectionId;
      }

      if (!userId || !connectionId) {
        return res.status(400).json({
          code: "00",
          status: "failure",
          statusCode: 400,
          message: "Invalid userId or connectionId",
        });
      }
      console.log({ connectionId, score: parsedBody.score });

      const response = await leaderboardService.registerConnection(
        connectionId,
        Number(parsedBody.score)
      );
      return res.status(200).json({
        code: "00",
        message: "Connection registered successfully",
        data: response?.data,
      });
    } catch (err) {
      if (err instanceof Error) {
        return res
          .status(400)
          .json({ code: "00", status: "failed", message: err?.message });
      }
      next(err);
    }
  }

  async submitScore(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const lambdaEvent: APIGatewayProxyEvent = toLambdaEvent(req);

    try {
      const authHeader =
        lambdaEvent.headers.Authorization || lambdaEvent.headers.authorization;
      if (!authHeader) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: "Missing Authorization header" }),
        };
      }

      const token = authHeader.replace("Bearer ", "");
      const decoded = jwt.decode(token) as JwtPayload;
      const userId = decoded?.sub as string;
      const userName = decoded?.username;
      const body = JSON.parse(lambdaEvent.body || "{}");
      const { score } = body;

      if (!score || typeof score !== "number") {
        return res.status(400).json({
          code: "00",
          status: "failure",
          message: "Invalid or missing score",
          data: null,
        });
      }

      const response = await leaderboardService.submitScore(
        userName,
        userId,
        score
      );

      return res.status(200).json({
        code: "00",
        message: "Score submitted successfully",
        data: response?.data,
      });
    } catch (err) {
      if (err instanceof Error) {
        return res
          .status(400)
          .json({ code: "00", status: "failed", message: err?.message });
      }
      next(err);
    }
  }

  async getLeaderboard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const response = await leaderboardService.getLeaderboard();

      return res
        .status(200)
        .json({ code: "00", message: "", data: response?.data });
    } catch (err) {
      console.log({ err });
      if (err instanceof Error) {
        return res
          .status(400)
          .json({ code: "00", status: "failed", message: err?.message });
      }
      next(err);
    }
  }

  async getWebConnections(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const response = await leaderboardService.getWebconnections();

      return res
        .status(200)
        .json({ code: "00", message: "", data: response?.data });
    } catch (err) {
      console.log({ err });
      if (err instanceof Error) {
        return res
          .status(400)
          .json({ code: "00", status: "failed", message: err?.message });
      }
      next(err);
    }
  }

  public async getTopScore(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const response = await leaderboardService.getTopScore();

      return res
        .status(200)
        .json({ code: "00", message: "", data: response.data });
    } catch (err) {
      if (err instanceof Error) {
        return res
          .status(400)
          .json({ code: "00", status: "failed", message: err?.message });
      }
      next(err);
    }
  }

  async deleteConnectionId(req: Request, res: Response, next: NextFunction) {
    const event: APIGatewayProxyEvent = toLambdaEvent(req);

    const connectionId = event.requestContext.connectionId as string;

    try {
      const response = await leaderboardService.deleteConnectionId(
        connectionId
      );
      return res.status(200).json({
        code: "00",
        success: "success",
        message: "Confirmation code resent",
        data: response,
      });
    } catch (err) {
      if (err instanceof Error) {
        return res
          .status(400)
          .json({ code: "00", status: "failed", message: err?.message });
      }
      next(err);
    }
  }
}

export default LeaderboardController;
