import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@raustinmietickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

jest.mock('../../stripe');

it('returns a 404 when purchasing an order that does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: "token",
            orderId: new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
});

it('returns a 401 when purchasing an order that doesnt belong to the user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        status: OrderStatus.Created,
        version: 0
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: "token",
            orderId: order.id
        })
        .expect(401)
});

it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        price: 10,
        status: OrderStatus.Cancelled,
        version: 0
    });
    await order.save();

    await request(app)
        .post(`/api/payments`)
        .set('Cookie', global.signin(userId))
        .send({
            orderId: order.id,
            token: 'token'
        })
        .expect(400);
});

it('returns a 204 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        price: 10,
        status: OrderStatus.Created,
        version: 0
    });
    await order.save();

    await request(app)
        .post(`/api/payments`)
        .set('Cookie', global.signin(userId))
        .send({
            orderId: order.id,
            token: 'tok_visa'
        })
        .expect(201);

        const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
        expect(chargeOptions.source).toEqual('tok_visa');
        expect(chargeOptions.amount).toEqual(10 * 100);
        expect(chargeOptions.currency).toEqual('usd');

        const payment = await Payment.findOne({
            orderId: order.id,
        });
        expect(payment).not.toBeNull();
});