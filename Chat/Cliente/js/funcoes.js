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
		// Pressionou ENTER
	    if((e.keyCode || e.which) == 13) 
	    { 
	      if(jaLogou)
	      	enviarMensagem();
	      else
	   	     logar();
	    }
	});
}

// Envia uma mensagem para o servidor(privada ou global)
function enviarMensagem()
{
	// Mensagem chat
	var txt = urlify($('#entrada' + abaSelecionada).val());
	var mensagem;
	if(abaSelecionada == "index") // Enviar mensagem global
	{
		mensagem = {tipo:"all", msg: txt, user: username};
	}
	else // Enviar mensagem privada
	{
		var tag = "tagNomeVerde";
		// Imprimo a mensagem privada local com o nome do usuário
		var msg = "<li><span class='"+tag+"'>&lt"+username+"&gt</span> "+txt+"<span class='"+tag+"'>&lt/"+username+"&gt</span></li>";
		$('#txt'+abaSelecionada).append(msg);

		// Crio a mensagem a ser enviada
		mensagem = {tipo:"dm", msg:txt, user: username, dest: abaSelecionada};
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

// Imprime uma mensagem privada na aba específica. Caso a aba não foi criada, ele criará, se já existir, selecionará ela.
function imprimirMensagemPrivada(msg, remetente)
{
	var tag = "tagNomeVerde";
	var msg = "<li><span class='"+tag+"'>&lt"+remetente+"&gt</span> "+msg+"<span class='"+tag+"'>&lt/"+remetente+"&gt</span></li>";
	var aba;
	if($(".tabs li:contains('"+ remetente + tipoArquivo + "')").text() != "") // Se a aba com o usuário já existir
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
function imprimirMensagemGlobal(msg, remetente)
{
	var tag = "tagNomeAzul";
	var msg = "<li><span class='"+tag+"'>&lt"+remetente+"&gt</span> "+msg+"<span class='"+tag+"'>&lt/"+remetente+"&gt</span></li>";
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
	$(".listaUsuariosOn").html(''); // Limpa antes de adicionar
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