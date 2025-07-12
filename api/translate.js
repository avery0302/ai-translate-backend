import axios from "axios";
import "dotenv/config";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing 'text' in request body" });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemma-3-4b-it:free", // openai/gpt-4.1-nano
        messages: [
          {
            role: "user",
            content: `“${text}”。
Translate the above into the most natural and commonly used version in the other language.
If it’s English, translate to Chinese.
If it’s Chinese, translate to English.
If it’s a brand, product, or proper noun, use the widely accepted version.
Output only the translated result. Do not include the original text, explanations, pinyin, or formatting.
`,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
      },
    );

    const translation =
      response.data.choices?.[0]?.message?.content || "No translation";

    return res.status(200).json({ translation });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
