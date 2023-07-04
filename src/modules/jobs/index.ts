import client from "../../client";
import {Job as APIJob} from "../../interfaces/job";


async function getAllJobs() {

    //get all jobs from prisma clients;
    return client.job.findMany({
        include: {
            Schedule: true
        },
    });
}

async function getJob(id: string) {
    if (!id) {
        throw new Error("Job ID is required");
    }
    return client.job.findUnique({
        where: {
            id
        },
        include: {
            Schedule: true
        }
    })
}

async function createJob(apiJob: APIJob) {

    return client.job.create({
        data: {
            data:
        }
    })
}

async function updateJob(apiJob: APIJob, id: string) {

}

async function deleteJob(id: string) {

}
