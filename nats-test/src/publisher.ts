// import nats from 'node-nats-streaming';
// import { TicketCreatedPublisher } from './events/ticket-created-publisher';

// const stan = nats.connect('ticketing', 'abc', {
//     url: 'http://localhost:4222'
// });

// stan.on('connect', async () => {
//     console.log('Publisher connected to NATS');

//     const publisher = new TicketCreatedPublisher(stan);
//     await publisher.publish({
//         id: 'id123',
//         title: 'title123',
//         price: 20
//     });
// });
