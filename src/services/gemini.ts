import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
// Ensure VITE_GEMINI_API_KEY is set in your .env file
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Missing VITE_GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

export interface GeneratedContent {
    title: string;
    body: string;
    tags: string[];
}

export const generateBlogContent = async (topic: string, tone: 'professional' | 'casual' | 'technical' = 'professional'): Promise<GeneratedContent> => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      Act as an expert technical content writer. Write a blog post about: "${topic}".
      
      Tone: ${tone}.
      Language: Spanish (Español).
      
      Structure the response strictly as valid JSON with the following fields:
      {
        "title": "Catchy and SEO-optimized title",
        "body": "The full blog post content in Markdown format. Use ## for headers, bullet points, and code blocks if necessary.",
        "tags": ["tag1", "tag2", "tag3"]
      }
      
      Do not include any text outside the JSON object.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown code block formatting from the response
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanText);
    } catch (error: any) {
        console.error("Error generating content with Gemini:", error);
        // Log key status for debugging (safe log)
        console.log("API Key Status:", API_KEY ? `Present (starts with ${API_KEY.substring(0, 4)}...)` : "Missing");

        const originalMessage = error?.message || error?.toString() || "Unknown error";
        throw new Error(`Gemini API Error: ${originalMessage}`);
    }
};
