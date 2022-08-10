import { bufferTime, distinctUntilChanged, filter, map, Observable } from "rxjs";
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
    #baseReducerFactory = (targetProperty = '', includeIds: string[] = [], prepend = false, idProperty = 'id') => {
        const prependIds = prepend ? includeIds.map(id => `${targetProperty}-${id}`) : includeIds
        return this.#updateBuffer$.pipe(
            map(updates => prependIds.length ? updates.filter(id => prependIds.includes(id)) : updates),
            filter(updates => !!updates.length),
            map(updates => this.state.getState(updates, targetProperty, includeIds, idProperty)),
            filter(res => !!res.updates.length),
            distinctUntilChanged(isEqual)
        );
    }

    #propertyReducerFactory = (targetProperty: string, prepend = false) => (includeIds: string[] = []) => this.#baseReducerFactory(targetProperty, includeIds, prepend);

    /**
     * Reducers
    */
    getAllUpdates = this.#propertyReducerFactory('')

    getCameraUpdates = this.#propertyReducerFactory('cameras');

    getServerUpdates = this.#propertyReducerFactory('servers');

    getStorageUpdates = this.#propertyReducerFactory('storages');

    getUserUpdates = this.#propertyReducerFactory('users');

    getResourceStatusUpdates = this.#propertyReducerFactory('resStatusList', true);

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
