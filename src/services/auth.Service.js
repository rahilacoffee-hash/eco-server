import crypto from "crypto";
import prisma from "../config/prisma.js";

import {
  generateAccessToken,
  generateRefreshToken,
  generateFamilyId,
  verifyRefreshToken,
} from "../utils/jwt.js";

import {
  hashPassword,
  comparePassword,
} from "../utils/hash.js";

import { sendVerificationEmail } from "./email.Service.js";

const VERIFICATION_TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/*
|--------------------------------------------------------------------------
| CREATE ADMIN
|--------------------------------------------------------------------------
*/

export const createAdmin = async ({
  name,
  email,
  password,
  adminSecret,
}) => {
  if (adminSecret !== process.env.ADMIN_SECRET) {
    throw new Error("INVALID_ADMIN_SECRET");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingAdmin) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  if (password.length < 8) {
    throw new Error("PASSWORD_TOO_SHORT");
  }

  const passwordHash = await hashPassword(password);

  const verificationToken = generateVerificationToken();

  const tokenHash = hashToken(verificationToken);

  const expiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_EXPIRY
  );

  const admin = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",

      verificationTokens: {
        create: {
          tokenHash,
          expiresAt,
        },
      },
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      emailVerifiedAt: true,
      createdAt: true,
    },
  });

  try {
    await sendVerificationEmail({
      email: admin.email,
      name: admin.name,
      verificationToken,
    });
  } catch (error) {
    // Don't leave an account behind if email delivery fails.
    await prisma.user.delete({
      where: {
        id: admin.id,
      },
    });

    throw error;
  }

  return admin;
};

/*
|--------------------------------------------------------------------------
| VERIFY EMAIL
|--------------------------------------------------------------------------
*/

export const verifyEmail = async (token) => {
  if (!token) {
    throw new Error("VERIFICATION_TOKEN_REQUIRED");
  }

  const tokenHash = hashToken(token);

  const verificationToken =
    await prisma.emailVerificationToken.findUnique({
      where: {
        tokenHash,
      },
    });

  if (!verificationToken) {
    throw new Error("INVALID_VERIFICATION_TOKEN");
  }

  if (verificationToken.usedAt) {
    throw new Error("VERIFICATION_TOKEN_USED");
  }

  if (verificationToken.expiresAt < new Date()) {
    throw new Error("VERIFICATION_TOKEN_EXPIRED");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: verificationToken.userId,
      },
      data: {
        emailVerifiedAt: new Date(),
      },
    }),

    prisma.emailVerificationToken.update({
      where: {
        id: verificationToken.id,
      },
      data: {
        usedAt: new Date(),
      },
    }),
  ]);
};

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

export const loginAdmin = async ({
  email,
  password,
}) => {
  const normalizedEmail = email.toLowerCase().trim();

  const admin = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!admin || admin.role !== "ADMIN") {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (admin.status !== "ACTIVE") {
    throw new Error("ACCOUNT_SUSPENDED");
  }

  if (!admin.emailVerifiedAt) {
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  const passwordValid = await comparePassword(
    password,
    admin.passwordHash
  );

  if (!passwordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const familyId = generateFamilyId();

  const accessToken = generateAccessToken({
    userId: admin.id,
    role: admin.role,
  });

  const {
    token: refreshToken,
    jti,
  } = generateRefreshToken({
    userId: admin.id,
    familyId,
  });

  const tokenHash = hashToken(refreshToken);

  await prisma.refreshSession.create({
    data: {
      userId: admin.id,
      tokenHash,
      familyId,
      jti,
      expiresAt: new Date(
        Date.now() + REFRESH_TOKEN_EXPIRY
      ),
    },
  });

  return {
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
    accessToken,
    refreshToken,
  };
};

/*
|--------------------------------------------------------------------------
| REFRESH SESSION
|--------------------------------------------------------------------------
*/

export const refreshAdminSession = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("REFRESH_TOKEN_REQUIRED");
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const tokenHash = hashToken(refreshToken);

  const session = await prisma.refreshSession.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  /*
  |--------------------------------------------------------------------------
  | TOKEN REUSE DETECTION
  |--------------------------------------------------------------------------
  */

  if (!session) {
    if (payload.familyId) {
      await prisma.refreshSession.updateMany({
        where: {
          familyId: payload.familyId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    throw new Error("REFRESH_TOKEN_REUSE");
  }

  if (session.revokedAt) {
    await prisma.refreshSession.updateMany({
      where: {
        familyId: session.familyId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    throw new Error("REFRESH_TOKEN_REVOKED");
  }

  if (session.expiresAt < new Date()) {
    throw new Error("REFRESH_TOKEN_EXPIRED");
  }

  const admin = session.user;

  if (admin.role !== "ADMIN") {
    throw new Error("INVALID_ADMIN");
  }

  if (admin.status !== "ACTIVE") {
    throw new Error("ACCOUNT_SUSPENDED");
  }

  if (!admin.emailVerifiedAt) {
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  /*
  |--------------------------------------------------------------------------
  | ROTATE REFRESH TOKEN
  |--------------------------------------------------------------------------
  */

  const newAccessToken = generateAccessToken({
    userId: admin.id,
    role: admin.role,
  });

  const {
    token: newRefreshToken,
    jti,
  } = generateRefreshToken({
    userId: admin.id,
    familyId: session.familyId,
  });

  const newTokenHash = hashToken(newRefreshToken);

  await prisma.$transaction([
    prisma.refreshSession.update({
      where: {
        id: session.id,
      },
      data: {
        revokedAt: new Date(),
      },
    }),

    prisma.refreshSession.create({
      data: {
        userId: admin.id,
        tokenHash: newTokenHash,
        familyId: session.familyId,
        jti,
        expiresAt: new Date(
          Date.now() + REFRESH_TOKEN_EXPIRY
        ),
      },
    }),
  ]);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

export const logoutAdmin = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashToken(refreshToken);

  await prisma.refreshSession.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

/*
|--------------------------------------------------------------------------
| LOGOUT ALL SESSIONS
|--------------------------------------------------------------------------
*/

export const logoutAllAdminSessions = async (userId) => {
  await prisma.refreshSession.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

/*
|--------------------------------------------------------------------------
| GET CURRENT ADMIN
|--------------------------------------------------------------------------
*/

export const getCurrentAdmin = async (userId) => {
  const admin = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      emailVerifiedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!admin) {
    throw new Error("ADMIN_NOT_FOUND");
  }

  return admin;
};
