var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile("index.html", {"root": __dirname});
});

var online=[];
io.on('connection', function(socket){
	var meuNome;
	//Ao conectar usuario recebe todos os usuarios onlin
	var msgr={tipo:"userStart", nomes:online};
	var json=JSON.stringify(msgr);
	io.emit('chat message', json);
	console.log('listening on *:3000');
	//Recebendo mensagens do cliente
	socket.on('chat message', function(msg){
		//Mensagem do cliente é recebida e convertida para array
		dataObj = JSON.parse(msg);
		//Novo usuario
		if(dataObj['tipo']=='novo'){
			var flag=0;
			if(online.length>0){
				for(i = 0; i< online.length;i++){
					if(online[i]==dataObj['nome']){
						var flag=1
						break;
					}
				}
			}
			//Caso usuario não exista ele entra no chat
			if(flag==0){
				meuNome=dataObj['nome'];
				online.push(dataObj['nome'])
				var msgr={tipo:"novo", user:dataObj['nome']};
			//Senão retorna erro
			}else{
				var msgr={tipo:"erro1", msg:"Usuario jã existe"};
			}
		//Mensagem no chat que é repassada para todos
		}else if(dataObj['tipo']=='all'){
			var msgr={tipo:"all", msg:dataObj['msg'], from: dataObj['user']};
		//Mensagem privata que é repassada ao destinatário
		}else if(dataObj['tipo']=='dm'){
			var msgr={tipo:"dm", msg:dataObj['msg'], from: dataObj['user'], dest: dataObj['dest']};
		}
		//Mensagem é convertida para json e enviada para cliente
		var json=JSON.stringify(msgr);
		io.emit('chat message', json);
	});
	//Caso cliente disconectar enviar para todos os usuarios o nome do disconectado
	socket.on('disconnect', function(){
		if(online.length>0){
			for(i=0; i<online.length;i++){
				if(online[i]==meuNome){
					online.splice(i,1);
					var msgr={tipo:"offline", user:meuNome};
					var json=JSON.stringify(msgr);
					io.emit('chat message', json);
					break;
				}
			}
		}
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});


