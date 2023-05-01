import {PrismaClient} from '@prisma/client'
import ChildProcess from "child_process";

const prisma = new PrismaClient()

export default prisma;


export async function initPrisma() {
    return new Promise((resolve, reject) => {
        console.info("Performing prisma changes")
        const process = ChildProcess.exec(`npx prisma migrate deploy`)

        process.on("exit", () => {
            console.info("Done");
            resolve(0);
        })
        process.on("error", (error) => {
            reject(error)
        })
    })
}
