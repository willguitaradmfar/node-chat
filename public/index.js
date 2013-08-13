  //
  // socket.io code
  //
  var socket = io.connect();

  var nickname = '';
  var newMsg = false;
  socket.on('connect', function () {
    $('#chat').addClass('connected');
  });

  socket.on('announcement', function (msg) {
    $('#lines').append($('<p>').append($('<em>').text(msg)));
  });

  socket.on('nicknames', function (nicknames) {
    $('#nicknames').empty().append($('<span>Online: </span>'));
    for (var i in nicknames) {
      $('#nicknames').append($('<b>').text(nicknames[i]));
    }
  });

  socket.on('user message', message);
  socket.on('reconnect', function () {
    $('#lines').remove();
    message('System', 'Reconnected to the server');
  });

  socket.on('reconnecting', function () {
    message('System', 'Attempting to re-connect to the server');
  });

  socket.on('error', function (e) {
    message('System', e ? e : 'A unknown error occurred');
  });

  function message (from, msg, time) {
    if(nickname && nickname != ''){
	    if(from.toLocaleLowerCase() != 'me' && from.toLocaleLowerCase() != nickname.toLocaleLowerCase()){
		newMsg = true;
	      $('#lines').append($('<p style="font-weight: bold;font-style: italic;background-color: #E7EBD1;">').append($('<b>').text(from), filterSmile(msg), $('<br/>'), $('<i style="text-align:right;">').text(new Date(time).toString().replace(/(.*)(\d\d:\d\d:\d\d).*/, '$2'))));
	    }else{
		newMsg = false;
	      $('#lines').append($('<p style="font-style: italic;text-align: right;">').append($('<b>').text(from), filterSmile(msg), $('<br/>'), $('<i style="text-align:right;">').text(new Date(time).toString().replace(/(.*)(\d\d:\d\d:\d\d).*/, '$2'))));
	    }
    }
      $('#lines').get(0).scrollTop = 10000000;
  }

setInterval(function(){
	if(newMsg){
		$('#titulo').html('mensag.....');
		$('#lines').get(0).scrollTop = 10000000;
	}else{
		$('#titulo').html('CHAT');
	}

}, 1000 * 2);
  //
  // dom manipulation code
  //
  $(function () {

    $('#set-nickname').submit(function (ev) {

      socket.emit('nickname', $('#nick').val()+"|"+$('#nickpasswd').val(), function (set) {
        if (!set) {
          clear();
	  nickname = $('#nick').val();
          return $('#chat').addClass('nickname-set');
        }
        $('#nickname-err').css('visibility', 'visible');
      });
      return false;
    });

    $('#send-message').submit(function () {
      message('me', $('#message').val(), new Date().getTime());
      socket.emit('user message', $('#message').val());
      clear();
      $('#lines').get(0).scrollTop = 10000000;
      return false;
    });

    function clear () {
      $('#message').val('').focus();
    };
  });


var filterSmile = function(cmd){
	if(cmd[0] == "$"){
		if(cmd[1] == "$"){
			return '<img border="0" src="'+cmd.replace(/\$(.*)/, '$1')+'" width="70"/>';
		}
		return '<img border="0" src="smiles/smile'+cmd.replace(/\$(.*)/, '$1')+'.gif" width="100"/>';	
	}else{
		return cmd;
	}
}


