"use strict";

var util = require('util');
var events = require('events');
var crypto = require('crypto');
var msgpack = require('msgpack');
var Router = require('./router');
var Channel = require('./channel');
var Packet = require('./packet');

var ProtoMan = module.exports = function(options) {
	var self = this;

	var opts = options || {};
	self.id = Date.now() + crypto.randomBytes(16).toString('hex');
	self.stream = opts.stream || null;
	self.queue = opts.queue || new events.EventEmitter();
	self.router = opts.router || new Router();
	self.msgpack = null; 

	if (self.stream) {
		// Initializing msgpack streaming handler to deal with all stream data
		self.msgpack = new msgpack.Stream(self.stream);
		self.msgpack.on('msg', function(packet) {

			// Invalid packet
			if (!packet.id)
				return;

			// No handler can deal with this packet
			self.handle(packet);
		});
	}
};

ProtoMan.Router = Router;

ProtoMan.prototype.handle = function(packet) {
	var self = this;

	/* Packet format:
	 *	{
	 *		id: [Communication Id],
	 *		action: [Action Type],
	 *		method: [Method Name],
	 *		status: [Status Code],
	 *		type: [Content Type],
	 *		content: [message content]
	 *	}
	 *
	 * Normal message example:
	 * { id: 'abc', status: 200, type: 'text/plain', content: 'test' }
	 * 
	 * Call method:
	 * { id: 'abc', action: 'call', method: 'Hello', type: 'text/plain', content: 'test' }
	 *
	 */

	switch(packet.action) {
	case 'call':

		// No method specificed
		if (!packet.method)
			return;

		// Create a new channel for communication
		var channel = new Channel(self, packet.id);
		self.router.handle(self, channel, packet);

		break;

	default:
		// No handler can deal with this packet
		if (!self.queue.listeners(packet.id).length) {
			return;
		}

		// Deal with this packet
		self.queue.emit(packet.id, packet);

		break;
	}
};

ProtoMan.prototype.callMethod = function() {
	var self = this;

	var methodName = arguments[0] || undefined;
	var type = undefined;
	var content = undefined;
	if (arguments.length == 2) {
		type = null;
		content = arguments[1];
	} else {
		type = arguments[1];
		content = arguments[2];
	}

	// Create a channel for this method call
	var channel = new Channel(self, Date.now() + crypto.randomBytes(16).toString('hex'));
	channel.action = 'call';
	channel.method = methodName;
	channel.send(content);

	return channel;
};
