const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const admin = require("firebase-admin");

dotenv.config();
const app = express();

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  try {
    const saPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./ServiceAccountKey.json";
    const saFullPath = require("path").resolve(saPath);

    if (require("fs").existsSync(saFullPath)) {
      admin.initializeApp({
        credential: admin.credential.cert(require(saFullPath)),
      });
      console.log("🔥 Firebase Admin Initialized (Key File)");
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      admin.initializeApp({
        credential: admin.credential.cert(
          JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON),
        ),
      });
      console.log("🔥 Firebase Admin Initialized (Env Variable)");
    } else {
      console.warn("⚠️ Firebase Admin NOT Initialized (No credentials found)");
    }
  } catch (error) {
    if (error.code === "app/duplicate-app") {
      console.log("🔥 Firebase Admin already initialized (re-use)");
    } else {
      console.error("❌ Firebase Initialization Error:", error.message);
    }
  }
}

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((s) => s.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/collections", require("./routes/collectionRoutes"));
app.use("/api/testimonials", require("./routes/testimonialRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

app.get("/", (req, res) => res.send("API Regular"));

// GET /api/health/email  – diagnose SMTP config from production
// Protect with a HEALTH_TOKEN env var to avoid exposing config publicly
app.get("/api/health/email", async (req, res) => {
  const token = req.query.token || req.headers["x-health-token"];
  if (!process.env.HEALTH_TOKEN || token !== process.env.HEALTH_TOKEN) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const { verifyEmailConfig } = require("./services/notificationService");
  const result = await verifyEmailConfig();
  res.status(result.ok ? 200 : 500).json(result);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("running"));
