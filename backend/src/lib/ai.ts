import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export const groq = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    })
  : null;

export const getAIClient = () => groq || openai;
export const getAIModel = () => groq ? 'llama-3.3-70b-versatile' : 'gpt-3.5-turbo';
