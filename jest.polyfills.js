const { TextEncoder, TextDecoder } = require('util');
const { Readable } = require('stream');
const { EventEmitter } = require('events');

// Mock BroadcastChannel
class BroadcastChannel extends EventEmitter {
  constructor(channel) {
    super();
    this.channel = channel;
  }

  postMessage(message) {
    this.emit('message', { data: message });
  }

  close() {
    this.removeAllListeners();
  }
}

// Mock Response and related classes
class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Headers(init.headers);
    this.ok = this.status >= 200 && this.status < 300;
  }

  async json() {
    return JSON.parse(this.body);
  }

  async text() {
    return this.body;
  }
}

class Headers {
  constructor(init = {}) {
    this._headers = new Map();
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this._headers.set(key.toLowerCase(), value);
      });
    }
  }

  get(name) {
    return this._headers.get(name.toLowerCase()) || null;
  }

  set(name, value) {
    this._headers.set(name.toLowerCase(), value);
  }
}

class Request {
  constructor(url, init = {}) {
    this.url = url;
    this.method = init.method || 'GET';
    this.headers = new Headers(init.headers);
    this.body = init.body;
  }
}

// Mock MessageChannel and MessagePort
class MessageChannel {
  constructor() {
    this.port1 = new MessagePort();
    this.port2 = new MessagePort();
  }
}

class MessagePort {
  constructor() {
    this.onmessage = null;
    this.onmessageerror = null;
  }
  
  postMessage(message) {
    if (this.onmessage) {
      this.onmessage({ data: message });
    }
  }
  
  start() {}
  close() {}
}

// Add web streams polyfills
global.ReadableStream = Readable;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.Response = Response;
global.Headers = Headers;
global.Request = Request;
global.MessageChannel = MessageChannel;
global.MessagePort = MessagePort;
global.BroadcastChannel = BroadcastChannel;

// Add other required web APIs
if (typeof global.structuredClone !== 'function') {
  global.structuredClone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

// Add Web Stream APIs
global.WritableStream = class WritableStream {};
global.TransformStream = class TransformStream {};
global.ByteLengthQueuingStrategy = class ByteLengthQueuingStrategy {};
global.CountQueuingStrategy = class CountQueuingStrategy {};

// Add other required Web APIs
global.performance = {
  now() { return Date.now(); }
};

global.URL = URL;
global.URLSearchParams = URLSearchParams;

// Add FormData
global.FormData = class FormData {
  constructor() {
    this._data = new Map();
  }
  append(key, value) {
    this._data.set(key, value);
  }
  get(key) {
    return this._data.get(key);
  }
};