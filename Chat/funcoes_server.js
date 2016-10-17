var exports = module.exports = {};

// Verifica se o nome do usuário é válido
exports.nomeEValido = function(nome, tamanhoMaxNome) 
{
	if(nome.length > 0 && nome.length <= tamanhoMaxNome)
		return true;
	else
		return false;
};

// Envia a mensagem de erro pro socket específico, pois ele ainda não tem um nome nome definido
exports.enviarMensagemErro = function(socket, msg)
{
	var json = JSON.stringify(msg);
	//socket.emit('chat message', json);
	socket.emit('erro', json);
};


exports.enviarMensagemPrivada = function(nomeDestinario, msg, usuariosOnline)
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
};

exports.enviarMensagemGlobal = function(msg, io)
{
	var json = JSON.stringify(msg);
	io.emit('chat message', json);
};

// Verifico na minha lista de usuários conectados se o nome já está sendo usado
exports.contemUsuario = function(nomeUsuario, usuariosOnline)
{
	if(exports.contemUsuariosOnline(usuariosOnline))
	{
		return nomeUsuario in usuariosOnline;
	}

	return false;
};

// Adiciona o nome do usuário e o seu socket na lista
exports.adicionarUsuario = function(nomeUsuario, socket, usuariosOnline)
{
	console.log("Novo usuário: " + nomeUsuario + "["+socket.id+"]");
	usuariosOnline[nomeUsuario] = socket;
};

// Envia uma mensagem contendo todos os usuários online
exports.enviarUsuariosOnline = function(usuariosOnline, io)
{
	var nomesUsuarios = [];
	for(nome in usuariosOnline)
	{
		nomesUsuarios.push(nome);
	}
	var msgr = {tipo:"userStart", nomes:nomesUsuarios};
	exports.enviarMensagemGlobal(msgr, io);
};

// Verifica se contém no mínimo um usuário conectado na minha lista
exports.contemUsuariosOnline = function(usuariosOnline)
{
	return Object.keys(usuariosOnline).length > 0;
};

// Remove o usuário das listas(nomes e sockets) e informa para os outros usuários que o usuario foi desconectado
exports.desconectarUsuario = function(nomeUsuario, usuariosOnline, io)
{
	if(nomeUsuario in usuariosOnline)
	{
		console.log("Usuário desconectado: " + nomeUsuario + "["+usuariosOnline[nomeUsuario].id+"]");
		delete usuariosOnline[nomeUsuario];
		if(exports.contemUsuariosOnline(usuariosOnline))
		{
			var msgr={tipo:"offline", user:nomeUsuario};
			exports.enviarMensagemGlobal(msgr, io);
		}
	}
};
