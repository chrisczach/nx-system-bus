import { CameraUserAttributes, Message, ResourceParam, ResourceStatus } from "../types";
import { NxSystemState } from "../system_state/NxSystemState";


export class DefaultMessageHandler {
    #state: NxSystemState;

    // Picks handler
    handle({ command, params }: Message) {
        // @ts-expect-error
        const handler = this[command] || this.#fallbackHandler(command);
        handler(params);
    }

    #fallbackHandler = (command: string) => (params: unknown) => {
        console.info(`Unhandled command: ${command}`);
        console.info(params);
    };

    // Message Handlers
    getFullInfo = (params: Record<string, unknown>) => {
        Object.assign(this.#state, params);
        this.#state.report('system');
    };

    setResourceParam = (params: ResourceParam) => {
        const paramIndex = this.#state.allProperties.findIndex(({ resourceId, name }) => resourceId === params.resourceId && name === params.name);
        if (paramIndex === -1) {
            this.#state.allProperties.push(params);
        } else {
            this.#state.allProperties[paramIndex] = params;
        }
        this.#state.report(params.resourceId);
    };

    runtimeInfoChanged = () => {
        // Don't think this is useful.
    };

    runtimeInfoRemoved = () => {
        // Don't think this is useful.
    };

    discoveredServersList = () => {
        // Don't think this is useful.
    };

    saveCameraUserAttributes = (params: CameraUserAttributes) => {
        const paramIndex = this.#state.cameraUserAttributesList.findIndex(({ cameraId }) => cameraId === params.cameraId);
        if (paramIndex === -1) {
            this.#state.cameraUserAttributesList.push(params);
        } else {
            this.#state.cameraUserAttributesList[paramIndex] = params;
        }
        this.#state.report(params.cameraId);
    }

    setResourceStatus = (params: ResourceStatus) => {
        const paramIndex = this.#state.resStatusList.findIndex(({ id }) => id === params.id);
        if (paramIndex === -1) {
            this.#state.resStatusList.push(params);
        } else {
            this.#state.resStatusList[paramIndex] = params;
        }
        this.#state.report(params.id);
        this.#state.report(`status-${params.id}`);
    };

    constructor(state: NxSystemState) {
        this.#state = state;
    }
}
