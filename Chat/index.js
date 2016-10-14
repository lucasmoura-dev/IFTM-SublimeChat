var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile("index.html", {"root": __dirname});
});


var usuariosOnline=[];
var socketUsuariosOnline = [];



/* Nesse método, o servidor cria uma instância para cada usuário(socket) conectado, uma thread que ficará 
   funcionando enquanto o usuário estiver conectado. Em cada instância, a variável meuNome terá valores 
   diferente para cada usuário conectado.
*/
io.on('connection', function(socket){
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

	// Caso cliente desconectar, informa para todos os usuários que ele foi desconectado
	socket.on('disconnect', function(){
		desconectarUsuario(meuNome);
	});
});

http.listen(3000, function(){
  console.log("Servidor criado na porta 3000");
});


// Verifico na minha lista de usuários conectados se o nome já está sendo usado
function contemUsuario(nomeUsuario)
{
	if(contemUsuariosOnline())
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
	console.log("Novo usuário: " + nomeUsuario + "["+socket.id+"]");
	usuariosOnline.push(nomeUsuario);
	socketUsuariosOnline.push(socket.id);
}

// Envia uma mensagem contendo todos os usuários online
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

// Verifica se contém no mínimo um usuário conectado na minha lista
function contemUsuariosOnline()
{
	return usuariosOnline.length > 0;
}

// Remove o usuário das listas(nomes e sockets) e informa para os outros usuários que o usuario foi desconectado
function desconectarUsuario(nomeUsuario)
{
	var indiceUsuario = usuariosOnline.indexOf(nomeUsuario);
	if(indiceUsuario != -1) // Usuário está na lista
	{
		console.log("Usuário desconectado: " + nomeUsuario + "["+socketUsuariosOnline[indiceUsuario]+"]");
		usuariosOnline.splice(indiceUsuario, 1); // Remove da lista de usuários
		socketUsuariosOnline.splice(indiceUsuario, 1); // Remove da lista de sockets
		if(contemUsuariosOnline())
		{
			var msgr={tipo:"offline", user:nomeUsuario};
			var json=JSON.stringify(msgr);
			io.emit('chat message', json);
		}
	}
	else
	{
		console.log("O usuário " + nomeUsuario + " não foi encontrado na lista usuariosOnline no método desconectarUsuario");
	}
}