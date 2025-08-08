import crypto from "crypto";

export function calculateSecretHash(
  username: string,
  clientId: string,
  clientSecret: string
) {
  const hmac = crypto.createHmac("sha256", clientSecret);
  hmac.update(username + clientId);
  return hmac.digest("base64");
}
