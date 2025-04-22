import jwt from "jsonwebtoken"

interface TokenPayload {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
const secretKey = process.env.JWT_SECRET as string;

export const generateToken = (payload: TokenPayload) => {
  
  if (!secretKey) {
    console.error(
      "Error: JWT_SECRET is not defined in the environment variables."
    );
  }
  const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
  return token;
};
