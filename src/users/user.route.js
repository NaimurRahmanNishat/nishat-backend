const express = require("express");
const { userRegistration, userLoggedIn, userLogout, getAllUsers, deleteUser, updateUserRole, editUserProfile } = require("./user.controller");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();

// register endpoint
router.post("/register", userRegistration);

// login endpoint 
router.post("/login", userLoggedIn);

// logout endpoint
router.post("/logout", userLogout);

// get all users endpoints (token verify and admin)
router.get("/users", verifyToken , verifyAdmin , getAllUsers);

// delete user endpoint (only admin access)
router.delete("/users/:id", verifyToken , verifyAdmin , deleteUser);

// update user role (by admin only)
router.put("/users/:id", verifyToken , verifyAdmin , updateUserRole);

// edit user profile
router.patch("/edit-profile/:id", verifyToken , editUserProfile);

module.exports = router;
