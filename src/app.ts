import express from "express";
import {SessionsClient} from "@google-cloud/dialogflow-cx";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Khai báo biến môi trường
const projectId = process.env.PROJECT_ID;
const location = process.env.LOCATION; // e.g., "global", "us-central1"
const agentId = process.env.AGENT_ID;

const credentialsPath = path.join(
  __dirname,
  process.env.GOOGLE_APPLICATION_CREDENTIALS!
);

// Khởi tạo client
const sessionClient = new SessionsClient({keyFilename: credentialsPath});

app.get("/", async (req, res) => {
  res.json("OK");
});

// API Endpoint
app.post("/chat", async (req, res) => {
  const {message, sessionId} = req.body;
  try {
    async function detectIntent(text: any) {
      const sessionPath = sessionClient.projectLocationAgentSessionPath(
        projectId!,
        location!,
        agentId!,
        sessionId
      );

      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: text,
          },
          languageCode: "vi", // Điều chỉnh theo ngôn ngữ của bạn
        },
      };

      const [response] = await sessionClient.detectIntent(request);
      const messages = response.queryResult?.responseMessages
        ?.map((msg) => msg.text?.text)
        .flat();

      return messages?.join(" ");
    }

    const result = await detectIntent(message);
    res.json({response: result});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({error: "Internal Server Error"});
  }
});

// Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log({
    projectId,
    location,
    agentId,
    key: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });

  console.log(`Server is running on port ${PORT}`);
});

export default app;
