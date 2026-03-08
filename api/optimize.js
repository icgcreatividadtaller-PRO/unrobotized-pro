export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error' });

    const { text, mode } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ error: "Falta la API Key en Vercel." });

    const instructions = {
        directo: "Actúa como un mentor profesional. Reescribe este mensaje para que sea cálido y directo.",
        curioso: "Transforma esto en una pregunta intrigante y empática.",
        whatsapp: "Usa un tono de chat muy cercano, relajado y con minúsculas casuales."
    };

    const prompt = `${instructions[mode] || instructions.directo}\n\nMENSAJE: "${text}"\n\nResponde solo con el texto humanizado.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();

        // Si Google devuelve un error (ej. API Key inválida), lo capturamos aquí
        if (data.error) {
            return res.status(500).json({ error: `Google dice: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0].content) {
            const humanizedText = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ humanizedText: humanizedText.trim() });
        }
        
        return res.status(500).json({ error: "Gemini no pudo procesar este texto." });

    } catch (error) {
        return res.status(500).json({ error: "Fallo de conexión con el satélite neural." });
    }
}
