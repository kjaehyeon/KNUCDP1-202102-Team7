var posts = require('./posts');
var SerialPort = require('serialport');
var Readline = require('@serialport/parser-readline');
var {ApolloServer, gql, PubSub} = require("apollo-server");

module.exports = (fdata) => {
    var pubsub = new PubSub();
    // var serial = new SerialPort('/COM5', 9600);  // windows
    var serial = new SerialPort('/dev/ttyACM0', 9600);  // raspi
    var parser = serial.pipe(new Readline({delimiter: '\r\n'}));

    var typeDefs = gql`
	  type Query {
		_: String
	  }
	  type Subscription {
		value: String
	  }
	`;
    var resolvers = {
        Subscription: {
            value: {
                subscribe: () => pubsub.asyncIterator("monitoring")
            },
        },
    };

    parser.on('data', (data) => {
        var rfid = data.substring(0, 8);
        var monitoringData = data.substr(9);
        pubsub.publish("monitoring", {value: monitoringData});
        if (rfid !== 'FFFFFFFF') posts.sendrfid(rfid, fdata, posts.login);
    });

    return new ApolloServer({ typeDefs, resolvers }, playground = true);
}
