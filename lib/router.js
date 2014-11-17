"use strict";

var events = require('events');
var Packet = require('./packet');

var Router = module.exports = function() {
	var self = this;

	self.methods = new events.EventEmitter();
};

Router.prototype.handle = function(protoMan, channel, packet) {
	var self = this;

	// Wether does method exists or not
	if (!self.methods.listeners(packet.method).length) {
		return;
	}

	// Deal with this packet
	self.methods.emit(packet.method, protoMan, channel, packet);
};

Router.prototype.addMethod = function(methodName, handler) {
	var self = this;

	self.methods.on(methodName, function(protoMan, channel, packet) {

		var scope = {
			protoMan: protoMan,
			send: function(content) {
				var statusCode = 200;
				var content = null;

				// First argument is number, it's status code
				if (typeof(arguments[0]) == 'number')
					statusCode = arguments[0];
				else
					content = arguments[0];

				// Create a new packet
				var newPacket = Packet.create(packet.id, packet.type, content);
				newPacket.status = statusCode;

				// Send out
				channel.send(newPacket);
			},
			end: function() {
				this.send.apply(this, Array.prototype.slice.call(arguments));
				channel.end();
			},
			getContent: function() {

				if (packet.content == undefined)
					return null;

				var content = null;
				if (packet.type == 'application/json') {
					try {
						content = JSON.parse(packet.content);
					} catch(e) {
						return undefined;
					}

					return content;
				}

				return packet.content;
			}
		};

		handler.bind(scope, packet)();
	});
};
