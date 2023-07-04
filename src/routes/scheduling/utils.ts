import {Schedule} from "../../interfaces/schedule";
import client from "../../client";
import {asyncify, mapSeries} from "async";
import {Job} from "@prisma/client";
import {deleteScheduledJob, scheduleJob} from "../../modules/scheduling/utils";


export async function saveSchedule(data: Schedule) {

    const job = await client.job.create({
        data: {
            id: data.id,
            data: JSON.stringify(data.data),
        }
    })
    await mapSeries(data.schedules, asyncify(async (schedule: any) => {
        return client.schedule.create({
            data: {
                job: {
                    connect: {
                        id: job.id
                    }
                },
                cron: schedule.cron
            }
        });
    }))

    const savedJob = await client.job.findUnique({
        where: {
            id: job.id
        },
        include: {
            Schedule: true
        }
    });

    if (!savedJob) {
        throw new Error('Schedule details not found');
    }

    await scheduleJob(savedJob)
    return formatData(savedJob);

}

export async function deleteSchedule(id: string): Promise<Schedule> {
    const job = await client.job.delete({
        where: {
            id
        },
        include: {
            Schedule: true
        }
    });
    await deleteScheduledJob(job);
    return formatData(job);
}

export async function getSchedule(id: string): Promise<Schedule | undefined> {
    const job = await client.job.findUnique({
        where: {
            id
        },
        include: {
            Schedule: true
        }
    });

    if (!job) {
        return;
    }

    return formatData(job)
}

export async function updateSchedule(id: string, data: Schedule): Promise<Schedule> {

    const job = await client.job.update({
        where: {
            id
        },
        data: {
            data: JSON.stringify(data.data),
        },
        include: {
            Schedule: true
        }
    });
    await mapSeries(data.schedules, asyncify(async (schedule: any) => {
        return client.schedule.upsert({
            select: {
                id: true,
            },
            where: {
                id: schedule.id,
            },
            update: {
                cron: schedule.cron,
                enabled: schedule.enabled
            },
            create: {
                job: {
                    connect: {
                        id: job.id
                    }
                },
                cron: schedule.cron,
                enabled: schedule.enabled
            }
        });
    }))

    const savedJob = await client.job.findUnique({
        where: {
            id: job.id
        },
        include: {
            Schedule: true
        }
    });

    if (!savedJob) {
        throw new Error('Schedule details not found');
    }
    await scheduleJob(savedJob)
    return formatData(savedJob);
}

export function formatData(data: Job & { Schedule: any[] }): Schedule {
    return {
        data: JSON.parse(data.data),
        schedules: data.Schedule.map(schedule => ({
            cron: schedule.cron,
            enabled: schedule.enabled,
            id: schedule.id
        })),
        id: data.id
    }
}

export async function getSchedules(): Promise<Schedule[]> {
    const jobs = await client.job.findMany({
        include: {
            Schedule: true
        }
    });

    return jobs.map(formatData)
}
