import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async () => {
    //Create an instance of a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: '123'
    });

    // Save a ticket to the database
    await ticket.save();

    // fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);
    // make two separate changes to the ticket we fetched(one to each)
    firstInstance!.set({ price: 10 });
    secondInstance!.set({ price: 15 });
    // save the first fetched ticket
    await firstInstance!.save();
    //save the second fetched ticket, expect an error
    await secondInstance!.save().catch((err) => {
        expect(err).toBeDefined();
    });
});

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: '123'
    });
    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
});