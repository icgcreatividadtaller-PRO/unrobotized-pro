export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error de método' });

    try {
        const { text, mode } = req.body;
        if (!text) return res.status(400).json({ error: 'Texto vacío' });

        // MOTOR DE BREVEDAD LAGUNA LABS
        // Reemplazamos términos "robóticos" por palabras cortas y humanas
        let processedText = text
            .replace(/específicamente/gi, "más que nada")
            .replace(/adicionalmente/gi, "además")
            .replace(/proporcionar/gi, "darte")
            .replace(/fundamental/gi, "clave")
            .replace(/actualmente/gi, "ahora")
            .replace(/con el fin de/gi, "para")
            .replace(/implementar/gi, "lanzar")
            .replace(/notificar/gi, "avisar");

        // Ajuste de estilo según el botón presionado
        if (mode === 'whatsapp') {
            processedText = processedText.toLowerCase().replace(/\./g, ""); // Más informal
        } else if (mode === 'curioso') {
            processedText = "¿Has pensado que " + processedText.charAt(0).toLowerCase() + processedText.slice(1) + "?";
        }

        return res.status(200).json({ 
            humanizedText: processedText.trim() 
        });

    } catch (error) {
        return res.status(500).json({ error: "Fallo en el motor" });
    }
}
