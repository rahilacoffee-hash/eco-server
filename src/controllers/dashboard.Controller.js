import { getDashboardData } from "../services/dashboard.Service.js";

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD
|--------------------------------------------------------------------------
*/

// GET /api/admin/dashboard
export const getDashboard = async (req, res) => {
  try {
    const dashboard = await getDashboardData();

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Get dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard",
    });
  }
};