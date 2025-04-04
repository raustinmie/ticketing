import { Subjects, Publisher, PaymentCreatedEvent } from "@raustinmietickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}