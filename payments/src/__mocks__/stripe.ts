export const stripe = {
    charges: {
        create: jest.fn()
        .mockResolvedValue({
            orderId: 'orderId',
            id: 'stripeId',
            version: 0,
        }),
    },
};