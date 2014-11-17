"use strict";

var encoders = {
	'application/json': JSON.stringify
};

module.exports = {
	encode: function(type, raw) {
		var encoder = encoders[type] || undefined;
		if (encoder)
			return encoders[type](raw);

		return raw;
	}
};
