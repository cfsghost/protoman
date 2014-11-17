
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

		this.send({
			result: content.a + content.b
		});
	});
});

server.listen(1234);
