var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// Necessário para carregar os arquivos externos do .html (js, imagens, css)
var express = require('express');
app.use(express.static(__dirname + '/Cliente')); 

app.get('/', function(req, res){
	res.sendFile("./Cliente/index.html", {"root": __dirname});
});


var usuariosOnline = {};


/* Nessa função, o servidor cria uma instância para cada usuário(socket) conectado, uma thread que ficará 
   funcionando enquanto o usuário estiver conectado. Em cada instância, a variável meuNome terá valores 
   diferente para cada usuário conectado.
*/
io.on('connection', function(socket){
	var meuNome;
	enviarUsuariosOnline();
	

	// Toda vez que o socket receber uma mensagem, a função é chamada
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
				console.log("O nome de usuário " + dataObj['nome'] + " já existe.");
				var msgr={tipo:"erro1", msg:"Usuario jã existe"};
			}

		    enviarMensagemGlobal(msgr);
		}
		else if(dataObj['tipo'] == 'all') // Mensagem no chat que é repassada para todos
		{
			var msgr = {tipo:"all", msg:dataObj['msg'], from: dataObj['user']};
			enviarMensagemGlobal(msgr);
		}
		else if(dataObj['tipo'] == 'dm') //Mensagem privada que é repassada ao destinatário
		{
			var msgr = {tipo:"dm", msg:dataObj['msg'], from: dataObj['user'], dest: dataObj['dest']};
			enviarMensagemPrivada(dataObj['dest'], msgr);
		}
	});

	// Caso cliente desconectar, informa para todos os usuários que ele foi desconectado
	socket.on('disconnect', function(){
		desconectarUsuario(meuNome);
	});
});

http.listen(3000, function(){
  console.log("Servidor criado na porta 3000");
});

function enviarMensagemPrivada(nomeDestinario, msg)
{
	if(nomeDestinario in usuariosOnline)
	{
		var json = JSON.stringify(msg);
		usuariosOnline[nomeDestinario].emit('chat message', json);
	}
	else
	{
		console.log("Não foi possível enviar uma mensagem privada para o usuário " + nomeDestinario);
	}
}

function enviarMensagemGlobal(msg)
{
	var json = JSON.stringify(msg);
	io.emit('chat message', json);
}

// Verifico na minha lista de usuários conectados se o nome já está sendo usado
function contemUsuario(nomeUsuario)
{
	if(contemUsuariosOnline())
	{
		return nomeUsuario in usuariosOnline;
	}

	return false;
}

// Adiciona o nome do usuário e o seu socket na lista
function adicionarUsuario(nomeUsuario, socket)
{
	console.log("Novo usuário: " + nomeUsuario + "["+socket.id+"]");
	usuariosOnline[nomeUsuario] = socket;
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
	enviarMensagemGlobal(msgr);
}

// Verifica se contém no mínimo um usuário conectado na minha lista
function contemUsuariosOnline()
{
	return Object.keys(usuariosOnline).length > 0;
}

function getQtdUsuariosOnline()
{
	return Object.keys(usuariosOnline).length;
}

// Remove o usuário das listas(nomes e sockets) e informa para os outros usuários que o usuario foi desconectado
function desconectarUsuario(nomeUsuario)
{
	if(nomeUsuario in usuariosOnline)
	{
		console.log("Usuário desconectado: " + nomeUsuario + "["+usuariosOnline[nomeUsuario].id+"]");
		delete usuariosOnline[nomeUsuario];
		if(contemUsuariosOnline())
		{
			var msgr={tipo:"offline", user:nomeUsuario};
			enviarMensagemGlobal(msgr);
		}
	}
	else
	{
		console.log("O usuário " + nomeUsuario + " não foi encontrado na lista usuariosOnline na função desconectarUsuario.");
	}
}