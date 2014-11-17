
var net = require('net');
var ProtoMan = require('../');

var server = net.createServer(function(client) {

	// Initializing RPC and using the same method manager
	var protoman = new ProtoMan({
		stream: client
	});

	// Add methods
	protoman.router.addMethod('sum', function(packet) {

		console.log(packet);

		var content = this.getContent(packet);
		if (!content) {
			// Unrecognized content
			return this.end(400);
		}

		console.log('Receiving', content);

		// Send result back
		this.send({
			result: content.a + content.b
		});

		// Waiting for client response
		this.on('data', function(packet) {
			console.log('echo', packet);
			console.log(this.getContent(packet));
		});
	});
});

server.listen(1234);
