export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error' });
    const { text, mode } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ error: "Vercel no está leyendo la llave." });

    try {
        // Probamos con el estándar absoluto
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hola" }] }] // Prueba mínima
            })
        });

        const data = await response.json();

        // AQUÍ ESTÁ LA VUELTA: Si Google manda error, lo soltamos TODO en el 'error'
        if (data.error) {
            return res.status(500).json({ 
                error: `GOOGLE DIJO: ${data.error.message}`,
                codigo: data.error.status,
                detalles: data.error
            });
        }

        if (data.candidates) {
            return res.status(200).json({ humanizedText: "CONEXIÓN EXITOSA. Ahora pega tu texto real." });
        }

        return res.status(500).json({ error: "Respuesta vacía de Google.", raw: data });

    } catch (e) {
        return res.status(500).json({ error: "Error de red: " + e.message });
    }
}
