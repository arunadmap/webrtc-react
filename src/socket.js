import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : 'https://4684-112-134-210-105.ngrok-free.app';

export const socket = io(URL);