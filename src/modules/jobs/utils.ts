import {AnalyticsPushJob as Job, AnalyticsPushJobSchedule as Schedule, Contact, Visualization} from "@prisma/client";
import client from "../../client";
import {config} from "dotenv";

config()

export async function getJobs() {
    return client.analyticsPushJob.findMany({
        include: {
            visualizations: true,
            contacts: true,
            schedules: true,
            statuses: true
        }
    });
}

export async function getJobById(id: string) {
    return client.analyticsPushJob.findUnique({
        where: {
            id
        },
        include: {
            visualizations: true,
            contacts: true,
            schedules: true,
            statuses: true
        }
    });
}

export async function createJob(data: Job & {
    visualizations?: Visualization[],
    contacts?: Contact[],
    schedules?: Schedule[]
}) {
    return client.analyticsPushJob.create({
        data: {
            ...data,
            visualizations: {
                connectOrCreate: data.visualizations?.map((visualization) => ({
                    create: visualization,
                    where: {
                        id: visualization.id
                    }
                }))
            },
            contacts: {
                connectOrCreate: data.contacts?.map((contact) => ({
                    create: contact,
                    where: {
                        id: contact.id
                    }
                }))
            },
            schedules: {
                connectOrCreate: data.schedules?.map((schedule) => ({
                    create: schedule,
                    where: {
                        id: schedule.id
                    }
                }))
            }
        },
        include: {
            visualizations: true,
            contacts: true,
            schedules: true,
            statuses: true
        }
    });
}

export async function updateJob(id: string, data: Job & {
    visualizations?: Visualization[],
    contacts?: Contact[],
    schedules?: Schedule[]
}) {
    return client.analyticsPushJob.update({
        where: {
            id
        },
        data: {
            ...data,
            visualizations: {
                connectOrCreate: data.visualizations?.map((visualization) => ({
                    create: visualization,
                    where: {
                        id: visualization.id
                    }
                }))
            },
            contacts: {
                connectOrCreate: data.contacts?.map((contact) => ({
                    create: contact,
                    where: {
                        id: contact.id
                    }
                }))
            },
            schedules: {
                connectOrCreate: data.schedules?.map((schedule) => ({
                    create: schedule,
                    where: {
                        id: schedule.id
                    }
                }))
            }
        },
        include: {
            visualizations: true,
            contacts: true,
            schedules: true,
            statuses: true
        }
    });
}

