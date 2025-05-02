const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://nishat-frontend.vercel.app'],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json());

const UploadImage = require("./src/utils/UploadImage");

// api routes
const useRouter = require("./src/users/user.route");
const productRoutes = require("./src/products/product.route");
const reviewsRoutes = require("./src/reviews/review.route");
const ordersRoutes = require("./src/orders/order.route");
const statsRoutes = require("./src/stats/stats.route");

// api
app.use("/api/auth", useRouter);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/stats", statsRoutes);

async function main() {
  await mongoose.connect(process.env.DB_URI);

  app.get("/", (req, res) => {
    res.send("Server is running!");
  });
}

main()
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => console.log(err));

  // upload image to cloudinary server
  app.post('/uploadImage',  (req, res) => {
    UploadImage(req.body.image)
    .then((url) => res.send(url))
    .catch((error) => res.status(500).send(error));
  })

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});

// JaBpgCn3fV4rVKhq            naimurrahmun34
