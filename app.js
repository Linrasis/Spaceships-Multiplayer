// Rylan Dmello 27 May 2016

var app = require('http').createServer(handler);
var io = require('socket.io')(app); 
var fs = require('fs'); 
var files = ['/index.html', '/index.js', '/index.css']; 

app.listen(3100); 

function handler (req, res) {
    var position = (req.url === '/') ? 0 : files.indexOf(req.url); 
    if (position > -1) {
        fs.readFile(__dirname + files[position], function (err, data){
            if (err) {
                res.writeHead(500); 
                res.end('Error loading index.html'); 
            } else { 
                console.log('Requesting: ' + req.url); 
                res.writeHead(200); 
                res.end(data); 
            };
        }); 
    } else {
        res.writeHead(404); 
        res.end('Error file not found'); 
    }; 
}

io.on('connection', function (socket) {
    var my_data = new_user(); 

    console.log('Connection Opened'); 
    socket.emit('setup', my_data); 
   
    socket.on('mousePosition', function (data) {
        update_user(data);
    }); 
}); 

var game_context = (function(){
    var game_data = {}; 
    game_data.map_width = 3000; 
    game_data.map_height = 2000; 
    game_data.num_users = 0; 
    game_data.user_data = []; 
    return game_data; 
})(); 

var new_user = function () {
    var my_data = {}; 
    my_data.id = game_context.user_data.length; 
    my_data.x = game_context.map_width*Math.random(); 
    my_data.y = game_context.map_height*Math.random(); 
    my_data.mouseX = my_data.x;
    my_data.mouseY = my_data.y;
    game_context.num_users += 1; 
    game_context.user_data.push(my_data); 
    return my_data; 
};

var update_user = function (data) {
    var my_data = game_context.user_data[data.id]; 
    my_data.mouseX = data.mouseX;
    my_data.mouseY = data.mouseY; 
}; 

var recalculate = function () {
    for (var i = 0; i < game_context.num_users; i++) {
        var my_data = game_context.user_data[i]; 
        my_data.x += (my_data.mouseX - my_data.x)/20; 
        my_data.y += (my_data.mouseY - my_data.y)/20; 
    }
    io.emit('drawNow', game_context.user_data); 
    // console.log(game_context.user_data); 
    setTimeout(recalculate, 30); 
}

setTimeout(recalculate, 30); 

