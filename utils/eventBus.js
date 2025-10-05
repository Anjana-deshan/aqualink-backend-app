// utils/eventBus.js
import { EventEmitter } from "events";
const bus = new EventEmitter();

// Optional: increase listeners cap if you expect many clients
bus.setMaxListeners(100);

export default bus;
