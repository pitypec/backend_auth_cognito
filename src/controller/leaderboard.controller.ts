import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { toLambdaEvent } from "../types/event";
import { LeaderboardItem } from "../types/leaderboard";
import {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  WEBSOCKET_API_ENDPOINT,
} from "../config/env";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

const ddbClient: DynamoDBClient = new DynamoDBClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID!,
    secretAccessKey: AWS_SECRET_ACCESS_KEY!,
  },
});

class LeaderboardController {
  private ddbClient: DynamoDBClient;
  private tableName: string;

  constructor() {
    this.ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
    this.tableName = "Leaderboard";
  }

  // public async registerConnection(
  //   event: APIGatewayProxyEvent
  // ): Promise<APIGatewayProxyResult> {
  //   const connectionId = event.requestContext.connectionId;
  //   const userId = event.queryStringParameters?.userId;

  //   if (!connectionId || !userId) {
  //     return {
  //       statusCode: 400,
  //       body: JSON.stringify({ message: "Missing connectionId or userId" }),
  //     };
  //   }

  //   await this.ddbClient.send(
  //     new PutItemCommand({
  //       TableName: "WebSocketConnections",
  //       Item: {
  //         userId: { S: userId },
  //         connectionId: { S: connectionId },
  //       },
  //     })
  //   );

  //   return {
  //     statusCode: 200,
  //     body: JSON.stringify({ message: "Connection registered" }),
  //   };
  // }

  // public registerConnection = async (
  //   event: APIGatewayProxyEvent
  // ): Promise<APIGatewayProxyResult> => {
  //   const connectionId = event.requestContext.connectionId;

  //   let userId = event.queryStringParameters?.userId;
  //   if (!userId && event.body) {
  //     try {
  //       const body = JSON.parse(event.body);
  //       userId = body.userId;
  //     } catch (e) {
  //       return {
  //         statusCode: 400,
  //         body: JSON.stringify({ message: "Invalid request body" }),
  //       };
  //     }
  //   }

  //   if (!connectionId || !userId) {
  //     return {
  //       statusCode: 400,
  //       body: JSON.stringify({ message: "Missing connectionId or userId" }),
  //     };
  //   }

  //   await this.ddbClient.send(
  //     new PutItemCommand({
  //       TableName: "WebSocketConnections",
  //       Item: {
  //         userId: { S: userId },
  //         connectionId: { S: connectionId },
  //       },
  //     })
  //   );

  //   return {
  //     statusCode: 200,
  //     body: JSON.stringify({ message: "Connection registered" }),
  //   };
  // };

  // public registerConnection = async (
  //   event: APIGatewayProxyEvent
  // ): Promise<APIGatewayProxyResult> => {
  //   try {
  //     const authHeader =
  //       event.headers.Authorization || event.headers.authorization;
  //     if (!authHeader) {
  //       return {
  //         statusCode: 401,
  //         body: JSON.stringify({ message: "Missing Authorization header" }),
  //       };
  //     }

  //     const token = authHeader.replace("Bearer ", "");
  //     const decoded = jwt.decode(token) as JwtPayload;
  //     const userId = decoded?.sub;

  //     const connectionId = event.requestContext.connectionId;
  //     if (!userId || !connectionId) {
  //       return {
  //         statusCode: 400,
  //         body: JSON.stringify({ message: "Invalid userId or connectionId" }),
  //       };
  //     }

  //     await this.ddbClient.send(
  //       new PutItemCommand({
  //         TableName: "WebSocketConnections",
  //         Item: {
  //           userId: { S: userId },
  //           connectionId: { S: connectionId },
  //         },
  //       })
  //     );

  //     return {
  //       statusCode: 200,
  //       body: JSON.stringify({ message: "Connection registered successfully" }),
  //     };
  //   } catch (err) {
  //     console.error("Register connection error", err);
  //     return {
  //       statusCode: 500,
  //       body: JSON.stringify({
  //         message: "Failed to register connection",
  //         error: err instanceof Error ? err.message : err,
  //       }),
  //     };
  //   }
  // };

  public async registerConnection(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const event: APIGatewayProxyEvent = toLambdaEvent(req);

    try {
      const authHeader =
        event.headers.Authorization || event.headers.authorization;
      if (!authHeader) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: "Missing Authorization header" }),
        };
      }
      console.log({ authHeader });

      const token = authHeader.replace("Bearer ", "");
      const decoded = jwt.decode(token) as JwtPayload;
      console.log({ decoded });
      const userId = decoded?.sub;

      let connectionId = event.requestContext.connectionId;
      console.log({ connectionId });

      // Fallback: get connectionId from body if missing (manual call)
      if (!connectionId && event.body) {
        const parsedBody = JSON.parse(event.body);
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

      await this.storeConnectionId(userId, connectionId);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Connection registered successfully" }),
      };
    } catch (err) {
      console.error("Register connection error", err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Failed to register connection",
          error: err instanceof Error ? err.message : err,
        }),
      };
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

      const command = new PutItemCommand({
        TableName: "leaderboard",
        Item: {
          id: { S: uuidv4() },
          user_id: { S: userId },
          user_name: { S: userName },
          score: { N: score.toString() },
          timestamp: { N: Math.floor(Date.now() / 1000).toString() },
        },
      });
      const response = await ddbClient.send(command);

      // Notify via WebSocket if score >= 1000
      if (score >= 1000) {
        const connectionId = await this.getConnectionId(userId);

        if (connectionId) {
          await this.notifyIfHighScore(connectionId, score, userName);
        }
      }

      return res.status(200).json({
        code: "00",
        message: "Score submitted successfully",
        data: response,
      });
    } catch (err) {
      console.log({ err });
      return res
        .status(500)
        .json({ message: err instanceof Error ? err?.message : err });
    }
  }

  async getLeaderboard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const command = new ScanCommand({
        TableName: "leaderboard",
        Limit: 50,
      });

      const data = await ddbClient.send(command);

      const items: LeaderboardItem[] = (data.Items || [])
        .map((item) => ({
          id: item.id.S ?? "",
          user_id: item.user_id.S ?? "",
          user_name: item.user_name.S ?? "",
          score: Number(item.score.N ?? 0),
          timestamp: Number(item.timestamp.N ?? 0),
        }))
        .sort((a, b) => b.score - a.score);

      return res.status(200).json({ code: "00", message: "", data: items });
    } catch (err) {
      console.log({ err });
      return res
        .status(500)
        .json({ message: err instanceof Error ? err?.message : err });
    }
  }

  public async getTopScore(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const command = new ScanCommand({
        TableName: "leaderboard",
      });

      const data = await ddbClient.send(command);

      const items: LeaderboardItem[] = (data.Items || [])
        .map((item) => ({
          id: item.id.S ?? "",
          user_id: item.user_id.S ?? "",
          user_name: item.user_name.S ?? "",
          score: Number(item.score.N ?? 0),
          timestamp: Number(item.timestamp.N ?? 0),
        }))
        .sort((a, b) => b.score - a.score);

      const topScore = items.length > 0 ? items[0] : null;

      return res.status(200).json({ code: "00", message: "", data: topScore });
    } catch (err) {
      console.log({ err });
      return res
        .status(500)
        .json({ message: err instanceof Error ? err?.message : err });
    }
  }

  /**
   * Notify user over WebSocket if score > 1000
   *
   * @param connectionId The WebSocket connection ID (stored during $connect)
   * @param score The user’s score
   */
  notifyIfHighScore = async (
    connectionId: string,
    score: number,
    userName: string
  ): Promise<void> => {
    if (score <= 1000) return; // Only notify for scores > 1000

    // const endpoint = process.env.WEBSOCKET_API_ENDPOINT; // e.g., 'https://xxxxxxx.execute-api.us-east-1.amazonaws.com/prod'

    const client = new ApiGatewayManagementApiClient({
      region: AWS_REGION,
      endpoint: WEBSOCKET_API_ENDPOINT,
    });

    const message = {
      type: "high_score",
      content: `🎉 Congrats ${userName}, you scored ${score}!`,
    };

    const command = new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: Buffer.from(JSON.stringify(message)),
    });

    try {
      await client.send(command);
      console.log(`✅ WebSocket message sent to ${connectionId}`);
    } catch (error) {
      console.error(`❌ Failed to send WebSocket message`, error);
      // Optionally, handle stale connection (e.g., delete from DB)
    }
  };

  storeConnectionId = async (
    userId: string,
    connectionId: string
  ): Promise<void> => {
    const command = new PutItemCommand({
      TableName: "WebSocketConnections",
      Item: {
        userId: { S: userId },
        connectionId: { S: connectionId },
      },
    });

    try {
      await ddbClient.send(command);
      console.log(`✅ Stored connectionId for user ${userId}`);
    } catch (error) {
      console.error("❌ Failed to store connectionId:", error);
      throw error;
    }
  };

  async getConnectionId(userId: string): Promise<string | null> {
    const command = new GetItemCommand({
      TableName: "WebSocketConnections",
      Key: {
        userId: { S: userId },
      },
    });

    try {
      const result = await ddbClient.send(command);
      const connectionId = result.Item?.connectionId?.S || null;
      return connectionId;
    } catch (error) {
      console.error("❌ Failed to get connectionId:", error);
      throw error;
    }
  }

  // async deleteConnectionId(req: Request, res: Response, next: NextFunction) {
  //   const event: APIGatewayProxyEvent = toLambdaEvent(req);

  //   const connectionId = event.requestContext.connectionId;

  //   try {
  //     // Optional: You can reverse lookup by connectionId if needed
  //     // For simplicity, assume connectionId is also the key
  //     const scanCommand = new DeleteItemCommand({
  //       TableName: "WebSocketConnections",
  //       Key: {
  //         userId: { S: connectionId }, // update if your PK is not connectionId
  //       },
  //     });

  //     await ddbClient.send(scanCommand);

  //     return {
  //       statusCode: 200,
  //       body: "Disconnected.",
  //     };
  //   } catch (err) {
  //     console.error("Disconnect error", err);
  //     return {
  //       statusCode: 500,
  //       body: "Failed to disconnect.",
  //     };
  //   }
  // }
}

export default LeaderboardController;
