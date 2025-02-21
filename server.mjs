import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000; // Force Render to use the correct port

app.use(cors());
app.use(express.json());

// ✅ Define file path in the writable /tmp/ directory
const filePath = "/tmp/token_launch_data.json";

// ✅ Webhook endpoint
app.post("/webhook", (req, res) => {
  console.log("🚀 Received Helius Webhook:", JSON.stringify(req.body, null, 2));

  try {
    const transactions = req.body || [];

    transactions.forEach((tx) => {
      if (tx.type === "CREATE" && tx.source === "PUMP_FUN") {
        const mintAddress = tx.tokenTransfers?.[0]?.mint || "Unknown";
        const bondingCurve = tx.tokenTransfers?.[0]?.toUserAccount || "Unknown";
        const associatedBondingCurve = tx.tokenTransfers?.[1]?.toUserAccount || "Unknown";

        const launchData = {
          signature: tx.signature,
          timestamp: tx.timestamp,
          mintAddress,
          bondingCurve,
          associatedBondingCurve,
        };

        console.log("🔥 New Token Launch Detected:", launchData);
        console.log(`📂 Writing file to: ${filePath}`);

        try {
          // ✅ Overwrite the file with new data every time
          fs.writeFileSync(filePath, JSON.stringify([launchData], null, 2), "utf8");
          console.log("✅ Token launch data saved successfully.");
        } catch (fsError) {
          console.error("❌ File write error:", fsError);
        }
      }
    });

    res.status(200).json({ message: "Webhook processed successfully" });

  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    res.status(500).json({ message: "Error processing webhook" });
  }
});

// ✅ Home Route (for checking if the server is running)
app.get("/", (req, res) => {
  res.send("✅ Helius Webhook Server is Running!");
});

// ✅ Check File Route
app.get("/check-file", (req, res) => {
  try {
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, "utf8");
      res.json({ success: true, data: JSON.parse(fileData) });
    } else {
      res.json({ success: false, message: "File does not exist" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Start the server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));