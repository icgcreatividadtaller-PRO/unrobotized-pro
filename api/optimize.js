import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json());

// Inicializamos OpenAI con tu llave segura de la bóveda (Vercel Env)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Definición de los "Cerebros" tácticos
const prompts = {
  directo: "Eres un estratega de ventas B2B. Escribe un mensaje directo, sin rellenos ni saludos genéricos. Empieza con una observación de valor o un beneficio claro. Máximo 2 párrafos cortos.",
  curioso: "Eres un experto en psicología persuasiva. Tu objetivo es generar curiosidad genuina. Haz una observación aguda sobre su industria y termina con una pregunta abierta que sea imposible de ignorar.",
  whatsapp: "Escribe como un humano real en un chat casual. Usa un tono relajado, algunas minúsculas al inicio, evita párrafos largos y usa máximo un emoji. Que parezca un mensaje escrito desde el móvil por un socio."
};

app.post('/api/optimize', async (req, res) => {
  try {
    const { message, tone } = req.body;

    // Si el tono no existe o falla, usamos 'directo' por defecto
    const selectedSystemPrompt = prompts[tone] || prompts.directo;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Usamos el modelo más rápido y eficiente para 2026
      messages: [
        { 
          role: "system", 
          content: selectedSystemPrompt 
        },
        { 
          role: "user", 
          content: `Humaniza el siguiente mensaje, manteniendo la esencia pero mejorando la conversión: "${message}"` 
        }
      ],
      temperature: 0.7, // Nivel de creatividad equilibrado
    });

    const optimizedText = completion.choices[0].message.content;
    
    // Enviamos el misil de vuelta a tu interfaz neón
    res.json({ optimized: optimizedText });

  } catch (error) {
    console.error("Error en la bóveda OpenAI:", error);
    res.status(500).json({ error: "SISTEMA: Error al procesar el Misil de Ventas." });
  }
});

export default app;
