
var net = require('net');
var ProtoMan = require('../');

var client = net.connect({ port: 1234 }, function() {

	var protoMan = new ProtoMan({
		stream: client
	});

	// Figure out
	var sum = protoMan.callMethod('sum', {
		a: 1,
		b: 2
	});

	sum.on('data', function(packet) {
		var content = this.getContent(packet);
		console.log(content);
		this.send(content);
	});
});

