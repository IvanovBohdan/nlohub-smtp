import { getRedisClient } from "../redisClient.js";
import { v4 as uuidv4 } from "uuid";

export async function publishEmail(email) {
    const redisClient = await getRedisClient();
    try {
        const redisKey = `${email.to.text.replaceAll(/\s/g, ":")}:${uuidv4()}`;
        email.messageId = redisKey;
        for (const recipient of email.to.value) {
            await redisClient
                .multi()
                .hSet(recipient.address, redisKey, JSON.stringify(email))
                .hExpire(recipient.address, redisKey, 60 * 60 * 24)
                .publish(recipient.address, redisKey)
                .exec();
        }
    } catch (error) {
        console.error("Email processing failed", error);
    }
}
