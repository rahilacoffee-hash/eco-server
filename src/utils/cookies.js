const isProduction = process.env.NODE_ENV === "production";

export const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
  });
};