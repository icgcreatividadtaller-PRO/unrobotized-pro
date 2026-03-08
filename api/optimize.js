export default async function handler(req, res) {
    // Solo aceptamos peticiones POST
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error de método' });

    const { text, mode } = req.body;
    const API_KEY = process.env.OPENAI_API_KEY;

    // Validación de seguridad
    if (!API_KEY) return res.status(500).json({ error: "Falta la llave OPENAI_API_KEY en Vercel." });
    if (!text) return res.status(400).json({ error: "No enviaste texto para optimizar." });

    const instructions = {
        directo: "Actúa como un mentor empático. Reescribe este mensaje para que sea cálido, profesional y humano. Elimina la frialdad.",
        curioso: "Transforma esto en una pregunta intrigante que despierte curiosidad genuina. Que no parezca un robot.",
        whatsapp: "Usa un tono de chat cercano, relajado, con minúsculas casuales y sin puntos finales."
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
                temperature: 0.8
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0].message) {
            return res.status(200).json({ 
                humanizedText: data.choices[0].message.content.trim() 
            });
        }

        return res.status(500).json({ 
            error: "OpenAI rechazó la misión.", 
            details: data.error ? data.error.message : "Error desconocido" 
        });

    } catch (e) {
        return res.status(500).json({ error: "Error de red: " + e.message });
    }
}
