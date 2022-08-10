import { shareReplay, Subject } from "rxjs";
import { StateResult, SystemState } from "../types";
import { cloneDeep, omit, pick } from 'lodash-es';


export class NxSystemState extends SystemState {
    #updater$ = new Subject<string>();

    updateNotifier$ = this.#updater$.pipe(
        shareReplay(1)
    );

    report(resourceId: string, prepend = '') {
        this.#updater$.next(prepend ? `${prepend}-${resourceId}` : resourceId);
    }

    getState(updates: string[]): StateResult;
    getState(updates: string[], property: string): StateResult;
    getState(updates: string[], property: string, includeIds: string[]): StateResult;
    getState(updates: string[], property: string, includeIds: string[], idProperty: string): StateResult;
    getState(updates: string[], property: string = '', includeIds: string[] = [], idProperty = 'id'): StateResult {
        const value = property ? pick(this, property) : omit(this, 'updateNotifier$', '#updater#');
        const idsFound: string[] = []

        for (const propertyKey of Object.keys(value)) {
            // @ts-expect-error
            const items = value[propertyKey] = includeIds.length ? value[propertyKey].filter(item => item[idProperty] && includeIds.includes(item[idProperty]) && updates.includes(item[idProperty])) : value[propertyKey];
            items.forEach((item: { [x: string]: any; }) => idsFound.push(item[idProperty]))
        }

        updates = updates.map(id => id.replace(`${property}-`, '')).filter(updated => idsFound.includes(updated))

        return {
            updates: includeIds.length ? updates.filter(id => includeIds.includes(id)) : updates,
            state: cloneDeep(value)
        };
    }
}
