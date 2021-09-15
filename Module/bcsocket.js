/*const net = require('net');
function getConnection(connName){
      var client = net.connect({port:7777,host:'localhost'},function(){
        console.log(connName+"Connected: ");
        this.setTimeout(500);
        this.setEncoding('utf8');
      })
      client.write("WEBSERVER");
      return client;
}
var client = getConnection("WEB_SERVER");

module.exports = {
    socket : client
}
*/
// autoinven 실서비스에서는 블록체인 기능을 뺏음. 사용하지않으므로 주석처리하였음.