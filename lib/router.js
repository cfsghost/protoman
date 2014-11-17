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

		handler.bind(channel, packet)();
	});
};
