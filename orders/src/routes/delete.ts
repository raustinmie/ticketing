import express, { Request, Response } from 'express';
import { requireAuth, NotFoundError, NotAuthorizedError } from '@raustinmietickets/common';
import { Order } from '../models/order';
import { OrderStatus } from '@raustinmietickets/common';
import { natsWrapper } from '../nats-wrapper';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';

const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) =>
{
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate('ticket');
    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Complete) {
        throw new Error('Cannot cancel a completed order');
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publish an event saying that an order was cancelled
    await new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id,
        },
    });
    res.status(204).send({ order });
});

export { router as deleteOrderRouter };