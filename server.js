#!/usr/bin/env node
const WebSocketServer = require('websocket').server;
const http = require('http');
const iohook = require("iohook")

var server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, "127.0.0.1", 0, function () {
    console.log("the server is listening")
})

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log('Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept('echo-protocol', request.origin);

    iohook.on("keyup", function (key) {
        if (key.ctrlKey == true && key.keycode == 32) {
            connection.sendUTF("TOGGLE_MIC");
            console.log(`${new Date()} | Toggled the mic`)
        }
        else if (key.ctrlKey && key.keycode == 18) {
            connection.sendUTF("TOGGLE_CAM")
            console.log(`${new Date()} | Toggled the camera`)
        }
    })

    console.log((new Date()) + ' | Connection accepted.');

    connection.on('message', function (message) {
        if (message.utf8Data == "ping")
            return;

        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            // connection.sendUTF(message.utf8Data);

        }
    });

    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });

});

iohook.start(false);
