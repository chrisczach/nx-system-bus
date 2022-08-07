import { bufferTime, filter, map, Observable, shareReplay, Subject } from "rxjs";
import { NxSystemBusConnection } from "./NxSystemBusConnection";
import { Message, ResourceParam, ResourceStatus, StateResult, SystemState } from "./types";
import { uniqWith, isEqual, cloneDeep, omit, pick } from 'lodash-es';

const DISCONNECT_FALLBACK = () => console.info('Not connected to system bus')

export class NxSystemState extends SystemState {
    #updater$ = new Subject<string>()

    updateNotifier$ = this.#updater$.pipe(
        shareReplay(1)
    )

    report(resourceId: string) {
        this.#updater$.next(resourceId)
    }

    getState(updates: string[]): StateResult;
    getState(updates: string[], property: string): StateResult;
    getState(updates: string[], property: string, includeIds: string[]): StateResult;
    getState(updates: string[], property: string, includeIds: string[], idProperty: string): StateResult;
    getState(updates: string[], property: string = '', includeIds: string[] = [], idProperty = 'id'): StateResult {
        const value = property ? pick(this, property) : this;

        if (includeIds.length) {
            const properties = property ? [property] : Object.keys(value)
            for (const propertyKey of properties) {
                // @ts-expect-error
                value[propertyKey] = value[propertyKey].filter(item => !item[idProperty] || includeIds.includes(item[idProperty]))

            }
        }

        return {
            updates: includeIds.length ? updates.filter(id => includeIds.includes(id)) : updates,
            state: cloneDeep(omit(value, ['updateNotifier$']))
        }
    }
}

export class NxMessageHandler {
    #state: NxSystemState;

    // Picks handler
    handle({ command, params }: Message) {
        // @ts-expect-error
        const handler = this[command] || this.#fallbackHandler(command);
        handler(params);
    }

    #fallbackHandler = (command: string) => (params: unknown) => {
        console.info(`Unhandled command: ${command}`)
        console.info(params);
    }

    // Message Handlers

    getFullInfo = (params: Record<string, unknown>) => {
        Object.assign(this.#state, params)
        this.#state.report('system')
    }

    setResourceParam = (params: ResourceParam) => {
        const paramIndex = this.#state.allProperties.findIndex(({ resourceId, name }) => resourceId === params.resourceId && name === params.name)
        if (paramIndex === -1) {
            this.#state.allProperties.push(params)
        } else {
            this.#state.allProperties[paramIndex] = params;
        }
        this.#state.report(params.resourceId)
    }

    runtimeInfoChanged = () => {
        // Don't think this is useful.
    }

    runtimeInfoRemoved = () => {
        // Don't think this is useful.
    }

    discoveredServersList = () => {
        // Don't think this is useful.
    }

    setResourceStatus = (params: ResourceStatus) => {
        const paramIndex = this.#state.resStatusList.findIndex(({ id }) => id === params.id)
        if (paramIndex === -1) {
            this.#state.resStatusList.push(params)
        } else {
            this.#state.resStatusList[paramIndex] = params;
        }
        this.#state.report(params.id)
    }

    constructor(state: NxSystemState) {
        this.#state = state;
    }
}


export class BaseStateReducer {
    constructor(
        public state: NxSystemState
    ) { }

}

export class DefaultStateReducer extends BaseStateReducer {
    static readonly DEFAULT_CONFIG = { buffer: 2500 }

    #updateBuffer$: Observable<string[]>
    config: typeof DefaultStateReducer.DEFAULT_CONFIG

    static createFactory(config = DefaultStateReducer.DEFAULT_CONFIG) {
        return (state: NxSystemState) => new DefaultStateReducer(state, config)
    }

    /**
     * Reducer factories
     */

    #baseReducerFactory = (targetProperty = '', withState = true, includeIds: string[] = [], idProperty = 'id') => this.#updateBuffer$.pipe(
        map(updates => includeIds.length ? updates.filter(id => includeIds.includes(id)) : updates),
        filter(updates => !!updates.length),
        map(updates => withState ? this.state.getState(updates, targetProperty, includeIds, idProperty) : { updates }),
        filter(res => !!res.updates.length)
    )

    #propertyReducerFactory = (targetProperty: string) => (includeIds: string[] = [], withState = true) => this.#baseReducerFactory(targetProperty, withState, includeIds)

    /**
     * Reducers
    */

    getAllUpdates = (withState = true) => this.#baseReducerFactory('', withState)

    getCameraUpdates = this.#propertyReducerFactory('cameras')

    getServerUpdates = this.#propertyReducerFactory('servers')

    getStorageUpdates = this.#propertyReducerFactory('storages')

    getUserUpdates = this.#propertyReducerFactory('users')

    constructor(state: NxSystemState, config = DefaultStateReducer.DEFAULT_CONFIG) {
        super(state)
        this.config = config;

        this.#updateBuffer$ = this.state.updateNotifier$.pipe(
            bufferTime(this.config.buffer),
            map(updates => uniqWith(updates, isEqual)),
            filter(updates => !!updates.length)
        );
    }

}

export class NxSystemBusManager {
    disconnect = DISCONNECT_FALLBACK
    state: NxSystemState;
    #messageHandler: NxMessageHandler;
    stateReducer

    constructor(useWebsocket: boolean, mediaServerUrl: string, username: string, password: string)
    constructor(useWebsocket: boolean, mediaServerUrl: string, auth: string)
    constructor(useWebsocket: boolean, mediaServerUrl: string, authOrUsername: string, password?: string, stateReducerFactory = DefaultStateReducer.createFactory()) {
        this.state = new NxSystemState()
        this.#messageHandler = new NxMessageHandler(this.state);
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