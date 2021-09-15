var request = require('request');
var account = require('./account');
var apollo = require('./apollo');
var posts = require('./posts');

(async () => {
    var acc = await account();
    var fdata = {
        id: acc.id,
        pw: acc.pw,
        ip: '192.168.0.54:5000',  // autoinven.com
        jar: request.jar()
    }
    posts.login(fdata, () => {
        var apolloServer = apollo(fdata);
        apolloServer.listen({port: 3000}).then(({url}) => {
            console.log(`Listening at ${url}\n`);
        });
    });
})();
