export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error' });
    const { text, mode } = req.body;
    const API_KEY = process.env.OPENAI_API_KEY;

    if (!API_KEY) return res.status(500).json({ error: "Falta la llave de OpenAI en Vercel." });

    // Instrucciones diseñadas para máxima calidez y motivación
    const instructions = {
        directo: "Actúa como un mentor empático. Reescribe este mensaje para que sea cálido, profesional y humano. Quita cualquier rastro de agresividad o frialdad, pero mantén la autoridad.",
        curioso: "Transforma esto en una pregunta intrigante que despierte curiosidad genuina y conexión emocional. Que no parezca un robot vendiendo.",
        whatsapp: "Usa un tono de chat muy cercano, relajado, con minúsculas casuales y sin puntos finales. Que parezca un mensaje de un amigo que quiere ayudar."
    };

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: instructions[mode] || instructions.directo },
                    { role: "user", content: text }
                ],
                temperature: 0.8 // Un poco de "creatividad" para que suene más humano
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0].message) {
            return res.status(200).json({ 
                humanizedText: data.choices[0].message.content.trim() 
            });
        }

        return res.status(500).json({ error: "OpenAI no pudo procesar el misil.", details: data });

    } catch (e) {
        return res.status(500).json({ error: "Fallo de conexión con la central." });
    }
}
