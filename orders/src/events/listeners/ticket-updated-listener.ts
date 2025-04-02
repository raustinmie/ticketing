import { Listener, Subjects, TicketUpdatedEvent, NotFoundError } from '@raustinmietickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        // Find the ticket that the event is describing
        const ticket = await Ticket.findByEvent(data);

        // If not found, throw an error
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        const { title, price } = data;
        // Update the ticket with the new data
        ticket.set({
            title: title,
            price: price,
        });

        // Save the ticket to the database
        await ticket.save();

        // Acknowledge the message
        msg.ack();
    }
}