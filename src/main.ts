import { NxSystemBusManager } from '../lib/main';
import { StateResult } from '../lib/types';

let systemBusManager: NxSystemBusManager;

const logMessage = (message: string | Partial<StateResult>) => {
    console.info(message)

    const messages = document.querySelector<HTMLPreElement>('pre');

    if (typeof message !== 'string') {
        const state = 'View browser developer console to see logged state'
        message = JSON.stringify({ ...message, state }, null, 4);
    } else {
        message = `<strong>${message}<strong>`
    }

    if (messages) {
        const newSpan = document.createElement('span');
        newSpan.classList.add('new')
        newSpan.innerHTML = `\n${message}\n`
        messages.appendChild(newSpan)
        if (messages !== document.activeElement) {
            messages.scrollTo(0, messages.scrollHeight)
        }
    }
}

const connect = (e: Event) => {
    e.preventDefault()

    if (systemBusManager) {
        logMessage('Canceling existing system bus connection')
        systemBusManager.disconnect();
    }

    const messages = document.querySelector<HTMLPreElement>('pre');

    if (messages) {
        messages.innerHTML = '';
    }

    const serverUrl = document.querySelector<HTMLInputElement>('#url')?.value || '';
    const auth = document.querySelector<HTMLInputElement>('#auth')?.value || '';

    logMessage(`Initializing system bus connection for system "${serverUrl}"`)

    if (!auth || !serverUrl) {
        alert('Please make sure to enter both the url and auth to run demo')
    }

    systemBusManager = new NxSystemBusManager(false, serverUrl, auth)

    systemBusManager.stateReducer.getAllUpdates().subscribe(update => {
        logMessage('All System Update')
        logMessage(update)
    })

    systemBusManager.stateReducer.getCameraUpdates().subscribe(update => {
        logMessage('All Camera Update')
        logMessage(update)
    })

    systemBusManager.stateReducer.getCameraUpdates(["{28211a91-4d61-e6b9-da49-172c127da68b}"]).subscribe(update => {
        logMessage('Single Camera Update')
        logMessage(update)
    })

    systemBusManager.stateReducer.getServerUpdates().subscribe(update => {
        logMessage('All Server Update')
        logMessage(update)
    })

    systemBusManager.stateReducer.getServerUpdates(["{a29fc3f4-0de6-0ed6-be0a-a55bc0ea5393}"]).subscribe(update => {
        logMessage('Single Server Update')
        logMessage(update)
    })

    systemBusManager.stateReducer.getStorageUpdates().subscribe(update => {
        logMessage('All Storage Update')
        logMessage(update)
    })

    systemBusManager.stateReducer.getStorageUpdates(["{3d642d7f-e54c-5cad-886e-639421d2d950}"]).subscribe(update => {
        logMessage('Single Storage Update')
        logMessage(update)
    })

    systemBusManager.stateReducer.getUserUpdates().subscribe(update => {
        logMessage('All User Update')
        logMessage(update)
    })

    systemBusManager.stateReducer.getUserUpdates(["{329a88b1-df06-2871-5cde-15a50be17743}"]).subscribe(update => {
        logMessage('Single User Update')
        logMessage(update)
    })

    systemBusManager.stateReducer.getResourceStatusUpdates().subscribe(update => {
        logMessage('All Resource Status Update')
        logMessage(update)
    })

    systemBusManager.stateReducer.getResourceStatusUpdates(['{28211a91-4d61-e6b9-da49-172c127da68b}']).subscribe(update => {
        logMessage('Single Resource Status Update')
        logMessage(update)
    })
}

document.querySelector('button#connect')?.addEventListener('click', connect)