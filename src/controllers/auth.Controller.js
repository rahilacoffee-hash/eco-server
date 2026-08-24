import {
  createAdmin as createAdminService,
  verifyEmail as verifyEmailService,
  loginAdmin,
  refreshAdminSession,
  logoutAdmin,
  logoutAllAdminSessions,
  getCurrentAdmin,
} from "../services/auth.Service.js";

import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/cookies.js";

/*
|--------------------------------------------------------------------------
| CREATE ADMIN
|--------------------------------------------------------------------------
*/

export const createAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      adminSecret,
    } = req.body;

    if (!name || !email || !password || !adminSecret) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password and admin secret are required",
      });
    }

    const admin = await createAdminService({
      name,
      email,
      password,
      adminSecret,
    });

    return res.status(201).json({
      success: true,
      message:
        "Admin account created. Please check your email to verify your account.",
      data: {
        admin,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);

    switch (error.message) {
      case "INVALID_ADMIN_SECRET":
        return res.status(403).json({
          success: false,
          message: "Invalid admin secret",
        });

      case "EMAIL_ALREADY_EXISTS":
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists",
        });

      case "PASSWORD_TOO_SHORT":
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters",
        });

      default:
        return res.status(500).json({
          success: false,
          message: "Unable to create admin account",
        });
    }
  }
};

/*
|--------------------------------------------------------------------------
| VERIFY EMAIL
|--------------------------------------------------------------------------
*/

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    await verifyEmailService(token);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify email error:", error);

    switch (error.message) {
      case "VERIFICATION_TOKEN_REQUIRED":
        return res.status(400).json({
          success: false,
          message: "Verification token is required",
        });

      case "INVALID_VERIFICATION_TOKEN":
        return res.status(400).json({
          success: false,
          message: "Invalid verification token",
        });

      case "VERIFICATION_TOKEN_USED":
        return res.status(400).json({
          success: false,
          message: "Verification token has already been used",
        });

      case "VERIFICATION_TOKEN_EXPIRED":
        return res.status(400).json({
          success: false,
          message: "Verification token has expired",
        });

      default:
        return res.status(500).json({
          success: false,
          message: "Unable to verify email",
        });
    }
  }
};

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

export const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await loginAdmin({
      email,
      password,
    });

    setRefreshTokenCookie(
      res,
      result.refreshToken
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",

      data: {
        admin: result.admin,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    switch (error.message) {
      case "INVALID_CREDENTIALS":
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });

      case "ACCOUNT_SUSPENDED":
        return res.status(403).json({
          success: false,
          message: "Admin account is suspended",
        });

      case "EMAIL_NOT_VERIFIED":
        return res.status(403).json({
          success: false,
          message:
            "Please verify your email before logging in",
        });

      default:
        return res.status(500).json({
          success: false,
          message: "Unable to login",
        });
    }
  }
};

/*
|--------------------------------------------------------------------------
| REFRESH ACCESS TOKEN
|--------------------------------------------------------------------------
*/

export const refresh = async (req, res) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const result =
      await refreshAdminSession(refreshToken);

    setRefreshTokenCookie(
      res,
      result.refreshToken
    );

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",

      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    console.error("Refresh error:", error);

    clearRefreshTokenCookie(res);

    switch (error.message) {
      case "REFRESH_TOKEN_REQUIRED":
      case "INVALID_REFRESH_TOKEN":
      case "REFRESH_TOKEN_EXPIRED":
      case "REFRESH_TOKEN_REVOKED":
      case "REFRESH_TOKEN_REUSE":
        return res.status(401).json({
          success: false,
          message: "Session expired. Please login again.",
        });

      case "ACCOUNT_SUSPENDED":
        return res.status(403).json({
          success: false,
          message: "Admin account is suspended",
        });

      case "EMAIL_NOT_VERIFIED":
        return res.status(403).json({
          success: false,
          message: "Email is not verified",
        });

      default:
        return res.status(500).json({
          success: false,
          message: "Unable to refresh session",
        });
    }
  }
};

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

export const logout = async (req, res) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken;

    await logoutAdmin(refreshToken);

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);

    clearRefreshTokenCookie(res);

    return res.status(500).json({
      success: false,
      message: "Unable to logout",
    });
  }
};

/*
|--------------------------------------------------------------------------
| LOGOUT ALL DEVICES
|--------------------------------------------------------------------------
*/

export const logoutAll = async (req, res) => {
  try {
    await logoutAllAdminSessions(
      req.user.id
    );

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: "All sessions have been logged out",
    });
  } catch (error) {
    console.error("Logout all error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to logout all sessions",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CURRENT ADMIN
|--------------------------------------------------------------------------
*/

export const me = async (req, res) => {
  try {
    const admin =
      await getCurrentAdmin(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        admin,
      },
    });
  } catch (error) {
    console.error("Get admin error:", error);

    if (error.message === "ADMIN_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to fetch admin",
    });
  }
};
