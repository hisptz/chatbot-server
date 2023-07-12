import {PrismaClient} from '@prisma/client'
import ChildProcess from "child_process";
import logger from "../logging";
import {config} from "dotenv";

const prisma = new PrismaClient();

config()

export default prisma;

export async function initPrisma() {
    return new Promise((resolve, reject) => {
        logger.info(`Setting up database...`)
        const process = ChildProcess.exec(`npx prisma migrate deploy`, {});
        process.on("message", (data) => {
            logger.info(data)
        })
        process.on("error", (error) => {
            logger.error(error.message);
            logger.error(error.stack);
            reject(error)
        })
        process.on("exit", (code, signal) => {
            if (code !== 0) {
                logger.error(`Exit with code ${code}`)
                reject(code)
            } else
                resolve(code)
        })
    })
}
