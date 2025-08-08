export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

export interface LeaderboardItem {
  id: string;
  user_id: string;
  user_name: string;
  score: number;
  timestamp: number;
}
