var {ApolloServer, gql, PubSub} = require("apollo-server-express");
var pubsub = new PubSub();

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

setInterval(() => {
    var temp = Math.floor(Math.random() * 30);  // 센서 데이터 자리, 일단 랜덤
    var humid = Math.floor(Math.random() * 100);
    var fire = Math.floor(Math.random() * 2);
    var gas = Math.floor(Math.random() * 2);
    var valueStr = temp + '#' + humid + '#' + fire + '#' + gas;
    pubsub.publish("monitoring", {
        value: valueStr,
    });
    //console.log(valueStr);  // test
}, 1000);

var apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
});

module.exports = apolloServer;
