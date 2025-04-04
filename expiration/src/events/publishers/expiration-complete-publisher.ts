import { Publisher, ExpirationCompleteEvent, Subjects } from "@raustinmietickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}