import { Subjects, Listener, PaymentCreatedEvent, OrderStatus } from "@raustinmietickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const { id, orderId, stripeId } = data;
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }
        order.set({ status: OrderStatus.Complete });
        await order.save();
        console.log('Order complete!');

//TODO: publish an event saying that the order has been updated, incrementing the version.
        msg.ack();
    }
}