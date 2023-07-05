import {PrismaClient} from '@prisma/client'
import ChildProcess from "child_process";
import logger from "../logging";

const prisma = new PrismaClient()
export default prisma;

export async function initPrisma() {
    return new Promise((resolve, reject) => {
        logger.info(`Performing prisma changes`)
        const process = ChildProcess.exec(`npx prisma migrate deploy`, {})
        process.on("exit", (code, signal) => {
            if (code === 0) {
                logger.info("Done!");
                resolve(0)
            } else {
                logger.error("Failed!")
                reject(code)
            }
        })
        process.on("error", (error) => {
            logger.error(error)
            reject(error)
        })
    })
}
