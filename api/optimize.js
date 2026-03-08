export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error' });
    const { text, mode } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ error: "Falta la API Key en el servidor." });

    const instructions = {
        directo: "Reescribe este mensaje para que sea cálido y profesional, eliminando la agresividad pero manteniendo el impacto.",
        curioso: "Transforma esto en una pregunta que genere curiosidad y empatía genuina.",
        whatsapp: "Usa un tono de chat cercano y relajado, sin puntos finales y con minúsculas casuales."
    };

    const prompt = `${instructions[mode] || instructions.directo}\n\nMENSAJE ORIGINAL: "${text}"\n\nResponde SOLO con el nuevo texto humanizado.`;

    try {
        // CAMBIO CRÍTICO: Usamos la versión /v1/ en lugar de /v1beta/
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const resultText = data.candidates[0].content.parts[0].text.trim();
            return res.status(200).json({ humanizedText: resultText });
        }
        
        // Si Google devuelve un error específico, lo mostramos para diagnosticar
        return res.status(500).json({ error: data.error ? data.error.message : "Error en la respuesta de Gemini." });
    } catch (e) {
        return res.status(500).json({ error: "Fallo de conexión neural." });
    }
}
