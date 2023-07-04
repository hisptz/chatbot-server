import client from "../../client";
import {Contact} from "@prisma/client";

export async function getAllContacts() {
    return client.contact.findMany({
        include: {
            jobs: true,
            _count: true
        }
    })
}

export async function getContactById(id: string) {
    if (!id) throw new Error("contact ID is required")
    return client.contact.findUnique({
        where: {
            id
        },
        include: {
            jobs: true,
        }
    })

}

export async function createContact(contact: Contact) {
    return client.contact.create({
        data: contact
    })
}

export async function updateContact(id: string, contact: Contact) {
    return client.contact.update({
        where: {
            id
        },
        data: contact
    })
}
