const verifyAdmin = (req, res, next) => {
    if (req.role !== "admin") {
        return res.status(403).send({ message: "Access denied! Only admin can access!" });
    }
    next();
}

module.exports = verifyAdmin;