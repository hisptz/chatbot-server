import client from "../../client";
import {Visualization} from "@prisma/client";


export async function getAllVisualizations() {
    return client.visualization.findMany({
        include: {
            jobs: true,
            _count: true
        }
    })
}

export async function getVisualizationById(id: string) {
    if (!id) throw new Error("Visualization ID is not found")
    return client.visualization.findUnique({
        where: {
            id
        },
        include: {
            jobs: true,
        }
    });
}

export async function createVisualization(visualization: Visualization) {

    return client.visualization.create({
        data: visualization
    })
}

export async function updateVisualization(id: string, visualization: Visualization) {
    return client.visualization.update({
        where: {
            id
        },
        data: visualization
    })
}
