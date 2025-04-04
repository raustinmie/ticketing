import {Listener , Subjects, ExpirationCompleteEvent, NotFoundError} from "@raustinmietickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { OrderStatus } from "@raustinmietickets/common";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        console.log('Expiration complete event data!', data);
        const order = await Order.findById(data.orderId).populate('ticket');
        if (!order) {
            throw new NotFoundError();
        }
        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }
        order.set({status: OrderStatus.Cancelled});
        await order.save();
        new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
            },
        });
        
        msg.ack();
    }
}