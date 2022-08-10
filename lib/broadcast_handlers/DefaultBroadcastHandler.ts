import { Message } from "../types";
import { shareReplay, Subject } from "rxjs";

export class DefaultBroadcastHandler {
    #messages = new Subject<Message>();

    messages = this.#messages.pipe(shareReplay(1));

    report(message: Message) {
        this.#messages.next(message);
    }
}
