export default async function handler(req, res) {
    // Solo permitimos peticiones POST (seguridad)
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'No se recibió texto para procesar.' });
        }

        // --- LÓGICA DE HUMANIZACIÓN DE LAGUNA LABS ---
        // Aquí es donde sucede la magia. Por ahora usamos una lógica de reemplazo.
        // En el futuro, aquí conectarás tu API Key de Gemini o OpenAI.
        
        let processedText = text
            .replace(/específicamente/g, "sobre todo")
            .replace(/adicionalmente/g, "además")
            .replace(/con el fin de/g, "para")
            .replace(/proporcionar/g, "dar")
            .replace(/actualmente/g, "hoy por hoy")
            .replace(/fundamental/g, "clave");

        // Añadimos un toque de "imperfección humana" al azar
        const humantouches = ["...", " la verdad es que", " por decirlo así,", " básicamente"];
        processedText = processedText + humantouches[Math.floor(Math.random() * humantouches.length)];

        // --- RESPUESTA FINAL ---
        // Es vital que el campo se llame "humanizedText" para que el HTML lo lea bien
        return res.status(200).json({ 
            humanizedText: processedText,
            version: "Laguna Labs Neural 4.0"
        });

    } catch (error) {
        console.error("Error en el motor de optimización:", error);
        return res.status(500).json({ error: "Error interno del motor." });
    }
}
