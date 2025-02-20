import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Define file path in a writable directory
const filePath = path.join(process.cwd(), "token_launch_data.json");

// Webhook endpoint
app.post("/webhook", (req, res) => {
  console.log("\ud83d\ude80 Received Helius Webhook:", JSON.stringify(req.body, null, 2));

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

        console.log("\ud83d\udd25 New Token Launch Detected:", launchData);

        // Log file path
        console.log(`\ud83d\udcda Writing file to: ${filePath}`);

        try {
          // Ensure file exists before writing
          if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, "[]", { flag: "w" }); // Create empty JSON array
          }

          // Read existing data
          const fileData = fs.readFileSync(filePath, "utf8");
          const jsonData = fileData ? JSON.parse(fileData) : [];

          // Remove old entry if it exists (avoiding duplicates)
          const updatedData = jsonData.filter(entry => entry.signature !== launchData.signature);
          
          // Append new entry
          updatedData.push(launchData);

          // Write updated data back to file
          fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));

          console.log("\u2705 Token launch data saved successfully.");
        } catch (fsError) {
          console.error("\u274c File write error:", fsError);
        }
      }
    });

    res.status(200).json({ message: "Webhook processed successfully" });

  } catch (error) {
    console.error("\u274c Error processing webhook:", error);
    res.status(500).json({ message: "Error processing webhook" });
  }
});

// Home Route (for checking if the server is running)
app.get("/", (req, res) => {
  res.send("\u2705 Helius Webhook Server is Running!");
});

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

// Start the server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
