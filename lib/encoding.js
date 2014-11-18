"use strict";

var encoders = {
	'application/json': JSON.stringify
};

var decoders = {
	'application/json': JSON.parse
};

module.exports = {
	encode: function(type, raw) {
		var encoder = encoders[type] || undefined;
		if (encoder)
			return encoders[type](raw);

		return raw;
	},
	decode: function(type, source) {
		var decoder = decoders[type] || undefined;
		if (decoder)
			return decoders[type](source);

		return raw;
	}
};
