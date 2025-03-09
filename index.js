import dotenv from "dotenv";
dotenv.config();

const { PORT } = process.env;

import { SMTPServer } from "smtp-server";
import { simpleParser } from "mailparser";
import { publishEmail } from "./services/publishService.js";

const smtpServer = new SMTPServer({
    secure: false,
    disabledCommands: ["AUTH"],
    size: process.env.MAX_EMAIL_SIZE || 1024 * 10,

    onRcptTo(address, session, callback) {
        if (address.address.endsWith(process.env.DOMAIN)) {
            return callback();
        }
        return callback(new Error("Invalid recipient"));
    },

    async onData(stream, session, callback) {
        try {
            const parsedEmail = await simpleParser(stream, {});
            publishEmail(parsedEmail);
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
