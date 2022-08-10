import { NxSystemBusConnection } from "./NxSystemBusConnection";
import { Message } from "./types";
import { DefaultStateReducer } from "./state_reducers/DefaultStateReducer";
import { DefaultMessageHandler } from "./message_handlers/DefaultMessageHandler";
import { NxSystemState } from "./system_state/NxSystemState";
import { DefaultBroadcastHandler } from "./broadcast_handlers/DefaultBroadcastHandler";

const DISCONNECT_FALLBACK = () => console.info('Not connected to system bus')

export class NxSystemBusManager {
    disconnect = DISCONNECT_FALLBACK
    state: NxSystemState;
    broadcast: DefaultBroadcastHandler;
    #messageHandler: DefaultMessageHandler;
    stateReducer

    constructor(useWebsocket: boolean, mediaServerUrl: string, username: string, password: string)
    constructor(useWebsocket: boolean, mediaServerUrl: string, auth: string)
    constructor(useWebsocket: boolean, mediaServerUrl: string, authOrUsername: string, password?: string, stateReducerFactory = DefaultStateReducer.createFactory()) {
        this.state = new NxSystemState()
        this.broadcast = new DefaultBroadcastHandler()
        this.#messageHandler = new DefaultMessageHandler(this.state, this.broadcast);
        this.stateReducer = stateReducerFactory(this.state)

        console.info(`Connecting to system bus on ${mediaServerUrl}`)

        const systemBus = password ? new NxSystemBusConnection(mediaServerUrl, authOrUsername, password) : new NxSystemBusConnection(mediaServerUrl, authOrUsername)
        systemBus.connect(useWebsocket).then(({ connection, disconnect }) => {
            connection.subscribe(data => this.#delegate(data))
            this.disconnect = () => {
                disconnect();
                this.disconnect = DISCONNECT_FALLBACK
            }
        })
    }

    /**
     * Delegates to a handler which will update the state.
     *
     * @param { command, params }
     */
    #delegate = (message: Message) => {
        this.#messageHandler.handle(message)
    }
}