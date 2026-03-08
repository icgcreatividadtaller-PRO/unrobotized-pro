export default async function handler(req, res) {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ error: "Vercel no lee la llave." });

    try {
        // LA VUELTA DEFINITIVA: Le preguntamos a Google qué modelos tienes activos
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();

        if (data.models) {
            // Sacamos solo los nombres para que quepan en tu pantalla
            const listaModelos = data.models
                .map(m => m.name.replace('models/', ''))
                .join(' | ');

            return res.status(200).json({ 
                humanizedText: "MODELOS QUE SÍ TIENES PERMITIDOS: " + listaModelos 
            });
        }

        return res.status(500).json({ 
            error: "Google no me dio la lista.",
            diagnostico: data 
        });

    } catch (e) {
        return res.status(500).json({ error: "Error de red: " + e.message });
    }
}
