import {Job, Schedule} from "@prisma/client";
import {CronJob} from "cron"
import logger from "../logging";
import client from "../client";
import {PushRequest} from "../interfaces/push";
import {DateTime} from "luxon";
import process from "process";
import {config} from "dotenv";
import {getMessage, sendMessage} from "../routes/push/routes";
import {asyncify, mapSeries} from "async";
import {compact, remove, set} from "lodash";

config()


const scheduledJobs: { id: string, job: CronJob }[] = []

const whatsappURL = process.env.WHATSAPP_URL ?? '';
const visualizerURL = process.env.VISUALIZER_URL ?? '';

export async function pushJob(job: Job) {
    const dateTime = DateTime.now();
    const data: PushRequest = JSON.parse(job.data);

    const statusId = `${job.id}-${dateTime.toISO()}`
    logger.info(`Sending push analytics ${data.visualizations.map(({name}) => name).join(', ')} To contacts ${data.to.map(({number}) => number).join(', ')}`);
    const jobStatus = await client.jobStatus.create({
        data: {
            job: {
                connect: {
                    id: job.id
                }
            },
            status: 'STARTED',
            startTime: dateTime.toJSDate(),
            id: statusId
        }
    });
    logger.info(`Job status created ${jobStatus.id}`);
    try {
        const {visualizations, description, to,} = data;
        const messages = await mapSeries(visualizations, asyncify(async (visualization: any) => getMessage(visualization, {
            recipients: to,
            description,
            gateway: visualizerURL
        })));

        const messageResponse = await mapSeries(messages, asyncify(async (message: any) => sendMessage(message, whatsappURL)));
        logger.info(`Messages sent!`);
        await client.jobStatus.update({
            where: {
                id: statusId
            },
            data: {
                endTime: DateTime.now().toJSDate(),
                status: 'FINISHED',
                response: JSON.stringify(messageResponse)
            }
        })
    } catch (e) {
        logger.error(`Job failed ${e}`);
        await client.jobStatus.update({
            where: {
                id: statusId
            },
            data: {
                endTime: DateTime.now().toJSDate(),
                status: 'FAILED',
                response: JSON.stringify(e)
            }
        });
        throw e;
    }

}

export async function deleteScheduledJob(job: Job & { Schedule: Schedule[] }) {
    const enabledSchedules = job.Schedule.filter(({enabled}) => enabled);
    for (const schedule of enabledSchedules) {
        const scheduledJobId = `${job.id}-${schedule.id}`;
        const alreadyScheduledJob = scheduledJobs.find(({id}) => id === scheduledJobId);

        if (alreadyScheduledJob) {
            logger.info(`Killing job due to deletion...`);
            alreadyScheduledJob.job.stop();
            remove(scheduledJobs, (job) => job.id === scheduledJobId);
        }
    }
}

export async function scheduleJob(job: Job & { Schedule: Schedule[] }) {
    const enabledSchedules = job.Schedule.filter(({enabled}) => enabled);
    for (const schedule of enabledSchedules) {
        const scheduledJobId = `${job.id}-${schedule.id}`;

        const alreadyScheduledJob = compact(scheduledJobs).find(({id}) => id === scheduledJobId);

        if (alreadyScheduledJob) {
            logger.info(`Killing job to reschedule...`);
            alreadyScheduledJob.job.stop();
            const updatedJob = new CronJob(schedule.cron, async () => {
                logger.info(`Starting job ${job.id} at ${new Date()}`)
                await pushJob(job);
            }, () => {
                logger.info("job finished");
            }, false)
            const index = scheduledJobs.findIndex(({id}) => id === scheduledJobId);
            set(scheduledJobs, index, updatedJob);
            continue;
        }

        const scheduledJob = new CronJob(schedule.cron, async () => {
            logger.info(`Starting job ${job.id} at ${new Date()}`)
            await pushJob(job);
        }, () => {
            logger.info("job finished");
        }, false);
        scheduledJob.start();
        scheduledJobs.push({id: scheduledJobId, job: scheduledJob});
    }

}

export async function scheduleJobs() {
    const jobs = await client.job.findMany({
        include: {
            Schedule: true
        }
    });
    for (const job of jobs) {
        await scheduleJob(job);
    }
}

