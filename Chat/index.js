var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile("index.html", {"root": __dirname});
});


var usuariosOnline=[];

// Verifico na minha lista de usuários conectados se o nome de usuário é único
function contemUsuario(nomeUsuario)
{
	if(usuariosOnline.length>0)
	{
		for(i = 0; i < usuariosOnline.length;i++)
		{
			if(usuariosOnline[i] == nomeUsuario)
				return true;
		}
	}

	return false;
}

// Adiciona o nome do usuário e o seu socket na lista
function adicionarUsuario(nomeUsuario, socket)
{
	usuariosOnline[nomeUsuario] = socket;
}

// Envia a mensagem contendo todos os usuários online
function enviarUsuariosOnline()
{
	var nomesUsuarios = [];
	for(nome in usuariosOnline)
	{
		nomesUsuarios.push(nome);
	}
	var msgr = {tipo:"userStart", nomes:nomesUsuarios};
	var json = JSON.stringify(msgr);
	io.emit('chat message', json);
}

console.log("Servidor criado na porta 3000");


io.on('connection', function(socket){
	console.log("Cliente conectado: " + socket.id);
	var meuNome;
	enviarUsuariosOnline();
	// Recebendo mensagens do cliente
	// Cada socket 
	socket.on('chat message', function(msg){
		// Mensagem do cliente é recebida e convertida para array
		dataObj = JSON.parse(msg);

		if(dataObj['tipo'] == 'novo') // Novo usuario
		{	
			if(contemUsuario(dataObj['nome']) == false)
			{
				meuNome = dataObj['nome'];
				adicionarUsuario(meuNome, socket);
				var msgr = {tipo:"novo", user:meuNome};
			}
			else
			{
				var msgr={tipo:"erro1", msg:"Usuario jã existe"};
			}
		}
		else if(dataObj['tipo'] == 'all') //Mensagem no chat que é repassada para todos
		{
			var msgr = {tipo:"all", msg:dataObj['msg'], from: dataObj['user']};
		
		}
		else if(dataObj['tipo'] == 'dm') //Mensagem privada que é repassada ao destinatário
		{
			var msgr = {tipo:"dm", msg:dataObj['msg'], from: dataObj['user'], dest: dataObj['dest']};
		}

		// Mensagem é convertida para json e enviada para cliente
		var json = JSON.stringify(msgr);
		io.emit('chat message', json);
	});

	//Caso cliente disconectar enviar para todos os usuarios o nome do disconectado
	socket.on('disconnect', function(){
		if(usuariosOnline.length>0){
			for(i=0; i< usuariosOnline.length;i++){
				if(usuariosOnline[i]==meuNome){
					usuariosOnline.splice(i,1);
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

