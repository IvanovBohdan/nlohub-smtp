import { getRedisClient } from "../redisClient.js";
import { v4 as uuidv4 } from "uuid";

export async function publishEmail(email) {
    const redisClient = await getRedisClient();
    try {
        const redisKey = `${email.to.text.replaceAll(/\s/g, ":")}:${uuidv4()}`;
        await redisClient.set(redisKey, JSON.stringify(email), {
            EX: 60 * 60 * 24,
        });
        for (const recipient of email.to.value) {
            await redisClient.publish(recipient.address, redisKey);
        }
    } catch (error) {
        console.error("Email processing failed", error);
    }
}
