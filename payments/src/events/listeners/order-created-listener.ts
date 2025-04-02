import { Listener, OrderCreatedEvent, Subjects } from "@raustinmietickets/common";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";
import { Message } from "node-nats-streaming";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        console.log('Order Created:', data);
        const order = Order.build({
            id: data.id,
            version: data.version,
            status: data.status,
            userId: data.userId,
            price: data.ticket.price
        })
        await order.save();
        msg.ack();
    }
}