import dotenv from "dotenv";
dotenv.config();

import { SMTPServer } from "smtp-server";
import { simpleParser } from "mailparser";
import { queue, common } from "oci-sdk";

const queueId = process.env.QUEUE_ID;
const messagesEndpoint =
    process.env.MESSAGES_ENDPOINT ||
    "https://cell-1.queue.messaging.uk-london-1.oci.oraclecloud.com";
const PORT = process.env.PORT || 25;

const authProvider =
    process.env.MODE === "production"
        ? new common.InstancePrincipalsAuthenticationDetailsProviderBuilder().build()
        : new common.ConfigFileAuthenticationDetailsProvider("./oci_config");

const queueClient = new queue.QueueClient({
    authenticationDetailsProvider: authProvider,
});

queueClient.endpoint = messagesEndpoint;

const smtpServer = new SMTPServer({
    secure: false,
    disabledCommands: ["AUTH"],
    size: process.env.MAX_EMAIL_SIZE || 1024 * 10,
    async onData(stream, session, callback) {
        try {
            const parsedEmail = await simpleParser(stream, {});
            queueClient.putMessages({
                putMessagesDetails: {
                    messages: [
                        {
                            content: JSON.stringify(parsedEmail),
                        },
                    ],
                },
                queueId,
            });
        } catch (error) {
            console.error(error);
            return callback(new Error("Email processing failed!"));
        }
        return callback();
    },
});

smtpServer.listen(PORT, () => {
    console.log(`SMTP server started on port ${PORT}`);
});
