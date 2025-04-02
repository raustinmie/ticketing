import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('fetches orders for a particular user', async () => {
    // Create three tickets
    const ticketOne = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });
    const ticketTwo = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'movie',
        price: 10,
    });
    const ticketThree = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'play',
        price: 15,
    });
    // Save them to the database
    await Promise.all([ticketOne.save(), ticketTwo.save(), ticketThree.save()]);
    
    // Create one order as User #1
    const userOne = global.signin();
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticketOne.id })
        .expect(201);
    
    // Create two orders as User #2
    const userTwo = global.signin();
   const { body: orderOne} = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketTwo.id })
        .expect(201);
    
    const { body: orderTwo } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketThree.id })
        .expect(201);
    
    // Make a request to get orders for User #2
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .expect(200);
    
    // Make sure we only get the orders for User #2
    expect(response.body.orders.length).toEqual(2);
    expect(response.body.orders[0].id).toEqual(orderOne.id);
    expect(response.body.orders[1].id).toEqual(orderTwo.id);
});