import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({ limit: "12mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/analyze", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ AQ.Ab8RN6J-2Eb3SMvJcBGfqwcqMQ-n8enK-rzxNTV7XJVzwckFYg  .env ফাইলে OPENAI_API_KEY যোগ করুন।" });
    }
    const { imageData, timeframe, pair } = req.body || {};
    if (!imageData || !/^data:image\/(png|jpeg|webp);base64,/.test(imageData)) {
      return res.status(400).json({ error: "একটি PNG, JPG বা WEBP চার্টের ছবি দিন।" });
    }
    if (imageData.length > 10_000_000) {
      return res.status(413).json({ error: "ছবিটি বড়। ৭ MB-এর কম ছবি ব্যবহার করুন।" });
    }
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `তুমি একটি সতর্ক technical-chart assistant। ব্যবহারকারী একটি trading chart screenshot দিয়েছে।
Pair/asset: ${String(pair || "Not specified").slice(0,30)}
Timeframe: ${timeframe === "1m" ? "1 minute" : "5 minutes"}.
ছবিতে যা স্পষ্ট দেখা যায় শুধু সেটাই বিশ্লেষণ করো। চার্টের টাইম/প্রাইস স্কেল অস্পষ্ট হলে তা বলো; কোনো দাম বা indicator বানিয়ে বলবে না।
বাংলায় উত্তর দাও এবং এই কাঠামো অনুসরণ করো:
1) Bias: UP / DOWN / SIDEWAYS / NOT CLEAR
2) সম্ভাব্য সেটআপ: BUY / SELL / WAIT (এটি নিশ্চয়তা নয়)
3) ছবিতে দৃশ্যমান প্রমাণ: trend/structure, candle pattern, support-resistance, indicators (শুধু দৃশ্যমান হলে)
4) Entry zone, Stop Loss, Take Profit: কেবল স্কেল ও দাম নির্ভরযোগ্যভাবে পড়া গেলে; নইলে "ছবি থেকে নির্ভরযোগ্যভাবে নির্ধারণ করা যাচ্ছে না"
5) Risk note: invalidation এবং ঝুঁকি।
6) Confidence: Low / Medium / High — জয়ের সম্ভাবনার শতাংশ দেবে না।
অবশ্যই জানাবে screenshot-ভিত্তিক বিশ্লেষণ পুরোনো হতে পারে এবং এটি আর্থিক পরামর্শ নয়। কোনো trade execute করবে না।`;
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6-astra",
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          { type: "input_image", image_url: imageData, detail: "high" }
        ]
      }]
    });
    res.json({ analysis: response.output_text || "বিশ্লেষণের লেখা পাওয়া যায়নি। আবার চেষ্টা করুন।" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "বিশ্লেষণ করা যায়নি। API key, model access এবং server log পরীক্ষা করুন।" });
  }
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`DIP AI Trading running at http://localhost:${port}`));
