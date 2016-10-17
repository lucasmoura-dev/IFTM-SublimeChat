var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// Necessário para carregar os arquivos externos do .html (js, imagens, css)
var express = require('express');
app.use(express.static(__dirname + '/Cliente')); 

app.get('/', function(req, res){
	res.sendFile("./Cliente/index.html", {"root": __dirname});
});

var funcoes = require('./funcoes_server.js');

var usuariosOnline = {};
var tamanhoMaxNome = 12;

/* Nessa função, o servidor cria uma instância para cada usuário(socket) conectado, uma thread que ficará 
   funcionando enquanto o usuário estiver conectado. Em cada instância, a variável meuNome terá valores 
   diferente para cada usuário conectado.
*/
io.on('connection', function(socket){
	var meuNome;
	funcoes.enviarUsuariosOnline(usuariosOnline, io);


	// Toda vez que o socket receber uma mensagem, a função é chamada
	socket.on('chat message', function(msg){

		// Mensagem do cliente é recebida e convertida para array
		dataObj = JSON.parse(msg);

		if(dataObj['tipo'] == 'novo') // Novo usuario
		{	
			if(funcoes.contemUsuario(dataObj['nome'], usuariosOnline) == false)
			{	
				if(funcoes.nomeEValido(dataObj['nome'], tamanhoMaxNome))
				{
					meuNome = dataObj['nome'];
					funcoes.adicionarUsuario(meuNome, socket, usuariosOnline);	
					var msgr = {tipo:"novo", user:meuNome};
					funcoes.enviarMensagemGlobal(msgr, io);
									}
				else
				{
					var msgr={tipo:"erro2", msg:"O nickname deve conter no máximo " + tamanhoMaxNome + " e no mínimo 1 caracteres."};
					funcoes.enviarMensagemErro(socket, msgr);
				}
			}
			else
			{
				console.log("O nome de usuário " + dataObj['nome'] + " já existe.");
				var msgr={tipo:"erro1", msg:"Usuario já existe"};
				funcoes.enviarMensagemErro(socket, msgr);
			}
		}
		else if(dataObj['tipo'] == 'all') // Mensagem no chat que é repassada para todos
		{
			var msgr = {tipo:"all", msg:dataObj['msg'], from: dataObj['user'], cor: dataObj['cor']};
			funcoes.enviarMensagemGlobal(msgr, io);
		}
		else if(dataObj['tipo'] == 'dm') // Mensagem privada que é repassada ao destinatário
		{
			var msgr = {tipo:"dm", msg:dataObj['msg'], from: dataObj['user'], dest: dataObj['dest'], cor: dataObj['cor']};
			funcoes.enviarMensagemPrivada(dataObj['dest'], msgr, usuariosOnline);
		}
	});

	// Informa se o usuário está digitando ou parou de digitar
	socket.on('typing', function(msg) 
	{  
		dataObj = JSON.parse(msg);
		if(dataObj['destino'] == "index") // Envia para todos que o usuário está digitando
			io.emit('typing', msg);	
		else
		{
			usuariosOnline[dataObj['destino']].emit('typing', msg);	// Envia somente para o outro usuário que está digitando
		}
	});

	// Caso cliente desconectar, informa para todos os usuários que ele foi desconectado
	socket.on('disconnect', function(){
		funcoes.desconectarUsuario(meuNome, usuariosOnline, io);
	});

	socket.on("cmd", function(msg)
	{
		dataObj = JSON.parse(msg);
		console.log("comando : " + dataObj['tipo'] + " ; valor: " + dataObj['valor']);
	});
});

http.listen(3000, function(){
  console.log("Servidor criado na porta 3000");
});

