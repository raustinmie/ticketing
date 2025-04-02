import { TicketUpdatedEvent } from '@raustinmietickets/common';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';

const setup = async () => {
    //create an instance of the listener

    const listener = new TicketUpdatedListener(natsWrapper.client);
    //create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'movie',
        price: 30,
    });
    await ticket.save();
    //create a fake data event
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        title: 'concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 1,
    };

    //create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, ticket, msg };
};

it('finds, updated, and saves a ticket', async () => {
    const { listener, data, ticket, msg } = await setup();

    //call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);
    //write assertions to make sure a ticket was created
    const updatedTicket = await Ticket.findById(data.id);
    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
    expect(updatedTicket!.version).toEqual(ticket.version+1);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    //call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    //write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has skipped a version number', async () => {
    const { listener, data, msg } = await setup();

    //set the version number to a skipped version
    data.version = 10;

    try {
        await listener.onMessage(data, msg);
    } catch (err) {}

    //write assertions to make sure ack function is not called
    expect(msg.ack).not.toHaveBeenCalled();
});