import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it('Returns an error if the ticket does not exist', async () => {
const ticketId = new mongoose.Types.ObjectId().toHexString();
await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404);
});

it('Returns an error if the ticket is already reserved', async () => {
   const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
         title: 'concert',
         price: 20,
    });
    await ticket.save();
    const order = Order.build({
        userId: '123',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket,
    });
    await order.save();
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId: ticket.id })
        .expect(400);
});

it('Orders a ticket', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
   });
   await ticket.save();
   await request(app)
   .post('/api/orders')
   .set('Cookie', global.signin())
   .send({ ticketId: ticket.id })
   .expect(201);
});

it('Emit an order created event', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
   });
   await ticket.save();
   await request(app)
   .post('/api/orders')
   .set('Cookie', global.signin())
   .send({ ticketId: ticket.id })
   .expect(201);
   expect(natsWrapper.client.publish).toHaveBeenCalled();
});