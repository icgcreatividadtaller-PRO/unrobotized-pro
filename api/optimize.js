export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error' });
    const { text, mode } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ error: "Falta la llave neural en el servidor." });

    const instructions = {
        directo: "Reescribe este mensaje para que sea cálido, profesional y directo. Elimina la agresividad sin perder autoridad.",
        curioso: "Transforma esto en una pregunta intrigante que despierte curiosidad y empatía.",
        whatsapp: "Usa un tono de chat cercano, relajado y con minúsculas casuales."
    };

    const prompt = `${instructions[mode] || instructions.directo}\n\nMENSAJE ORIGINAL: "${text}"\n\nResponde SOLO con el nuevo texto humanizado.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            return res.status(200).json({ humanizedText: data.candidates[0].content.parts[0].text.trim() });
        }
        return res.status(500).json({ error: data.error ? data.error.message : "Error en la respuesta neural." });
    } catch (e) {
        return res.status(500).json({ error: "Fallo de conexión neural." });
    }
}
