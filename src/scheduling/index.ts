import logger from "../logging";
import {scheduleJobs} from "./utils";


export async function initializeJobScheduling() {
    logger.info(`Performing job scheduling`)
    return scheduleJobs();
}
