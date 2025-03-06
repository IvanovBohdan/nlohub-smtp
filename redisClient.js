import { createClient } from "redis";

let redisClient = null;

export async function redisConnect() {
    const client = createClient({
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
        },
    });

    client.on("error", (err) => console.error("Redis Client Error", err));

    await client.connect();

    return client;
}

export async function getRedisClient() {
    if (!redisClient || !redisClient.isOpen) {
        redisClient = await redisConnect();
    }

    return redisClient;
}
