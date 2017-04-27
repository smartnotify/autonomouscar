/*  variables */

var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});
   
 
var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
var serialport = require('serialport');
var nmea = require('nmea');

// we want mraa to be at least version 0.6.1
var mraa = require('mraa');
var version = mraa.getVersion(); 
if (version >= 'v0.6.1') {
    console.log('mraa version (' + version + ') ok');
}
else {
    console.log('mraa version(' + version + ') is old - this code may not work');
}
 var groveSensor = require('jsupm_grove');
var relay = new groveSensor.GroveRelay(6);
relay.off();

board.on("ready", function() {
    
     var groveSensor = require('jsupm_grove');
 
    
    app.get('/', function(req, res){
        res.sendFile(__dirname +'/index.html');
        //res.send('');
    });

    app.use(express.static(__dirname + '/public'));

    io.on('connection', function(socket){
        try{
        //console.log('a user connected at: ' + Date.now());
        socket.on ("HeadingRequest", function(msg){
            CervoMove(msg);
        });
            
        socket.on('SmartRequest', function(msg){
            console.log (msg);
            switch(msg){
                case "w":
                    goBurst();
                    break;
                case "s":
                    stopBurst();
                    break;
                case "c":
                    CenterWheels();
                    break;
            }
        });

        io.emit('message', "0");
        socket.on('disconnect', function(){
         //console.log('user disconnected');
      });
        }
        catch (errSocket) {
         console.log("Socket error: " + errSocket.message);   
        }
    });

    http.listen(3000, function(){
      console.log('listening on *:3000');

    });
var servo;
    try{
    servo = new five.Servo({
        id: "FrontServo",     // User defined id
        pin: 9,           // Which pin is it attached to?
        type: "standard",  // Default: "standard". Use "continuous" for continuous rotation servos
        range: [30,120],    // Default: 0-180
        fps: 50,          // Used to calculate rate of movement between positions
        invert: false,     // Invert all specified positions
        startAt: 90,       // Immediately move to a degree
        center: true,      // overrides startAt if true and moves the servo to the center of the range
      });
    }  
    catch (e){ 
        console.log ("Problem setting up the servo");
        
    }
    function CenterWheels() {
        servo.center();
        io.emit('message', "Wheels are centered");
    }
    function CervoMove (degrees) {   
        servo.to( degrees );
        io.emit('message', "Ready to head to: " + degrees);
    }
    function stopBurst(){
  
        relay.off();
        console.log ("relay is off");
        io.emit('message', "The car is stopped");
    }

    function goBurst(){
         relay.on();
        console.log ("relay is on");
        io.emit('message', "The car is moving");
    }

    function forwardBurst (){
        relay.on();
        setTimeout(function(){ relay.off();  }, 1000);

    }

});
  