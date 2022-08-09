import { bufferTime, filter, map, Observable } from "rxjs";
import { uniqWith, isEqual } from 'lodash-es';
import { NxSystemState } from "../system_state/NxSystemState";
import { BaseStateReducer } from "./BaseStateReducer";


export class DefaultStateReducer extends BaseStateReducer {
    static readonly DEFAULT_CONFIG = { buffer: 2500 };

    #updateBuffer$: Observable<string[]>;
    config: typeof DefaultStateReducer.DEFAULT_CONFIG;

    static createFactory(config = DefaultStateReducer.DEFAULT_CONFIG) {
        return (state: NxSystemState) => new DefaultStateReducer(state, config);
    }

    /**
     * Reducer factories
     */
    #baseReducerFactory = (targetProperty = '', withState = true, includeIds: string[] = [], prepend = '', idProperty = 'id') => {
        includeIds = prepend ? includeIds.map(id => `${prepend}-${id}`) : includeIds;

        return this.#updateBuffer$.pipe(
            map(updates => includeIds.length ? updates.filter(id => includeIds.includes(id)) : prepend ? updates.filter(id => id.startsWith(prepend)) : updates),
            filter(updates => !!updates.length),
            map(updates => withState ? this.state.getState(updates, targetProperty, includeIds, idProperty) : { updates }),
            filter(res => !!res.updates.length)
        );
    }

    #propertyReducerFactory = (targetProperty: string, prepend = '') => (includeIds: string[] = [], withState = true) => this.#baseReducerFactory(targetProperty, withState, includeIds, prepend);

    /**
     * Reducers
    */
    getAllUpdates = (withState = true) => this.#baseReducerFactory('', withState);

    getCameraUpdates = this.#propertyReducerFactory('cameras');

    getServerUpdates = this.#propertyReducerFactory('servers');

    getStorageUpdates = this.#propertyReducerFactory('storages');

    getUserUpdates = this.#propertyReducerFactory('users');

    getResourceStatusUpdates = this.#propertyReducerFactory('resStatusList', 'status');

    constructor(state: NxSystemState, config = DefaultStateReducer.DEFAULT_CONFIG) {
        super(state);
        this.config = config;

        this.#updateBuffer$ = this.state.updateNotifier$.pipe(
            bufferTime(this.config.buffer),
            map(updates => uniqWith(updates, isEqual)),
            filter(updates => !!updates.length)
        );
    }

}
