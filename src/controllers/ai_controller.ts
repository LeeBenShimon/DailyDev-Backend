import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);


const promptPath = path.join(__dirname, '../prompts/coding_challenge_prompt.txt');
const rawPrompt = fs.readFileSync(promptPath, 'utf-8');

class AiController {
  async askGemini(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { topic } = req.body;

    if (!topic) {
      res.status(400).json({ error: "Missing topic" });
      return;
    }

    
    const prompt = rawPrompt.replace('{topic}', topic);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = result.response;

      res.status(200).json({ challenge: response.text() });
    } catch (error) {
      console.error("Gemini error:", error);
      next(error);
    }
  }
}

export const aiController = new AiController();
