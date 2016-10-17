// Cria uma aba para o nome clickado
function criarAba(nome, ultimoTabId)
{
	$(".tabs li").attr("class",""); 
  	$(".tabs ul").append('<li name="tab'+ultimoTabId+'" class="active" id="tabChat"><span class = "contTab">'+nome+tipoArquivo+'<span class="fecha"/></span></li>');
  	//$(".content").append('<div><ul id="txt'+nome+'" class="tab'+ultimoTabId+'" style="list-style-type: none; margin: 0; padding: 0;"></ul></div>')
  	$(".content").append('<div class="tab'+ultimoTabId+'"><ul id="txt'+nome+'" style="list-style-type: none; margin: 0; padding: 0;"></ul><textarea onkeyup="auto_grow(this)" class="msgEntrada" id="entrada'+nome+'"></textarea></div>')
	    $(".content").find("[class^='tab']").hide(); 
    $('.tab'+ultimoTabId).fadeIn();
    abaSelecionada = nome;
    aplicarFuncao(nome);
}

// Seleciono a aba
function selecionarAba(nome)
{
	$(".content").find("[class^='tab']").hide(); 
	$(".tabs li").attr("class",""); 
	$(".tabs ul").find("li:contains('"+nome+tipoArquivo+"')").attr("class","active");
	$('.' + $(".tabs ul").find("li:contains("+nome+")").attr('name')).fadeIn();
	abaSelecionada = nome;
}

/* No javascript tudo que é criado dinamicamente não herda os eventos que já havia definido antes de eles existirem
   Essa função define um evento para cada aba criada */
function aplicarFuncao(nomeElemento)
{
	$("#entrada"+nomeElemento).keyup(function(e)
	{
		if((e.keyCode || e.which) == 13) 
	    { 
	      if(jaLogou)
	      {
	        // Envia a mensagem
	        enviarMensagem();
	        // Informa que já parou de digitar
	        timeoutFunction(abaSelecionada);
	      }
	      else
	         logar();
	    }
	});

	// Evento que detecta quando o usuário está digitando (não está apertando ENTER)
	$("#entrada"+nomeElemento).keyup(function(e){
	  if((e.keyCode || e.which) !== 13) 
	  {
	    if(jaLogou == true)
	    {
	      if(typing === false && $("#entrada"+nomeElemento).is(":focus"))
	      {
	        typing = true;
	        enviarEstaDigitando(true, abaSelecionada);
	        // Se ele apertar só uma tecla, deve sumir também
        	timeout = setTimeout(timeoutFunction.bind(null, abaSelecionada), 500);
	      }
	      else 
	      {
	        // Reseta o tempo que já foi iniciado
	        clearTimeout(timeout);
	        // Cria o timer que chamará a função quando acabar o tempo
	        timeout = setTimeout(timeoutFunction.bind(null, abaSelecionada), 500);
	      }
	    }
	  
	  }
	});
}

// Verifica se a string da cor representa uma cor válida no CSS
function eUmaCorValida(corString)
{
	if(corString == "") return false;
	if(corString == "inherit") return false;
	if(corString == "transparent") return false;

	var image = document.createElement("img");
    image.style.color = "rgb(0, 0, 0)";
    image.style.color = corString;
    if (image.style.color !== "rgb(0, 0, 0)") { return true; }
    image.style.color = "rgb(255, 255, 255)";
    image.style.color = corString;
    return image.style.color !== "rgb(255, 255, 255)";
}

// Envia uma mensagem para o servidor(privada ou global)
function enviarMensagem()
{
	// Mensagem chat
	var txt = urlify($('#entrada' + abaSelecionada).val());
	var mensagem;

	// Recebe um comando para alterar a cor
	if(txt.startsWith("/cor ") == true)
	{
		txt = txt.replace("/cor ", ""); // Remove a tag do comando da mensagem
		if(eUmaCorValida(txt) == true)
			corDefinida = txt; // Define a cor para as próximas mensagens
		$('#entrada' + abaSelecionada).val('');
		return;
	}
	else if(abaSelecionada == "index") // Enviar mensagem global
	{
		mensagem = {tipo:"all", msg: txt, user: username, cor: corDefinida};
		console.log("enviando msg na cor " + mensagem.cor);
	}
	else // Enviar mensagem privada
	{
		// Imprimo a mensagem privada local com o nome do usuário
		var msg = "<li><span style='color:"+corDefinida+"'>&lt"+username+"&gt</span> "+txt+"<span style='color:"+corDefinida+"'>&lt/"+username+"&gt</span></li>";
		$('#txt'+abaSelecionada).append(msg);

		// Crio a mensagem a ser enviada
		mensagem = {tipo:"dm", msg:txt, user: username, dest: abaSelecionada, cor: corDefinida};
	}
	// Crio o json com a mensagem
	var json = JSON.stringify(mensagem);
	// Envio o JSON para o servidor
	socket.emit('chat message', json);
	// Limpo a caixa de texto que o usuário enviou a mensagem
	$('#entrada' + abaSelecionada).val('');
}

/* Procura no conteúdo da mensagem por links utilizando expressão regular. Se encontrar, 
   substitui por uma ancora com o link informado */
function urlify(text) {
	var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
	return text.replace(urlRegex, function(url,b,c) {
		var url2 = (c == 'www.') ?  'http://' +url : url;
		return '<a href="' +url2+ '" target="_blank">' + url + '</a>';
	})
}

function jaExisteAba(nome)
{
	return $(".tabs li:contains('"+ nome + tipoArquivo + "')").text() != "";
}

// Imprime uma mensagem privada na aba específica. Caso a aba não foi criada, ele criará, se já existir, selecionará ela.
function imprimirMensagemPrivada(msg, remetente, cor)
{
	//var tag = "tagNomeVerde";
	var msg = "<li><span style='color:"+cor+"'>&lt"+remetente+"&gt</span> "+msg+"<span style='color:"+cor+"'>&lt/"+remetente+"&gt</span></li>";
	var aba;
	if(jaExisteAba(remetente)) // Se a aba com o usuário já existir
  	{
  		selecionarAba(remetente);
  	}
  	else
  	{
  		// Não permite abrir a aba de mensagem privada pro próprio usuário. Também é obrigatório estar logado
  		if(jaLogou == false)
  			return;

      	ultimoTabId++;
      	criarAba(remetente, ultimoTabId);
  	}   

	$('#txt' + remetente).append(msg);
}

// Imprime uma mensagem global no chat principal (index)
function imprimirMensagemGlobal(msg, remetente, cor)
{
	var msg = "<li><span style='color:"+cor+"'>&lt"+remetente+"&gt</span> "+msg+"<span style='color:"+cor+"'>&lt/"+remetente+"&gt</span></li>";
	$('#txtindex').append(msg);
}

// Imprime uma mensagem de status no chat principal
function imprimirMensagemStatus(msg)
{
	$('#txtindex').append("<li><span class='comentario'>&lt!-- " + msg + " !--&gt</span></li>");
}

// Remove o usuário da lista de usuários online e atualiza no site
function removerUsuarioDaLista(nome)
{
	if(online.length > 0)
	{
		for(i=0; i < online.length; i++)
		{
			if(online[i] == nome){
				online.splice(i,1);
				atualizarUsuariosOnline();
				return;
			}
		}
	}
}


/* Entra no chat com o nickname informado e envia para o servidor o nickname. A variável jaLogou é mudada para true, 
   podendo ser mudada caso o servidor retorne com uma mensagem de erro para o nickname informado.   */
function logar()
{
	// Remove as quebras de linhas do nickname
	username = $(".msgEntrada").val().replace(/\r?\n|\r/g, "");
	// Substitue espaço por '_' e remover caracteres especiais
	username = username.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '_');
	// Cria a mensagem com o nickname e envia para o servidor
    mensagem = {tipo:"novo", nome:username};
    var json = JSON.stringify(mensagem);
	socket.emit('chat message', json);
	// Limpa o campo de texto
    $("#entradaindex").val("");
    // Remove o placeholder do txtArea (placeholder é a mensagem que aparece dentro do textarea quando não tem nada escrito)
    $("#entradaindex").removeAttr('placeholder');
    jaLogou = true;
}

// Atualiza a lista de usuarios online na tela
function atualizarUsuariosOnline()
{
	var conteudoPadrao = '<b style="color: #828282;">FOLDERS</b><br><div style="margin-top: 5px;"><span class="seta-baixo"></span><img src="./images/pastaAberta.png"/> usuarios</div>'
	$(".listaUsuariosOn").html(conteudoPadrao); // Limpa com o conteúdo padrão antes de adicionar
	for(i=0; i < online.length; i++)
	{
		var novoDivUsuario = '<div class="usuariosOn"><span class="seta-direita"></span><img src="./images/pasta.png"/>' + online[i] + '</div>';
		$(".listaUsuariosOn").append(novoDivUsuario);
	}
}

// Função para expandir a TextArea verticalmente de acordo com o necessário
function auto_grow(element)
{
	element.style.height = "5px";
	element.style.height = (element.scrollHeight+20)+"px";
}

// Função para o sistema 'está digitando'. Ela é chamada quando o timer acaba
function timeoutFunction(aba)
{
	typing = false;
	// Envia uma mensagem informando que o usuário parou de digitar
	enviarEstaDigitando(false, aba);
}

// Envia uma mensagem para o servidor informando que o usuário está digitando ou paraou de digitar
function enviarEstaDigitando(estado, destino)
{
	// Crio a mensagem no formato Object
	mensagem = {estaDigitando: estado, usuario: username, destino: destino};
	// Crio o json com a mensagem
	var json = JSON.stringify(mensagem);
	// Envio o JSON para o servidor
	socket.emit('typing', json);
}

// Atualiza os usuários que estão digitando uma mensagem
function atualizarUsuariosDigitando()
{
	var msg = "";
	if(usuariosDigitando.global.length == 0)
	{
		criarMensagemUsuariosDigitando("");
		return;
	}

	// 1 pessoa: Lucas está digitando...
	// 2 pessoas: Lucas e Maria estão digitando...
	// 3+ pessoas: Lucas, Maria e Carla estão digitando...

	if(usuariosDigitando.global.length == 1)
	{
		if(usuariosDigitando.global[0] != username) // Não exibe que o próprio usuário está digitando
			msg = usuariosDigitando.global[0] + " está digitando...";
	}
	else
	{
		for(var i=0; i < usuariosDigitando.global.length; i++)
		{
			if(usuariosDigitando.global[i] != username) // Não exibe que o próprio usuário está digitando
			{
				if(i > 0)
					if(i == usuariosDigitando.global.length-1) // Último
						msg = msg + " e ";
					else
						msg = msg + ", ";
				
				msg = msg + usuariosDigitando.global[i];
			}
		}
		msg = msg + " estão digitando...";
	}
	criarMensagemUsuariosDigitando(msg);
}

// Atualiza a barraFixa com a mensagem que informa os usuários que estão digitando. Se não tiver nenhum, digita um mensagem padrão
function criarMensagemUsuariosDigitando(msg)
{
	if(msg == "")
		msg = " Line 100, Column 20 ";
	$("#barraFixa").html(msg);
}

// Remove do vetor o usuário que parou de digitar
function removerUsuarioListaDigitando(nome)
{
	for(var i=0; i < usuariosDigitando.global.length; i++)
	{
		if(usuariosDigitando.global[i] == nome)
		{
			// Remove o usuário da lista
			usuariosDigitando.global.splice(i, 1);
		}
	}
}