export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error de método' });

    try {
        const { text, mode } = req.body;
        if (!text) return res.status(400).json({ error: 'Texto vacío' });

        // MOTOR HUMANO LAGUNA LABS - RECALIBRADO
        let processedText = text
            // Elimina formalismos innecesarios
            .replace(/en resumen/gi, "al final")
            .replace(/por favor/gi, "mira,")
            .replace(/es de mejor calidad/gi, "es mejor")
            .replace(/no es la más indicada/gi, "no te ayuda")
            .replace(/está matando tus ventas/gi, "te está arruinando las ventas")
            // Limpieza de palabras "pesadas"
            .replace(/adicionalmente/gi, "además")
            .replace(/notificar/gi, "avisar")
            .replace(/proporcionar/gi, "darte");

        // Ajuste según el botón seleccionado
        if (mode === 'whatsapp') {
            processedText = "Oye, " + processedText.toLowerCase().replace(/\./g, "") + " 👍";
        } else if (mode === 'curioso') {
            processedText = "¿No crees que " + processedText.charAt(0).toLowerCase() + processedText.slice(1) + "?";
        }

        return res.status(200).json({ 
            humanizedText: processedText.trim() 
        });

    } catch (error) {
        return res.status(500).json({ error: "Fallo en el motor" });
    }
}
