var socket = io();
var jaLogou = false;
var username;
var estado = 0;
var online = [];
var chatInicializado = false;
var tipoArquivo = ".html";
var abaSelecionada = "index";
var ultimoTabId = 1; //Variavel auxiliar para criação de novas abas de chat particular

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
        enviarMensagem();
      else
         logar();
    }
    else
      console.log(username + " está digitando.");
});