import { Listener, Subjects, OrderCancelledEvent, NotFoundError  } from "@raustinmietickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";


export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: any, msg: Message) {
        console.log('Order Cancelled:', data);
        // find the ticket that the event is describing
        const ticket = await Ticket.findById(data.ticket.id);
        // If not found, throw an error
        if (!ticket) {
            throw new NotFoundError();
        }

        ticket.set({orderId: undefined});
        await ticket.save();
        new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: undefined,
        });
        
        msg.ack();
    }
}