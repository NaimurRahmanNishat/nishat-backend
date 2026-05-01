const Products = require("./product.model");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const Reviews = require("../reviews/review.model");

// create a new product
const createNewProduct = async (req, res) => {
    try {
        const newProduct = new Products({ ...req.body });
        const savedProduct = await newProduct.save();

        // calculate average rating for the product
        const reviews = await Reviews.find({ productId: savedProduct._id });
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            const averageRating = totalRating / reviews.length;
            savedProduct.rating = averageRating;
            await savedProduct.save();
        }

        return successResponse(res, 200, "Product created successfully!", savedProduct);
    } catch (error) {
        return errorResponse(res, 500, "Failed to create new product!", error);
    }
};

// get all products
// const getAllProducts = async (req, res) => {
//     try {
//         const product = await Products.find({}).sort({ createdAt: -1 });

//         // all product filtering
//         const {category, color, minPrice, maxPrice, page=1, limit=8} = req.query;
//         const filter = {};
//         if(category && category !== "all"){
//             filter.category = category;
//         }
//         if(color && color !== "all"){
//             filter.color = color;
//         }
//         if(minPrice && maxPrice){
//             const min = parseFloat(minPrice);
//             const max = parseFloat(maxPrice);
//             if(!isNaN(min) && !isNaN(max)){
//                 filter.price = { $gte: min, $lte: max };
//             }
//         }

//         // pagination and filtering
//         const skip = (parseInt(page) - 1) * parseInt(limit);
//         const totalProducts = await Products.countDocuments(filter);
//         const totalPage = Math.ceil(totalProducts / parseInt(limit))
//         const products = await Products.find(filter)
//             .skip(skip)
//             .limit(parseInt(limit))
//             .populate('author', 'username email')
//             .sort({ createdAt: -1 });
        
//         return successResponse(res, 200, "Successfully get all products!", data={products, totalPage, totalProducts});
//     } catch (error) {
//         return errorResponse(res, 500, "Failed to get all products!", error);
//     }
// };

const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      color,
      minPrice,
      maxPrice,
      page = 1,
      limit = 8,
    } = req.query;

    const filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (color && color !== "all") {
      filter.color = color;
    }

    // price filter
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice && !isNaN(parseFloat(minPrice))) {
        filter.price.$gte = parseFloat(minPrice);
      }

      if (maxPrice && !isNaN(parseFloat(maxPrice))) {
        filter.price.$lte = parseFloat(maxPrice);
      }
    }

    // pagination safe
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 8;
    const skip = (pageNumber - 1) * limitNumber;

    const totalProducts = await Products.countDocuments(filter);
    const totalPage = Math.ceil(totalProducts / limitNumber);

    const products = await Products.find(filter)
      .skip(skip)
      .limit(limitNumber)
      .populate("author", "username email")
      .sort({ createdAt: -1 });

    return successResponse(
      res,
      200,
      "Successfully get all products!",
      { products, totalPage, totalProducts }
    );
  } catch (error) {
    return errorResponse(res, 500, "Failed to get all products!", error);
  }
};


// get a single prolducts
const getSingleProduct = async (req, res) => {
    const {id} = req.params;
    try {
        const product = await Products.findById(id).populate('author', 'username email');
        if(!product){
            return errorResponse(res, 404, "Product not found!");
        }
        const reviews = await Reviews.find({ productId: id }).populate('userId', 'username email');
        return successResponse(res, 200, "Successfully get single product!", data={product, reviews});

    } catch (error) {
        return errorResponse(res, 500, "Failed to get single product!", error);
    }
};

// update a single product
const updateProductById = async (req, res) => {
    const productId = req.params.id;
    try {
        const updatedProduct = await Products.findByIdAndUpdate(productId, {...req.body}, { new: true });
        if(!updatedProduct){
            return errorResponse(res, 404, "Product not found!");
        }
        return successResponse(res, 200, "Successfully updated product!", updatedProduct);
    } catch (error) {
        return errorResponse(res, 500, "Failed to update product!", error);
    }
}

// delete product by Id (admin access only)
const deleteProductById = async (req, res) => {
    const productId = req.params.id;
    try {
        const deletedProduct = await Products.findByIdAndDelete(productId);
        if(!deletedProduct){
            return errorResponse(res, 404, "Product not found!");
        }
        await Reviews.deleteMany({ productId });
        return successResponse(res, 200, "Successfully deleted product!");
    } catch (error) {
        return errorResponse(res, 500, "Failed to delete product!", error);
    }
}

// categories base all product 
const showAllCategories = async (req, res) => {
    try {
        const { category } = req.query;

        if (!category) {
            return errorResponse(res, 400, "Category query parameter is required!");
        }
        const products = await Products.find({ category: category }).sort({ createdAt: -1 });
        if (products.length === 0) {
            return successResponse(res, 200, "No products found for the given category!", []);
        }
        // Redirect to the category page with the products
        return successResponse(res, 200, "Successfully found products by category!", products);
        
    } catch (error) {
        return errorResponse(res, 500, "Failed to show all products!", error);
    }
};

module.exports = { createNewProduct, getAllProducts, getSingleProduct, updateProductById, deleteProductById, showAllCategories };
