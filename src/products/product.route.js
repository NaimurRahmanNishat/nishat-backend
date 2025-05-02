const express = require("express");
const { createNewProduct, getAllProducts, getSingleProduct, updateProductById, deleteProductById, showAllCategories } = require("./product.controller");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();

// create a product (admin only)
router.post("/create-product", verifyToken , verifyAdmin ,  createNewProduct);

// get all products
router.get("/", getAllProducts);


// categories base show all product
// router.get("/categories/search", showAllCategories);
router.get("/categories", showAllCategories);

// get a single products
router.get("/:id", getSingleProduct);

// update a single product (only admin access)
router.patch("/update-product/:id", verifyToken , verifyAdmin , updateProductById);

// delete a single product (only admin access)
router.delete("/:id", verifyToken , verifyAdmin, deleteProductById);



module.exports = router;