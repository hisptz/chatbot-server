import {AnalyticsPushJob, AnalyticsPushJobSchedule, Contact, Visualization} from "@prisma/client";
import {DateTime} from "luxon";
import {PushRequest} from "../schemas/push";
import logger from "../logging";
import client from "../client";
import {asyncify, forEach, mapSeries} from "async";
import {CronJob} from "cron";
import process from "process";
import {config} from "dotenv";
import {compact, isEmpty, remove, set} from "lodash";
import {getMessage, sendMessage} from "./push";
import {getJobById} from "../services/v1/jobs";
import axios from "axios";
import {sanitizeEnv} from "../utils/env";


config();
sanitizeEnv();


const whatsappURL = process.env.WHATSAPP_URL ?? '';
const whatsappAPIKey = process.env.WHATSAPP_API_KEY ?? "";
const visualizerURL = process.env.VISUALIZER_URL ?? '';
const visualizerAPIKey = process.env.VISUALIZER_API_KEY ?? '';

const whatsappClient = axios.create({
    baseURL: whatsappURL,
    headers: {
        'x-api-key': whatsappAPIKey
    }
})
const visualizerClient = axios.create({
    baseURL: visualizerURL,
    headers: {
        'x-api-key': visualizerAPIKey
    }
});

export const scheduledJobs: { id: string, job: CronJob }[] = []

export async function pushJob(job: AnalyticsPushJob & {
    schedules: AnalyticsPushJobSchedule[],
    visualizations: Visualization[],
    contacts: Contact[]
}) {
    const dateTime = DateTime.now();
    const data: PushRequest = {
        to: job.contacts.map((contact) => ({type: contact.type, number: contact.number})) as any,
        description: job.description,
        visualizations: job.visualizations.map((visualization) => ({id: visualization.id, name: visualization.name}))
    }

    const statusId = `${job.id}-${dateTime.toISO()}`
    logger.info(`Sending push analytics ${data.visualizations.map(({name}) => name).join(', ')} To contacts ${data.to.map(({number}) => number).join(', ')}`);
    const jobStatus = await client.analyticsPushJobStatus.create({
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
            visualizerClient
        })));

        const messageResponse = await mapSeries(messages, asyncify(async (message: any) => sendMessage(message, whatsappClient)));
        logger.info(`Messages sent!`);
        return client.analyticsPushJobStatus.update({
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
        return client.analyticsPushJobStatus.update({
            where: {
                id: statusId
            },
            data: {
                endTime: DateTime.now().toJSDate(),
                status: 'FAILED',
                response: JSON.stringify(e)
            }
        });
    }

}

export async function initializeScheduling() {
    const schedules = await client.analyticsPushJobSchedule.findMany({
        where: {
            enabled: {
                equals: true
            }
        },
        include: {
            job: true
        }
    });
    if (isEmpty(schedules)) {
        logger.info(`No enabled schedules found. Skipping schedules set up`);
        return;
    }
    logger.info(`Setting up ${schedules.length} schedules...`);
    await forEach(schedules, asyncify(applySchedule));
    logger.info(`Schedules set up!`);
}

export async function scheduleJob(job: AnalyticsPushJob & {
    schedules: AnalyticsPushJobSchedule[],
    visualizations: Visualization[],
    contacts: Contact[]
}) {
    const enabledSchedules = job.schedules.filter(({enabled}) => enabled);
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

export async function applySchedule(data: AnalyticsPushJobSchedule & { job: AnalyticsPushJob }) {
    const scheduledJobId = `${data.job.id}-${data.id}`;
    const isScheduleRunning = !!scheduledJobs.find(({id}) => id === scheduledJobId);
    const job = await getJobById(data.job.id);

    if (!job) {
        logger.error(`Job ${data.job.id} not found`);
        return;
    }

    if (isScheduleRunning) {
        logger.info(`Schedule ${data.id} running. Stopping...`);
        const cronJobIndex = scheduledJobs.findIndex(({id}) => id === scheduledJobId);
        const cronJob = scheduledJobs[cronJobIndex];
        cronJob?.job?.stop();
        if (!data.enabled) {
            remove(scheduledJobs, (_, index) => cronJobIndex === index);
            logger.info(`Schedule disabled. Removing from list...`);
            return;
        }
        const updatedJob = new CronJob(data.cron, async () => {
            logger.info(`Starting job ${data.job.id} at ${new Date()}`)
            await pushJob(job);
        }, () => {
            logger.info("job finished");
        }, false)
        updatedJob.start();
        set(scheduledJobs, cronJobIndex, updatedJob);

        return;
    } else {
        if (data.enabled) {
            const newCronJob = new CronJob(data.cron, async () => {
                logger.info(`Starting job ${data.job.id} at ${new Date()}`)
                await pushJob(job);
            }, () => {
                logger.info("job finished");
            }, false);
            newCronJob.start();
            scheduledJobs.push({id: scheduledJobId, job: newCronJob});
        }
    }
}

export async function removeSchedule(data: AnalyticsPushJobSchedule & { job: AnalyticsPushJob }) {
    const scheduledJobId = `${data.job.id}-${data.id}`;
    const isScheduleRunning = !!scheduledJobs.find(({id}) => id === scheduledJobId);
    if (isScheduleRunning) {
        logger.info(`Removing schedule ${data.id}...`);
        const cronJobIndex = scheduledJobs.findIndex(({id}) => id === scheduledJobId);
        const cronJob = scheduledJobs[cronJobIndex];
        cronJob?.job?.stop();
        remove(scheduledJobs, (_, index) => cronJobIndex === index);
        logger.info(`${data.id} removed`);
    }
}

async function applyJobScheduling(data: AnalyticsPushJob) {

}
