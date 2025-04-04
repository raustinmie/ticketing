import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from "@raustinmietickets/common";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";
import { Message } from "node-nats-streaming";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        console.log('Order Cancelled:', data);
        const order = await Order.findOne({
            _id: data.id, 
            version: data.version-1
        });

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({status: OrderStatus.Cancelled});
       await order.save();
        msg.ack();
    }
}