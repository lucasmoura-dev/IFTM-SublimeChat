var socket = io();
var jaLogou = false;
var username;
var estado = 0;
var online = [];
var chatInicializado = false;
var tipoArquivo = ".html";
var abaSelecionada = "index";
var ultimoTabId = 1; //Variavel auxiliar para criação de novas abas de chat particular
var corDefinida = "#3da3ef";
// variáveis typing
var typing = false;
var timeout = undefined;
var usuariosDigitando = {global: []};


$(document).ready(function() {

  // Define a aba inicial ativa
$(".content").find("[class^='tab']").hide();
$(".tabs li:first").attr("class","active");
$(".content .tab1").fadeIn();

// Função que alterna para a aba clicada
$('.tabs.round ul #tabChat').live('click', function(e){
  e.preventDefault();
  if ($(this).closest("li").attr("class") == "active"){
    return;       
  }
  else{             
    $(".content").find("[class^='tab']").hide(); 
    $(".tabs li").attr("class",""); 
    $(this).attr("class","active");
    $('.' + $(this).attr('name')).fadeIn();
    // Pega o o nome da aba e ignora o tipo do arquivo
    abaSelecionada = $(this).text().substr(0, $(this).text().indexOf('.'));
  }
    });

    // Fecha a aba ao clicar no "x"
    $('.tabs.round ul li .fecha').live('click', function(){
      $(this).parent().parent().remove();
      $('.' + $(this).parent().parent().attr('name')).remove();
    });

    
    // Adicionar um chat particular com um usuário
    $('.usuariosOn').live('click', function(){

      if($("[id^='tabChat']").length < 7)
      {
        var usuarioSelecionado = $(this).text(); 
        if($(".tabs li:contains('"+ $(this).text() + tipoArquivo + "')").text() != "") // Se a aba com o usuário já existir
        {
          selecionarAba(usuarioSelecionado);
        }
        else
        {
          // Não permite abrir a aba de mensagem privada pro próprio usuário. Também é obrigatório estar logado
          if($(this).text() == username || jaLogou == false)
            return;

          ultimoTabId++;
          criarAba(usuarioSelecionado, ultimoTabId);
        }         
      }
      else
      alert("Limite de abas simultaneas excedido!");
    });
}); 

// Crio o evento pro primeiro textarea (index)
$("#entradaindex").keyup(function(e)
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
$("#entradaindex").keyup(function(e){
  if((e.keyCode || e.which) !== 13) 
  {
    if(jaLogou == true)
    {
      if(typing === false && $("#entradaindex").is(":focus"))
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
        // Cria o timer que chamará a função quando acabar o tempo e a aba que estava selecioanda naquele momento
        // o .bind é necessário para ppoder passar uma função com argumentos na funçaõ setTimeout
        timeout = setTimeout(timeoutFunction.bind(null, abaSelecionada), 500);
      }
    }
  
  }
});
