const Products = require("../products/product.model");
const { errorResponse, successResponse } = require("../utils/responseHandler");
const Reviews = require("./review.model");

// post a review
const postAReview = async (req, res) => {
    try {
        const {comment, rating, userId, productId} = req.body;
        if(!comment || rating === undefined || !userId || !productId) {
            return errorResponse(res, 400, "Missing required fields!");
        }
        const existingReview = await Reviews.findOne({userId, productId});
        if(existingReview) {
            existingReview.comment = comment;
            existingReview.rating = rating;
            await existingReview.save();
        }else {
            const newReview = new Reviews({comment, rating, userId, productId});
            await newReview.save();
        }
        const reviews = await Reviews.find({productId});
        if(reviews.length > 0) {
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            const averageRating = totalRating / reviews.length;
            const product = await Products.findById(productId);
            if(product) {
                product.rating = averageRating;
                await product.save({validateBeforeSave: false});
            }else{
                return errorResponse(res, 404, "Product not found!");
            }
        }
        return successResponse(res, 200, "Successfully posted a review!", data={reviews});
    } catch (error) {
        return errorResponse(res, 500, "Failed to post a review!", error);
    }
};

// get all reviews
const getUsersReview = async (req, res) => {
    const {userId} = req.params;
    try {
        if(!userId) {
            return errorResponse(res, 400, "Missing required fields!");
        }
        const reviews = await Reviews.find({userId});
        if(reviews.length === 0) {
            return errorResponse(res, 404, "No reviews found!");
        }
        return successResponse(res, 200, "Successfully get all reviews!", reviews);
    } catch (error) {
        return errorResponse(res, 500, "Failed to get all reviews!", error);
    }
}

// get total reviews count
const getTotalReviewsCount = async (req, res) =>{
    try {
        const totalReviews = await Reviews.countDocuments({});
        return successResponse(res, 200, "Total reviews count fetched Successfully!", totalReviews);
    } catch (error) {
        return errorResponse(res, 500, "Failed to get total reviews count!", error);
    }
};

module.exports = { postAReview, getUsersReview, getTotalReviewsCount };