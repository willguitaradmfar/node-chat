  var fs = require('fs'),
    path = require('path'),
    sio = require('socket.io'),
    static = require('node-static');

  var app = require('http').createServer(handler);
  app.listen(process.env.PORT);

  var file = new static.Server(path.join(__dirname, '..', 'public'));

  var msgs = [];

  function handler(req, res) {
    file.serve(req, res);
  }

  var io = sio.listen(app),
    nicknames = {};

  io.sockets.on('connection', function (socket) {

    socket.on('user message', function (msg) {
      msgs.push({_nickname:socket.nickname, _msg:msg});
      socket.broadcast.emit('user message', socket.nickname, msg);	
    });

    socket.on('nickname', function (nick, fn) {
      if (nicknames[nick]) {

        fn(true);
      }
      else {

        fn(false);
        nicknames[nick] = socket.nickname = nick;
        socket.broadcast.emit('announcement', nick + ' connected');

	var isHistorico = false;
	for(var m in msgs){
		if(socket.nickname.toLocaleLowerCase() == msgs[m]._nickname.toLocaleLowerCase()){
			isHistorico = true;	
		}
	}
	for(var m in msgs){
		if(isHistorico){
			socket.emit('user message', (socket.nickname.toLocaleLowerCase() == msgs[m]._nickname.toLocaleLowerCase() ? 'me' : msgs[m]._nickname), msgs[m]._msg);
		}
	}

        io.sockets.emit('nicknames', nicknames);
      }
    });

    socket.on('disconnect', function () {

      if (!socket.nickname) {

        return;
      }

      delete nicknames[socket.nickname];
      socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
      socket.broadcast.emit('nicknames', nicknames);
    });
  });
