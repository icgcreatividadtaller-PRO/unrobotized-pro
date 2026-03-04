import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const prompts = {
  // Ajuste: Más corto y agresivo (Directo al beneficio)
  directo: "Eres un cerrador de ventas de alto nivel. Escribe un mensaje extremadamente corto, directo y agresivo. Cero rellenos, cero saludos vacíos. Ve directo a la yugular con el beneficio o la propuesta. Máximo 250 caracteres.",
  
  curioso: "Eres un experto en psicología persuasiva. Genera curiosidad absoluta. Haz una observación aguda sobre su negocio y termina con una pregunta que los obligue a responder.",
  
  // Ajuste: Emojis estratégicos y tono casual
  whatsapp: "Escribe como un humano real en un chat de WhatsApp. Usa un tono muy casual, algunas minúsculas al inicio y añade 1 o 2 emojis estratégicos (🚀, 💡, 🎯) para generar cercanía. Que parezca escrito rápido desde un móvil."
};

app.post('/api/optimize', async (req, res) => {
  try {
    const { message, tone } = req.body;
    const selectedPrompt = prompts[tone] || prompts.directo;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: selectedPrompt },
        { role: "user", content: `Humaniza este mensaje: "${message}"` }
      ],
      temperature: 0.8,
    });

    res.json({ optimized: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Error de sistema." });
  }
});

export default app;
