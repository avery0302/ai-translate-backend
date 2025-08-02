import axios from "axios";
import "dotenv/config";

export default async function handler(req, res) {
  // 允许所有来源访问，生产环境建议限制为具体域名
  res.setHeader("Access-Control-Allow-Origin", "*");
  // 允许的请求方法
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  // 允许的请求头
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  // 预检请求直接响应
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { text, langCode, langName } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing 'text' in request body" });
  }

  try {
    const response = await tts(text, langCode, langName);
    const audioBuffer = Buffer.from(response.data.audioContent, "base64");
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(audioBuffer);
  } catch (error) {
    return res.status(500).json({ error: "TTS failed" });
  }
}

async function tts(text, langCode, langName) {
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_API_KEY}`;
  const body = {
    input: { text },
    voice: { languageCode: langCode, name: langName },
    audioConfig: { audioEncoding: "MP3" },
  };

  const response = await axios.post(url, body, {
    headers: { "Content-Type": "application/json" },
  });
  return response;
}
