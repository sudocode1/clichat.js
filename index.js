const EventEmitter = require("events");
const ws = require("ws");

exports.Client = class extends EventEmitter {
    /**
     * Emitted when a message is recieved.
     * @event Client#message
     * @type {object}
     * @property {string} content - Message content
     * @property {string} username - Message sender username
     */

    /**
     * Create Bot Client
     * @constructor
     * @param {string} server - The server IP
     * @param {string} username - Bot username
     *
     */ 
    constructor(server, username) {
        super();
        this.server = 'ws://' + server;
        this.username = username;

        this.ws = new ws(this.server);
        this.open = new Promise(r => this.ws.onopen = r);
        this.id;

        this.handlers = {
            message: (username, content) => {
                this.emit('message', { username, content });
            },
            disconnect: username => {
                if (username === null) null;
                else this.emit ('disconnect', { username });
            },
            join: username => {
                this.emit('join', { username });
            },
            id: x => {
                this.id = x;
                this.emit('id', { id: x });
            },
            refusal: x => {
                this.emit('refusal', { x });
            }
        }

        this.ws.onmessage = s => {
            //console.log(s);
            const d = JSON.parse(s.data);
            this.handlers[d[0]] && this.handlers[d[0]](...d.slice(1));
        };
    }

    /**
     * @function
     * Login the bot
     */
    async login() {
        await this.open;
        this.ws.send(JSON.stringify([ 'auth', { ip: null, username: this.username } ]));
    }

    /**
     * @function
     * Send a message
     * @param {string} msg - Message to send
     */
    async send(msg) {
        await this.open;
        this.ws.send(JSON.stringify([ 'msg', { id: this.id, msg } ]));
    }

    /**
     * @function
     * Disconnect the bot
     */
    disconnect() {
        this.ws.close();
    }
}