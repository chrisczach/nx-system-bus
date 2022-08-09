import { shareReplay, Subject } from "rxjs";
import { StateResult, SystemState } from "../types";
import { cloneDeep, omit, pick } from 'lodash-es';


export class NxSystemState extends SystemState {
    #updater$ = new Subject<string>();

    updateNotifier$ = this.#updater$.pipe(
        shareReplay(1)
    );

    report(resourceId: string) {
        this.#updater$.next(resourceId);
    }

    getState(updates: string[]): StateResult;
    getState(updates: string[], property: string): StateResult;
    getState(updates: string[], property: string, includeIds: string[]): StateResult;
    getState(updates: string[], property: string, includeIds: string[], idProperty: string): StateResult;
    getState(updates: string[], property: string = '', includeIds: string[] = [], idProperty = 'id'): StateResult {
        const value = property ? pick(this, property) : this;

        if (includeIds.length) {
            const properties = property ? [property] : Object.keys(value);
            for (const propertyKey of properties) {
                // @ts-expect-error
                value[propertyKey] = value[propertyKey].filter(item => !item[idProperty] || includeIds.includes(item[idProperty]));

            }
        }

        return {
            updates: includeIds.length ? updates.filter(id => includeIds.includes(id)) : updates,
            state: cloneDeep(omit(value, ['updateNotifier$']))
        };
    }
}
