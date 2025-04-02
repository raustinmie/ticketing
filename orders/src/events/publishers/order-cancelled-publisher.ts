import { Publisher, OrderCancelledEvent, Subjects } from "@raustinmietickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}