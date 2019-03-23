// var builder = require('botbuilder');
// //var lib = new builder.Library('joke');
// var request = require('request');

// lib.dialogs('/', function(session,args){
//     var options={};
//     request({url: 'https://icanhazdadjoke.come/', headers: {Accept : 'text/plain'}}, (error,response,body)=>{
//         if(!error && response.statusCode ==200){
//             console.log(body);
//             var msg = new builder.Message(session)
//             .text(body)
//             .speak(body)
//             .inputHint(builder.inputHint.expectingInput);
//             session.endDialog(msg);
//         }
//     })
// });

// module.exports.createLibrary = function() {
//     return lib.clone();
// };