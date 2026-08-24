import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("JWT secrets are missing from environment variables");
}

export const generateAccessToken = ({ userId, role }) => {
  return jwt.sign(
    {
      sub: userId,
      role,
    },
    ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    }
  );
};

export const generateRefreshToken = ({ userId, familyId }) => {
  const jti = crypto.randomUUID();

  const token = jwt.sign(
    {
      sub: userId,
      familyId,
      jti,
    },
    REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    }
  );

  return {
    token,
    jti,
  };
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

export const generateFamilyId = () => {
  return crypto.randomUUID();
};