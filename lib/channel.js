"use strict";

var util = require('util');
var Stream = require('stream');
var msgpack = require('msgpack');
var Packet = require('./packet');

var Channel = module.exports = function(protoMan, id) {
	var self = this;

	Stream.Duplex.call(this, { objectMode: true });

	self.channelId = id;
	self.protoMan = protoMan;
	self.queue = [];

	// Listen to specifc ID for processing packet
	self.protoMan.queue.on(id, function(packet) {
		// set default content type as such packet
		self.contentType = packet.type;
		self.queue.push(packet);

		// Readable
		self._read(0);
	});

	// Header
	self.action = undefined;
	self.method = undefined;
	self.contentType = undefined;

	var _end = this.end.bind(this);
	self.end = function() {
		self.send.apply(this, Array.prototype.slice.call(arguments));
		_end();
	};

	self.getContent = function(packet) {

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
	};
};

util.inherits(Channel, Stream.Duplex);

Channel.prototype._write = function(chunk, encoding, callback) {
	var self = this;

	this.protoMan.msgpack.send(chunk);

	// Reset situation
	self.action = undefined;
	self.method = undefined;

	callback();
};

Channel.prototype._read = function(n) {

	// Doesn't have data yet
	if (!this.queue.length)
		return;

	// Get data from queue
	var chunk = this.queue.shift();
	this.push(chunk);
};

Channel.prototype.send = function() {
	var self = this;

	//this.protoMan.msgpack.send(packet);
	var statusCode = 200;
	var content = undefined;

	// First argument is number, it's status code
	if (typeof(arguments[0]) == 'number') {
		statusCode = arguments[0];
		content = arguments[1] || undefined;
	} else {
		content = arguments[0];
	}

	// Create a new packet
	var newPacket = Packet.create(self.channelId, self.contentType, content);

	if (self.action)
		newPacket.action = self.action;

	if (self.method)
		newPacket.method = self.method;

	newPacket.status = statusCode;

	// Reset situation
	self.action = undefined;
	self.method = undefined;

	// Send out
	this.protoMan.msgpack.send(newPacket);
};
