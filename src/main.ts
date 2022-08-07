import { NxSystemBusManager } from '../lib/main';

const systemBusManager = new NxSystemBusManager(false, '552bac15-8c6a-40da-a46e-da321962dcca.relay.relay.cloud.hdw.mx', 'ZTBlNjJlYWQwNGZkNDMyNzg5ZDk0MzQ1MjA0MjM3YzctMjUyMDg1NTQ4NjpvcXhZdkdYNkk3NHZuRWN5ZGhBVEN4Wm5iZjFrNkk9aHpib2JoOjAxMzE0ODlmYjVhOTMyMWE0OTgzNTlmNTkxYzJjMjNj')

systemBusManager.stateReducer.getAllUpdates().subscribe(update =>{
    console.info('All System Update')
    console.log(update)
})

systemBusManager.stateReducer.getCameraUpdates().subscribe(update =>{
    console.info('All Camera Update')
    console.log(update)
})

systemBusManager.stateReducer.getCameraUpdates(["{28211a91-4d61-e6b9-da49-172c127da68b}"]).subscribe(update => {
    console.info('Single Camera Update')
    console.log(update)
})

systemBusManager.stateReducer.getServerUpdates().subscribe(update =>{
    console.info('All Server Update')
    console.log(update)
})

systemBusManager.stateReducer.getServerUpdates(["{a29fc3f4-0de6-0ed6-be0a-a55bc0ea5393}"]).subscribe(update => {
    console.info('Single Server Update')
    console.log(update)
})

systemBusManager.stateReducer.getStorageUpdates().subscribe(update =>{
    console.info('All Storage Update')
    console.log(update)
})

systemBusManager.stateReducer.getStorageUpdates(["{3d642d7f-e54c-5cad-886e-639421d2d950}"]).subscribe(update => {
    console.info('Single Storage Update')
    console.log(update)
})

systemBusManager.stateReducer.getUserUpdates().subscribe(update =>{
    console.info('All User Update')
    console.log(update)
})

systemBusManager.stateReducer.getUserUpdates(["{329a88b1-df06-2871-5cde-15a50be17743}"]).subscribe(update => {
    console.info('Single User Update')
    console.log(update)
})