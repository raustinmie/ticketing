import { Listener, Subjects } from "@raustinmietickets/common";
import { Message } from "node-nats-streaming";
import { OrderCreatedEvent, NotFoundError } from "@raustinmietickets/common";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: any, msg: Message) {
        console.log('Order Created:', data);
        // find the ticket that the event is describing
        const ticket = await Ticket.findById(data.ticket.id);
        // If not found, throw an error
        if (!ticket) {
            throw new NotFoundError();
        }

        ticket.set({orderId: data.id});
        await ticket.save();
        new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId,
        });
        
        msg.ack();
    }
}