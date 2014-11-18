protoman
========

ProtoMan is a useful framework to create your own network protocol for different propose, something's like RPC, tunnel and so on.

[![NPM](https://nodei.co/npm/protoman.png)](https://nodei.co/npm/protoman/)

Installation
-

You can install protoman vim NPM:
```
npm install protoman
```

Usage
-

You may want to create a server which supports your own protocol, here is an example below:
```javascript
var net = require('net');
var ProtoMan = require('protoman')

var server = net.createServer(function(client) {

	// Initializing RPC and using the same method manager
	var protoman = new ProtoMan({
		stream: client
	});

	// Add methods
	protoman.router.addMethod('sum', function(packet) {

		var content = this.getContent(packet);
		if (!content) {
			// Unrecognized content
			return this.end(400);
		}

		// Send result back
		this.send({
			result: content.a + content.b
		});
	});
});

server.listen(1234);
```

Then you can write a client to access this server and use `sum` method to figure out.
```javascript
var net = require('net');
var ProtoMan = require('protoman');

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
	});
});
```

License
-
MIT
