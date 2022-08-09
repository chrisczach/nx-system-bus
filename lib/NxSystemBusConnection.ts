import { Subject, from, switchMap, catchError, takeUntil } from "rxjs";
import { webSocket } from 'rxjs/webSocket';

import { Message } from './types';


export class NxSystemBusConnection {
    #mediaServerUrl = '';
    #username = '';
    #password = '';
    #auth = '';
    #authenticated = false;

    constructor(mediaServerUrl: string, username: string, password: string)
    constructor(mediaServerUrl: string, auth: string)
    constructor(mediaServerUrl: string, authOrUsername: string, password?: string) {
        this.#mediaServerUrl = this.#cleanUrl(mediaServerUrl);
        if (password) {
            this.#username = authOrUsername;
            this.#password = password;
        } else {
            this.#auth = authOrUsername;
            this.#authenticated = true;

        }

    }

    async connect(useWebsocket = true) {
        return (useWebsocket ? this.#getBusWs : this.#getBusHttp)();
    }

    #cleanUrl = (url: string) => {
        const [base] = url.split('://').reverse();
        return base.replace(/\/$/, "");
    };

    #authenticate = async () => {
        if (this.#authenticated)
            return;
        const method = 'POST';
        const body = JSON.stringify({
            username: this.#username,
            password: this.#password,
            setCookie: true
        });
        const headers = new Headers({});
        headers.set('accept', 'application/json, text/plain, */*');
        headers.set('content-type', 'application/json');
        await fetch(`https://${this.#mediaServerUrl}/web/rest/v1/login/sessions`, { method, body, headers });
        this.#authenticated = true;
    };

    #getBusWs = () => {
        const disconnectSubject = new Subject<'disconnect'>();
        let disconnect = () => disconnectSubject.next('disconnect');
        const connection = from(this.#authenticate()).pipe(
            switchMap(() => webSocket<Message>(`wss://${this.#mediaServerUrl}/ec2/transactionBus${this.#auth ? '?auth=' + this.#auth : ''}`)),
            catchError(() => {
                console.error('Unable to connect using websocket falling back to http')
                return this.#getBusHttp().connection.pipe(takeUntil(disconnectSubject))
            }))
        return { connection, disconnect };
    };

    #getBusHttp = () => {
        const connection = new Subject<Message>();
        let active = true;
        let reader: ReadableStreamDefaultReader;
        const controller = new AbortController();
        let retries = 5;

        const connectToBus = async (reconnect = false) => {
            await this.#authenticate();
            retries--;

            try {
                const response = await fetch(`https://${this.#mediaServerUrl}/ec2/transactionBus/http${this.#auth ? '?auth=' + this.#auth : ''}`, { signal: controller.signal });

                if (!response.body) {
                    connection.next({ command: 'error', params: { message: reconnect ? 'Connection to system bus lost' : 'Unable to connect to system bus.' } });
                    return
                }

                reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

                if (response.status === 200) {
                    connection.next({ command: 'info', params: { message: reconnect ? 'Connection to system bus re-established.' : 'Successfully Connected to System Bus.' } });
                    retries++;
                }

                // eslint-disable-next-line no-unmodified-loop-condition
                while (active) {
                    const { value, done } = await reader.read();
                    if (done && active) {
                        if (response.status === 200) {
                            connectToBus(true);
                        } else {
                            connection.next({ command: 'error', params: { message: reconnect ? 'Connection to system bus lost' : 'Unable to connect to system bus.' } });
                        }
                        break;
                    }
                    value.split('\r\n')
                        .filter((entry: '') => entry[0] === '{')
                        .map((data: string) => {
                            try {
                                return JSON.parse(data);
                            } catch (e) {
                                fetch(`https://${this.#mediaServerUrl}/ec2/getFullInfo${this.#auth ? '?auth=' + this.#auth : ''}`, { signal: controller.signal }).then(res => res.json()).then(params => {
                                    const command = 'getFullInfo';
                                    connection.next({ command, params });
                                });
                                return undefined;
                            }
                        })
                        .filter((data: any) => data)
                        .forEach(({ tran: messsage }: { tran: Message }) => {
                            connection.next(messsage);
                        });
                }
            } catch (e) {
                console.error(e);
                if (retries) {
                    console.error(`Retrying to connect.`);
                    connectToBus(reconnect);
                }
            }
        };

        connectToBus();

        const disconnect = () => {
            try {
                controller.abort();
            } catch (e) {
                console.error(e);
            }
            active = false;
            return reader.cancel();
        };

        return { connection, disconnect };
    };
}
