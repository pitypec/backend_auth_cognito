import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
  WEBSOCKET_API_ENDPOINT,
} from "../config/env";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { buildResponse } from "../utils";
import { LeaderboardItem } from "../types/leaderboard";
import { v4 as uuidv4 } from "uuid";

const ddbClient: DynamoDBClient = new DynamoDBClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID!,
    secretAccessKey: AWS_SECRET_ACCESS_KEY!,
  },
});
class LeaderboardService {
  public async registerConnection(
    userId: string,
    connectionId: string
  ): Promise<any> {
    try {
      const response = await this.storeConnectionId(userId, connectionId);
      return buildResponse({
        data: response,
      });
    } catch (error) {
      throw error instanceof Error ? error?.message : error;
    }
  }
  async submitScore(
    userName: string,
    userId: string,
    score: number
  ): Promise<any> {
    try {
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

      return buildResponse({
        data: response,
      });
    } catch (error) {
      throw error instanceof Error ? error?.message : error;
      // return res
      //   .status(500)
      //   .json({ message: err instanceof Error ? err?.message : err });
    }
  }
  async getLeaderboard(): Promise<any> {
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

      return buildResponse({
        data: items,
      });
    } catch (error) {
      throw error instanceof Error ? error?.message : error;
    }
  }
  public async getTopScore(): Promise<any> {
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

      return buildResponse({
        data: topScore,
      });
    } catch (error) {
      throw error instanceof Error ? error?.message : error;
    }
  }

  async deleteConnectionId(connectionId: string) {
    try {
      // Optional: You can reverse lookup by connectionId if needed
      // For simplicity, assume connectionId is also the key
      const scanCommand = new DeleteItemCommand({
        TableName: "WebSocketConnections",
        Key: {
          userId: { S: connectionId }, // update if your PK is not connectionId
        },
      });
      const data = await ddbClient.send(scanCommand);

      return buildResponse({
        data,
      });
    } catch (error) {
      throw error instanceof Error ? error?.message : error;
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
      throw error instanceof Error ? error?.message : error;

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
      throw error instanceof Error ? error?.message : error;
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
      throw error instanceof Error ? error?.message : error;
    }
  }
}

export default new LeaderboardService();
