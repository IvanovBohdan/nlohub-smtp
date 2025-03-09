import { getRedisClient } from "../redisClient.js";
import { v4 as uuidv4 } from "uuid";

export async function publishEmail(email) {
    const redisClient = await getRedisClient();
    try {
        const redisKey = `${email.to.text.replaceAll(/\s/g, ":")}:${uuidv4()}`;
        for (const recipient of email.to.value) {
            await redisClient.hSet(recipient.address, redisKey, JSON.stringify(email), {
                EX: 60 * 60 * 24,
            });
            await redisClient.publish(recipient.address, redisKey);
        }
    } catch (error) {
        console.error("Email processing failed", error);
    }
}
