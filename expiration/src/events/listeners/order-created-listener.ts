import { Listener, Subjects } from "@raustinmietickets/common";
import { OrderCreatedEvent } from "@raustinmietickets/common";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = "expiration-service";
    async onMessage(data: OrderCreatedEvent["data"], msg: any) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log(`Waiting ${delay} ms to process the order.`) 
    await expirationQueue.add(
            {
                orderId: data.id 
            }, {
                delay,
            }
        );

        msg.ack();
    }
}