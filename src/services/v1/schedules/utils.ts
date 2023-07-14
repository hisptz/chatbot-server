import client from "../../../client";
import {Schedule} from "../../../schemas/schedule";
import {applySchedule, removeSchedule} from "../../../engine/scheduling";

export async function getAllSchedules() {
    return client.analyticsPushJobSchedule.findMany({
        include: {
            job: true
        }
    })
}

export async function getSchedule(id: string) {
    return client.analyticsPushJobSchedule.findUnique({
        where: {
            id
        },
        include: {
            job: true
        }
    })
}

export async function createSchedule(data: Schedule) {
    const schedule = await client.analyticsPushJobSchedule.create({
        data: {
            ...data,
            job: {
                connect: {
                    id: data?.job?.id
                }
            },
        },
        include: {
            job: true
        }
    });
    await applySchedule(schedule);

    return schedule;

}

export async function updateSchedule(id: string, data: Schedule) {
    const schedule = await client.analyticsPushJobSchedule.update({
        where: {
            id
        },
        data: {
            ...data,
            job: {
                connect: {
                    id: data?.job?.id
                }
            }
        },
        include: {
            job: true
        }
    });

    await applySchedule(schedule);
    return schedule;
}

export async function deleteSchedule(id: string) {
    const deletedSchedule = await client.analyticsPushJobSchedule.delete({
        where: {
            id
        },
        include: {
            job: true
        }
    })
    await removeSchedule(deletedSchedule);
    return deletedSchedule;
}
