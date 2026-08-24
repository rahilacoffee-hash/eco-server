import prisma from "../config/prisma.js";
import { verifyAccessToken } from "../utils/jwt.js";

const unauthorized = (res, message = "Authentication required") => {
  return res.status(401).json({
    success: false,
    message,
  });
};

/*
|--------------------------------------------------------------------------
| REQUIRE ADMIN
|--------------------------------------------------------------------------
|
| Access tokens are sent as: Authorization: Bearer <access-token>.
| The database lookup ensures a previously issued token cannot continue to
| access admin routes after its account has been suspended or removed.
|
*/
export const requireAdmin = async (req, res, next) => {
  const authorization = req.get("authorization");

  if (!authorization) {
    return unauthorized(res);
  }

  const [scheme, token, ...extra] = authorization.trim().split(/\s+/);

  if (
    scheme?.toLowerCase() !== "bearer" ||
    !token ||
    extra.length > 0
  ) {
    return unauthorized(res, "Invalid authorization header");
  }

  let payload;

  try {
    payload = verifyAccessToken(token);
  } catch {
    return unauthorized(res, "Invalid or expired access token");
  }

  if (!payload.sub || payload.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  try {
    const admin = await prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
      },
    });

    if (!admin) {
      return unauthorized(res, "Invalid or expired access token");
    }

    if (admin.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    if (admin.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Admin account is suspended",
      });
    }

    if (!admin.emailVerifiedAt) {
      return res.status(403).json({
        success: false,
        message: "Email is not verified",
      });
    }

    req.user = {
      id: admin.id,
      role: admin.role,
    };

    return next();
  } catch (error) {
    console.error("Admin authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to authenticate admin",
    });
  }
};
