import {PrismaClient} from '@prisma/client'
import ChildProcess from "child_process";

const prisma = new PrismaClient()

export default prisma;


export async function initPrisma() {
    return new Promise((resolve, reject) => {
        const process = ChildProcess.exec(`npx prisma migrate deploy`, {}, (error, stdout, stderr) => {
            console.info(stdout);
            console.info(error);
            console.info(stderr);
        })
        process.on("message", console.info)
        console.info(`Performing prisma changes`)
        process.on("exit", (code, signal) => {
            console.info(signal)
            console.info(code)
            console.info("Done");
            resolve(0);
        })
        process.on("error", (error) => {
            console.error(error)
            reject(error)
        })
    })
}
