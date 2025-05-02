const { errorResponse, successResponse } = require("../utils/responseHandler");
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;           //TODO: uncomment this when done
        // const token = req.headers.authorization.split(" ")[1];
        // console.log("Token from cookie: ", token);

        if (!token) {
            return successResponse(res, 401, "Unauthenticated access!");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if(!decoded.userId) {
            return successResponse(res, 403, "Access denied!");
        }
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    } catch (error) {
        errorResponse(res, 500, "Invalid token!", error);
    }
};

module.exports = verifyToken;