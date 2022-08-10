import { NxSystemBusManager } from '../lib/main';
import { StateResult } from '../lib/types';

let systemBusManager: NxSystemBusManager;

const logMessage = (message: string | Partial<StateResult>) => {
    console.info(message)

    const messages = document.querySelector<HTMLPreElement>('pre');

    if (typeof message !== 'string') {
        const state = 'View browser developer console to see logged state'
        message = JSON.stringify(message.state ? { ...message, state } : message, null, 4);
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

const connect = (e?: Event) => {
    e?.preventDefault()

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
    const selectedResources = (document.querySelector<HTMLInputElement>('#resources')?.value || '').split(',').map(id => id.trim()).filter(id => !!id)

    logMessage(`Initializing system bus connection for system "${serverUrl}"`)

    if (!auth || !serverUrl) {
        alert('Please make sure to enter both the url and auth to run demo')
    }

    const url = new URL(window.location.href);
    url.searchParams.set('url', serverUrl)
    url.searchParams.set('auth', auth)
    url.searchParams.set('selectedResources', selectedResources.join(','))
    window.history.pushState({ url: url.toString() }, '', url.toString());

    systemBusManager = new NxSystemBusManager(false, serverUrl, auth)

    const showing = selectedResources.length ? 'Selected' : 'All'

    if (selectedResources.length) {
        logMessage("Showing filtered updates, to demo all updates remove resourceId's and reconnect.")
        logMessage("Resouce Id's:")
        logMessage(`${JSON.stringify(selectedResources, null, 4)}\n`)
    } else {
        logMessage("Showing all updates, to demo filtered updates add resrouceId's to include and reconnect.")
    }

    const systemStateToObserve = {
        getAllUpdates: 'System Update',
        getCameraUpdates: 'Camera Update',
        getServerUpdates: 'Server Update',
        getStorageUpdates: 'Storage Update',
        getUserUpdates: 'User Update',
        getResourceStatusUpdates: 'Resource Status Update'
    }

    // @ts-expect-error
    Object.entries(systemStateToObserve).forEach(([reducer, message]) => systemBusManager.stateReducer[reducer](selectedResources).subscribe(update => {
        logMessage(`${showing} ${message}`)
        logMessage(update)
    }))

    systemBusManager.broadcast.messages.subscribe(({command, params}) => {
        logMessage(`Broadcast Event: ${command}`)
        logMessage(params)
    })
}

const queryParams = new URLSearchParams(window.location.search);

const url = queryParams.get('url')
const auth = queryParams.get('auth')
const selectedResources = queryParams.get('selectedResources')

if (url) {
    const urlInput = document.querySelector<HTMLInputElement>('input#url')
    if (urlInput) {
        urlInput.value = url;
    }
}

if (auth) {
    const authInput = document.querySelector<HTMLInputElement>('input#auth')
    if (authInput) {
        authInput.value = auth;
    }
}

if (selectedResources) {
    const selectedResourcesInput = document.querySelector<HTMLInputElement>('input#resources')
    if (selectedResourcesInput) {
        selectedResourcesInput.value = selectedResources;
    }
}

if (auth && url) {
    connect()
}

document.querySelector('button#connect')?.addEventListener('click', connect)