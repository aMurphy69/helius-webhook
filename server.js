import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// File path for storing token launches
const FILE_PATH = "token_launches.json";

// Function to load existing token launches
const loadTokenLaunches = () => {
  if (!fs.existsSync(FILE_PATH)) return [];
  return JSON.parse(fs.readFileSync(FILE_PATH, "utf8"));
};

// Function to save token launches
const saveTokenLaunches = (newData) => {
  const existingData = loadTokenLaunches();
  existingData.push(newData);
  fs.writeFileSync(FILE_PATH, JSON.stringify(existingData, null, 2));
};

// Webhook endpoint
app.post("/webhook", (req, res) => {
  console.log("🚀 Received Helius Webhook:", JSON.stringify(req.body, null, 2));

  try {
    const transactions = req.body || [];

    transactions.forEach((tx) => {
      if (tx.type === "CREATE" && tx.source === "PUMP_FUN") {
        const mintAddress = tx.tokenTransfers?.[0]?.mint || "Unknown";
        const bondingCurve = tx.tokenTransfers?.[0]?.toUserAccount || "Unknown";
        const associatedBondingCurve = tx.tokenTransfers?.[1]?.toUserAccount || "Unknown";

        // Extract metadata (if available)
        const metadata = tx.events?.metadata || {
          name: "Unknown",
          symbol: "Unknown",
          uri: "Unknown"
        };

        const launchData = {
          signature: tx.signature,
          timestamp: tx.timestamp,
          mintAddress,
          bondingCurve,
          associatedBondingCurve,
          metadata
        };

        console.log("🔥 New Token Launch Detected:", launchData);

        // Save to file only if the transaction is new
        const existingData = loadTokenLaunches();
        if (!existingData.some((entry) => entry.signature === tx.signature)) {
          saveTokenLaunches(launchData);
          console.log("✅ Token launch saved.");
        } else {
          console.log("⚠️ Duplicate transaction detected, skipping save.");
        }

        // TODO: Implement trading logic (e.g., trigger buy orders)
      }
    });

    res.status(200).json({ message: "Webhook processed successfully" });

  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    res.status(500).json({ message: "Error processing webhook" });
  }
});

// Home Route (for checking if the server is running)
app.get("/", (req, res) => {
  res.send("✅ Helius Webhook Server is Running!");
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));