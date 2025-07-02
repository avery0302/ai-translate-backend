import axios from "axios";
import "dotenv/config";

console.log("@process.env.OPENROUTER_API_KEY",process.env.OPENROUTER_API_KEY);

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
        model: "openai/gpt-4.1-nano",
        messages: [
          {
            role: "user",
            content: `“${text}”。
Translate the above into most common Chinese.
If the input is a proper noun, brand, or product name, translate it into the commonly used Chinese name.
As concise as possible.
Do NOT include pinyin or English explanations.
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
