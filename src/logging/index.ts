import winston, {format} from "winston";
import {config} from "dotenv";
import {sanitizeEnv} from "../utils/env";

config();
sanitizeEnv();

const logger = winston.createLogger({
    format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.align(),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    defaultMeta: {},
    transports: [
        new winston.transports.Console({}),
        new winston.transports.File({
            filename: "logs/log",
        })
    ]
});

export default logger;
