import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Webhook endpoint
app.post("/webhook", (req, res) => {
  console.log("🚀 Received Helius Webhook:", JSON.stringify(req.body, null, 2));
  res.status(200).json({ message: "Webhook received" });
});

// Home Route (for checking if the server is running)
app.get("/", (req, res) => {
  res.send("✅ Helius Webhook Server is Running!");
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
