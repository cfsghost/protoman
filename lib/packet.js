"use strict";

var crypto = require('crypto');
var Encoding = require('./encoding');

var defaultType = 'application/json';

function create() {
	var id = null;
	var type = null;
	var content = null;
	if (arguments.length == 1) {
		// Using JSON by default
		type = defaultType;
		content = arguments[0];
	} else if (arguments.length == 3) {
		id = arguments[0];
		type = arguments[1] || defaultType;
		content = arguments[2];
	} else {
		// TODO: Preprocess content for specific type
		type = arguments[0] || defaultType;
		content = arguments[1];
	}

	var encodedData = Encoding.encode(type, content);

	// Generate a unique ID
	if (!id)
		id = Date.now() + crypto.randomBytes(16).toString('hex');

	var packet = {
		id: id,
		type: type,
		content: encodedData
	};

	return packet;
}

function getContent(packet) {

	if (packet.content == undefined)
		return null;

	var content = null;
	try {
		content = Encoding.decode(packet.type, packet.content);
	} catch(e) {
		return undefined;
	}

	return content;
}

module.exports = {
	create: create,
	getContent: getContent
};
