import { Redis } from '@upstash/redis'

// Vercel lee automáticamente las variables de entorno de Upstash
const redis = Redis.fromEnv()

export default async function handler(req, res) {
    // 1. Detectamos la IP del usuario (su "matrícula" digital)
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const key = `limit:${ip}`;

    try {
        // 2. Consultamos en Redis cuántas misiones lleva
        const count = await redis.get(key) || 0;

        // 3. Si ya llegó a 3, lo bloqueamos
        if (parseInt(count) >= 3) {
            return res.status(200).json({ blocked: true });
        }

        // 4. Si tiene misiones, sumamos 1 al contador
        await redis.incr(key);
        
        // 5. El límite se resetea cada 24 horas (86400 segundos)
        await redis.expire(key, 86400);

        return res.status(200).json({ blocked: false });

    } catch (error) {
        console.error("Error en el satélite Redis:", error);
        // En caso de error técnico, dejamos pasar por cortesía de Laguna Labs
        return res.status(200).json({ blocked: false });
    }
}