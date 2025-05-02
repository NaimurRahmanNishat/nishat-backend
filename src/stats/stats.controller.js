const { errorResponse, successResponse } = require("../utils/responseHandler");
const User = require("../users/user.model");
const Order = require("../orders/order.model");
const Reviews = require("../reviews/review.model");
const Products = require("../products/product.model");

// user stats
const userStats = async (req, res) => {
  const { email } = req.params;
  if (!email) {
    return errorResponse(res, 400, "Email is required!");
  }
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return errorResponse(res, 404, "User not found!");
    }
    // total payments
    const totalPaymentsResult = await Order.aggregate([
      { $match: { email } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalPaymentsAmount =
      totalPaymentsResult.length > 0 ? totalPaymentsResult[0].totalAmount : 0;

    // total reviews
    const totalReviews =  await Reviews.countDocuments({userId: user._id})

    // purchasesed products
    const purchasedProductsIds = await Order.distinct("products.productId", {
      email: email,
    });
    const totalPurchasedProducts = purchasedProductsIds.length;
    return successResponse(
      res,
      200,
      "Successfully get total payments!",
      (data = {
        totalPayments: Number(totalPaymentsAmount.toFixed(2)),
        totalPurchasedProducts,
        totalReviews,
      })
    );
  } catch (error) {
    errorResponse(res, 500, "Failed to get total payments!", error);
  }
};

// admin stats
const adminStats = async (req, res) => {
  try {
    // count total orders
    const totalOrders = await Order.countDocuments();

    // count total products
    const totalProducts = await Products.countDocuments();

    // count total reviews
    const totalReviews = await Reviews.countDocuments();

    // count total users
    const totalUsers = await User.countDocuments();

    // calculate total earnings by summing the amount of each order
    const totalEarningsResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalEarnings =
      totalEarningsResult.length > 0 ? totalEarningsResult[0].totalAmount : 0;

    const monthlyEarningsResult = await Order.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          monthlyEarnings: { $sum: "$amount" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);
    const monthlyEarnings = monthlyEarningsResult.map((item) => ({
      month: item.monthlyEarnings,
      year: item._id.year,
      earnings: item.monthlyEarnings,
    }));

    return successResponse(
      res,
      200,
      "Successfully get admin stats!",
      (data = { totalOrders, totalProducts, totalReviews, totalUsers, totalEarnings, monthlyEarnings })
    );
  } catch (error) {
    return errorResponse(res, 500, "Failed to get admin stats!", error);
  }
};

module.exports = { userStats, adminStats };
