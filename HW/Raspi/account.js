var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var input = question => {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
};

module.exports = async () => {
    var id = await input('ID: ');
    var pw = await input('PW: ');
    console.clear();
    rl.close();
    return {id, pw};
}
