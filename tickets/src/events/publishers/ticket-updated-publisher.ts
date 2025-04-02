import { Publisher, Subjects, TicketUpdatedEvent } from '@raustinmietickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;  
}