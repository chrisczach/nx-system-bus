import { BroadcastAction, CameraUserAttributes, IdData, Message, ResourceParam, ResourceStatus, ServersUserAttributes } from "../types";
import { NxSystemState } from "../system_state/NxSystemState";
import { DefaultBroadcastHandler } from "../broadcast_handlers/DefaultBroadcastHandler";


export class DefaultMessageHandler {
    #state: NxSystemState;

    // Picks handler
    handle({ command, params }: Message) {
        // @ts-expect-error
        const handler = this[command] || this.#fallbackHandler(command);
        handler(params);
    }

    #fallbackHandler = <T = unknown>(command: string, needToImplement = false) => (params: T) => {
        const log = needToImplement ? console.warn : console.error
        log(`${needToImplement ? 'Need to implement' : 'Unhandled command'}: ${command}`);
        log(params);
    };

    // Message Handlers
    getFullInfo = (params: Record<string, unknown>) => {
        Object.assign(this.#state, params);
        this.#state.report('system');
    };

    removeResource = (params: IdData) => {
        // Need to implement
        console.log(params)
    }

    removeResourceParam = (params: ResourceParam) => {
        this.#state.allProperties = this.#state.allProperties.filter(({ resourceId }) => resourceId !== params.resourceId);
        this.#state.report(params.resourceId);
    }

    setResourceParam = (params: ResourceParam) => {
        const paramIndex = this.#state.allProperties.findIndex(({ resourceId, name }) => resourceId === params.resourceId && name === params.name);
        if (paramIndex === -1) {
            this.#state.allProperties.push(params);
        } else {
            this.#state.allProperties[paramIndex] = params;
        }
        this.#state.report(params.resourceId);
    };

    setResourceParams = (params: ResourceParam[]) => {
        params.forEach(param => this.setResourceParam(param))
    }

    runtimeInfoChanged = this.#fallbackHandler('runtimeInfoChanged', true)
    runtimeInfoRemoved = this.#fallbackHandler('runtimeInfoRemoved', true)
    discoveredServersList = this.#fallbackHandler('discoveredServersList', true)

    saveCameraUserAttributes = (params: CameraUserAttributes) => {
        const paramIndex = this.#state.cameraUserAttributesList.findIndex(({ cameraId }) => cameraId === params.cameraId);
        if (paramIndex === -1) {
            this.#state.cameraUserAttributesList.push(params);
        } else {
            this.#state.cameraUserAttributesList[paramIndex] = params;
        }
        this.#state.report(params.cameraId);
    }

    saveServerUserAttributes = (params: ServersUserAttributes) => {
        const paramIndex = this.#state.serversUserAttributesList.findIndex(({ serverId }) => serverId === params.serverId);
        if (paramIndex === -1) {
            this.#state.serversUserAttributesList.push(params);
        } else {
            this.#state.serversUserAttributesList[paramIndex] = params;
        }
        this.#state.report(params.serverId);
    }

    removeResourceStatus = (params: IdData) => {
        this.#state.resStatusList = this.#state.resStatusList.filter(({ id }) => id !== params.id);
        this.#state.report(params.id, 'resStatusList');
    }

    setResourceStatus = (params: ResourceStatus) => {
        const paramIndex = this.#state.resStatusList.findIndex(({ id }) => id === params.id);
        if (paramIndex === -1) {
            this.#state.resStatusList.push(params);
        } else {
            this.#state.resStatusList[paramIndex] = params;
        }
        this.#state.report(params.id, 'resStatusList');
    };

    broadcastAction = (params: Record<string, unknown>) => this.broadcastHandler.report({command: 'broadcastAction', params})

    constructor(state: NxSystemState, private broadcastHandler: DefaultBroadcastHandler) {
        this.#state = state;
    }
}
