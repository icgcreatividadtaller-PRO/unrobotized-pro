import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
// Cambiamos esto para que busque en la raíz, no en 'public'
app.use(express.static('.')); 

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/optimize', async (req, res) => {
  try {
    const { message, tone } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: `Eres un experto en comunicación humana. Tu misión es "unrobotizar" el siguiente texto, dándole un tono ${tone || 'natural y profesional'}.` },
        { role: "user", content: message }
      ],
    });
    res.json({ optimized: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al conectar con la IA." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor listo`);
});