import client from "../../../client";
import {config} from "dotenv";
import {AnalyticsPushJobAPI} from "../../../schemas/job";
import logger from "../../../logging";
import {removeSchedule, scheduleJob} from "../../../engine/scheduling";
import {asyncify, forEach} from "async";
import {sanitizeEnv} from "../../../utils/env";
import {differenceBy, pick} from "lodash";

config()
sanitizeEnv();


export async function getJobs() {
    return client.analyticsPushJob.findMany({
        include: {
            visualizations: true,
            contacts: true,
            schedules: true,
        }
    });
}

export async function getJobStatus(id: string) {
    return client.analyticsPushJobStatus.findMany({
        where: {
            jobId: id
        }
    })
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

export async function createJob(data: AnalyticsPushJobAPI) {
    try {
        const createdJob = await client.analyticsPushJob.create({
            data: {
                ...data,
                visualizations: {
                    connectOrCreate: data.visualizations?.map((visualization) => ({
                        create: {
                            ...visualization,
                            jobId: data.id
                        },
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
        await scheduleJob(createdJob)
        logger.info(`job ${createdJob.id} created successfully and scheduled`);
        return createdJob;
    } catch (e: any) {
        logger.error(`create job failed:  ${e.message}`);
        throw Error("Could not create job", {
            cause: e
        })
    }
}

export async function updateJob(id: string, data: AnalyticsPushJobAPI) {
    try {
        const job = await client.analyticsPushJob.findUnique({
            where: {
                id
            },
            include: {
                visualizations: true,
                contacts: true
            }
        });

        const deletedVisualizations = differenceBy(job?.visualizations, data?.visualizations ?? [], 'id').map((vis) => pick(vis, 'id'));
        const deletedContacts = differenceBy(job?.contacts, data?.contacts ?? [], 'id').map((vis) => pick(vis, 'id'));

        const updatedJob = await client.analyticsPushJob.update({
            where: {
                id
            },
            data: {
                ...data,
                visualizations: {
                    deleteMany: {
                        id: {
                            in: data.visualizations?.map((visualization) => visualization.id) ?? []
                        }
                    },
                    delete: deletedVisualizations,
                    connectOrCreate: data.visualizations?.map((visualization) => ({
                        create: {
                            ...visualization,
                            jobId: data.id
                        },
                        where: {
                            id: visualization.id
                        }
                    }))
                },
                contacts: {
                    deleteMany: {
                        id: {
                            in: data.contacts.map((contact) => contact.id) ?? []
                        }
                    },
                    delete: deletedContacts,
                    connectOrCreate: data.contacts?.map((contact) => ({
                        create: contact,
                        where: {
                            id: contact.id
                        },
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
        await scheduleJob(updatedJob);
        logger.info(`job ${updatedJob.id} updated successfully and scheduled`);
        return updatedJob;
    } catch (e: any) {
        logger.error(`update job failed:  ${e.message}`, {error: e});
        throw Error("Could not update job", {
            cause: e
        })
    }
}

export async function deleteJob(id: string) {
    try {
        const deletedJob = await client.analyticsPushJob.delete({
            where: {
                id
            },
            include: {
                contacts: true,
                visualizations: true,
                schedules: {
                    include: {
                        job: true
                    }
                }
            }
        });
        await forEach(deletedJob.schedules, asyncify(removeSchedule))
        logger.info(`job ${id} deleted successfully`);
        return deletedJob;
    } catch (e: any) {
        logger.error(`delete job failed:  ${e.message}`, {error: e});
        throw Error("Could not delete job", {
            cause: e
        })
    }
}

