// Recebe uma mensagem de erro do servidor
socket.on('erro', function(msg)
{
	// Recebe json e converte
	var dataObj = JSON.parse(msg);

	if(dataObj['tipo'] == 'erro1')
	{
		jaLogou = false;
		$('.msgEntrada').attr('placeholder', "Nick " + username + " em uso. Digite outro.");
	}
	else if(dataObj['tipo'] == 'erro2')
	{
		jaLogou = false;
		$('.msgEntrada').attr('placeholder', dataObj['msg']);
	}
});


// Recebe um tipo de mensagem do chat do servidor
socket.on('chat message', function(msg)
{
	// Recebe json e converte
	var dataObj = JSON.parse(msg);

	// Entrando no chat
	if(dataObj['tipo'] == 'userStart' && chatInicializado == false)
	{

		for(i=0;i<dataObj['nomes'].length;i++)
		{
			online.push(dataObj['nomes'][i]);
		}

		chatInicializado = true;
		atualizarUsuariosOnline();

	}
	// Novo usuário no chat
	else if(dataObj['tipo'] == 'novo')
	{
		// Adiciona na lista
		var novoDivUsuario = '<div class="usuariosOn"><span class="seta-direita"></span><img src="./images/pasta.png"/>' + dataObj['user'] + '</div>';
		$(".listaUsuariosOn").append(novoDivUsuario);

		if(dataObj['user'] == username)
			imprimirMensagemStatus("Você entrou no chat");
		else
			imprimirMensagemStatus(dataObj['user'] + " entrou no chat.");
		
		online.push(dataObj['user']);
	}
	// Mensagem geral
	else if(dataObj['tipo'] == 'all')
	{
		imprimirMensagemGlobal(dataObj['msg'], dataObj['from'], dataObj['cor']);
	}
	else if(dataObj['tipo'] == 'dm')
	{
		imprimirMensagemPrivada(dataObj['msg'], dataObj['from'], dataObj['cor']);
	}
	// Usuario offline
	else if(dataObj['tipo'] == 'offline')
	{
		removerUsuarioDaLista(dataObj['user']);
		imprimirMensagemStatus(dataObj['user'] + " saiu do chat.");
	}
});

// Recebe as mensagens informando quem está digitando ou quem parou de digitar e encaminha para todos que estão conectados no chat
socket.on('typing', function(msg)
{
	dataObj = JSON.parse(msg);
	if(dataObj['destino'] != "index" && jaExisteAba(dataObj['destino']) == true) // Só irá imprimir "está digitando" se a aba já foi criada
		return;

	if(dataObj['estaDigitando'])
	{
		usuariosDigitando.global.push(dataObj['usuario']);
	}
	else
	{
		removerUsuarioListaDigitando(dataObj['usuario']);
	}

	atualizarUsuariosDigitando();
});