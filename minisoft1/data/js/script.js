//pravidla pre hru
var rules=[];               //pravidla
var path ='';               //cesta
var startw;                 //startovacie slovo
var set_n = 3;              // pocet pravidiel k finalnemu slovu
var max = 5;                //maximalny pocet pismen(obrazkov)

//generovanie
var usedRules = [];         // pole pre vyklikane pravidla
var aktWords = [];          //pole pre prechod modifikovanych slov
var generatedGoals = [];    //aby pri znovuvytvoreni nenaskocilo rovnake slovo

//user
var usedRulesUser = [];         // pole pre vyklikane pravidla
var aktWordsUser = [];          //pole pre prechod modifikovanych slov

$(document).ready(function() {
localStorage.setItem('MSlevel', '1');
//okno pre vybratie suboru
$("#subor").on("click", function() {
    $("#file-input").trigger("click");
});

$("#settings").on("click", function() {
    $("#settings-wrap").toggleClass("open");
});

//sipka pre spustenie hry
$("#launch").on("click", function(){
  //ak je startovacie neni prilis dlhe
  if($("#start img").length <=5) {
    $(this).addClass("hide");
    //zrusenie tahania obrazkov po generovani slova
    $("#start img").each(function(){
      $(this).removeAttr('onclick').attr('draggable', false);
    });
    //zrusenie tahania obrazkov
    $("#draggable img").each(function(){
      $(this).attr('draggable', false);
    });
    localStorage.setItem('MShra','start');
  }
});

//schovanie menu pri kliku inde na stranku
$(document).on("click", function(e){
  if(e.target.id != "settings" && $(e.target).closest("#settings-wrap").length === 0 ){
      $("#settings-wrap").removeClass("open");
  }
});

//nacitanie dat zo suboru
document.querySelector("#file-input").addEventListener("change", function() {
  var all_files = this.files;
	if(all_files.length == 0) {
		alert('Error : No file selected');
		return;
	}

	var file = all_files[0];

	var allowed_types = [ 'text/plain' ];
	if(allowed_types.indexOf(file.type) == -1) {
		alert('Error : Podpora iba pre .txt subory');
		return;
	}

	var max_size_allowed = 2*1024*1024;
	if(file.size > max_size_allowed) {
		alert('Error : subor presiahol 2MB');
		return;
	}
  var reader = new FileReader();
  reader.onload = function(){
      var data = reader.result;
      var res = data.split("\n");
      //console.log(res);
      path = res[0];

      setRules(res, path);
      setImages(path);

    };
  reader.readAsText(file);
});
//---------------------------------------------------------------------------


//NASTAVENIE TLACIDIEL - PRAVIDLA
function setRules(data, path){
  $("#rules").html("");
  console.log(data);
  for (var j=1; j<data.length; j++){
    //premazanie popisu pravidlo
    if(data[j].length > 0){
      $("#rules").append("<div class='pravidlo' id='p"+j+"'>Pravidlo"+j+"</div>");
      $("#p"+j+"").html("");

      //split podla sipky
      var splitdata = data[j].split("->");
      splitdata[0] = splitdata[0].trim();
      splitdata[1] = splitdata[1].trim();

      //znazornenie pravidiel v hre
      for(var i=0; i<splitdata[0].length; i++){
        $("#p"+j+"").append("<img src='"+path+"/"+splitdata[0].charAt(i)+".png' draggable='false' width='40' height='40'/>");
      }
      $("#p"+j+"").append("<img class='rule_arrow' src='data/arrow_black.png' draggable='false' width='40' height='40'/>");
      for(var i=0; i<splitdata[1].length; i++){
        //console.log(splitdata[1]);
        $("#p"+j+"").append("<img src='"+path+"/"+splitdata[1].charAt(i)+".png' draggable='false' width='40' height='40'/>");
      }
      //pridanie hodnot do elemntu s pravidlami
      //$("#p"+j+"").attr('data-from', splitdata[0]).attr('data-to', splitdata[1]);
      $("#p"+j+"").attr('data-rule', j);
      //ulozenie do premennej
      rules.push([splitdata[0], splitdata[1]]);
    }
  }
}

//nastavenie obrazkov
function setImages(path){
  html = "";
  //najdenie najvacieho pismena v pravidlach
  var alphabet = "a";
  for(i=0; i<rules.length; i++){
    var akt = rules[i].join();
    for (j=0; j<akt.length; j++){
      if (akt.charCodeAt(j) > alphabet.charCodeAt(0))
        alphabet = akt[j];
    }
  }
  //nastavenie obrazkov od a po najvecsie pismeno
  for(i=0; i<=alphabet.charCodeAt(0) - 97; i++){
     var akt = String.fromCharCode(97+i);
    html +="<img id='drag"+akt+"' data-val='"+akt+"' src='"+path+"/"+akt+".png' draggable='true' ondragstart='drag(event)' width='40' height='40'>";
  }
  $("#draggable").html(html);
}

//klikanie na pravidla
$(document).on('click', '.pravidlo', function(){
  //ak boli neboli pravidla blokovane po uspesnej hre
  if(localStorage.getItem('MShra') != "stop"){
    //ak je vytvorene cielove slovo
    if ($("#goal").children().length >0){
      if($('.aktw').length < 10){
       //za kazdym klikom treba vratit posledne slovo, a na zaciatku to je teda startw
       var aktw;
       if(aktWordsUser.length == 0) aktw = startw;
       else aktw = aktWordsUser[aktWordsUser.length-1];

       console.log(rules, $(this).attr("data-rule"));
       var usedRule = rules[$(this).attr("data-rule") - 1];
       console.log(usedRule);
       var toReplace = usedRule[0];

       //ak pravidlo je uplatnitelne
       if(aktw.indexOf(toReplace) >= 0){
          //prepis akt slova a zapisanie do pola
          aktw = aktw.replace(usedRule[0], usedRule[1]);
          usedRulesUser.push(usedRule);
          aktWordsUser.push(aktw);

          //zobrazenie vzniknuteho slova
          if(!$("#show-rules").prop('checked')) {
            $(".aktw.last").addClass('hidden')
          }
          var wordWrap = $("<div class='aktw last'></div>");
          for(var i=0; i<aktw.length; i++){
             $(wordWrap).append("<img src='"+path+"/"+aktw.charAt(i)+".png' draggable='false' width='40' height='40' />");
          }
          $("#aktWord").append(wordWrap);

          //zobrazenie pouziteho pravidla
          var ruleWrap = $("<div class='aktrule'></div>");
          for(var i=0; i<usedRule[0].length; i++){
             $(ruleWrap).append("<img src='"+path+"/"+usedRule[0].charAt(i)+".png' draggable='false' width='40' height='40' />");
          }
          $(ruleWrap).append("<img src='data/arrow_black.png' draggable='false' width='40' height='40'/>");
          for(var i=0; i<usedRule[1].length; i++){
             $(ruleWrap).append("<img src='"+path+"/"+usedRule[1].charAt(i)+".png' draggable='false' width='40' height='40'/>");
          }
          $("#aktRule").append(ruleWrap);

          //zrusenie classy last pri predchodcovi
          $(".aktw.last").prev().removeClass('last');

          //kontrola pre goal
          console.log(aktw, generatedGoals[generatedGoals.length-1]);
          if(aktw == generatedGoals[generatedGoals.length-1]){
            $('.pravidlo').each(function(){
              $(this).addClass('gameStop')
            });
            localStorage.setItem('MShra', 'stop');
            var lv = localStorage.getItem('MSlevel');
            lv = parseInt(lv) + 1;
            localStorage.setItem('MSlevel', lv);
            $("#win").toggleClass('disp');
            //alert("Vitaz");
          }
       }
       else alert("teraz toto pravidlo použiť nemôžeš, skús iné pravidlo");
       }
    }
    else alert("najrpv vytvor počiatočný vzor");
  }
});


//klikanie na posledne vytvorene slovo
$(document).on('click', '.aktw.last', function(){
    //zmazanie posledneho slova ak hra neni pauznuta pri vitazstve
    if(localStorage.getItem('MShra') != "stop"){
      aktWordsUser.pop();
      usedRulesUser.pop();
      //kontrola ci existuju predchadzauje pravidla - class first ma len prvy ktory sa nema mazat
      if(!$(this).prev().hasClass('first')){
        $(this).prev().addClass('last').removeClass('hidden');
      }
      $(this).remove();
      $('.aktrule').last().remove();
    }
});

//nastavenie pre menu
$("#show-rules").on('change', function(){
  if($(this).prop('checked')) {
    $(".aktw").each(function(){
      if(!$(this).hasClass('first') && !$(this).hasClass('last')){
        $(this).removeClass('hidden');
      }
    });
    $("#aktRule").removeClass('hidden');
  }
  else {
    $(".aktw").each(function(){
      if(!$(this).hasClass('first') && !$(this).hasClass('last')){
        $(this).addClass('hidden');
      }
    });
    $("#aktRule").addClass('hidden');
  }
});

});


function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  //ev.target.setAttribute("onclick","remove(event);");
  ev.dataTransfer.setData("text", ev.target.id);
}

/*drop pre aktualne uchopeny element a pridanie noveho pri drope do pola so slovom*/
var count = 0;
function drop(ev) {
  count++; //pridavanie cisla pre nove id elementu
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");

  //ev.target.appendChild(document.getElementById(data));

  //vytvorenie kopie, ktora ma obmenene id a zruseny event na mazanie
  var cln = document.getElementById(data).cloneNode(true);
  cln.setAttribute("id", cln.getAttribute("id")+count);
  cln.setAttribute("onclick","remove(event);");
  ev.target.appendChild(cln);
  //document.getElementById("draggable").appendChild(cln);

  //zobrazenie sipky pre start po pridani aspon jedneho komponentu slova
  var wordImage = document.getElementById("start").getElementsByTagName('img');
  if(wordImage.length == 1) document.getElementById("launch").classList.remove("hide");
}

//mazanie kliknuteho prvku v poli pri tvoreni slova
function remove(ev){
  ev.target.parentNode.removeChild(ev.target);
  var wordImage = document.getElementById("start").getElementsByTagName('img');
  if(wordImage.length == 0) document.getElementById("launch").classList.add("hide");
}

//generovanie startovacieho slova
function getStartWord(){
  var wordImage = document.getElementById("start").childNodes;
  //console.log(wordImage);

  var word = '';
  //pridanie start slova do plochy s riesenim podla zadania
  var wordWrap = $("<div class='aktw first'></div>");

  for(var i=0; i<wordImage.length; i++){
      word += wordImage[i].getAttribute("data-val");
      $(wordWrap).append("<img src='"+path+"/"+wordImage[i].getAttribute("data-val")+".png' width='40' height='40'/>");
  }
  if(wordImage.length <=5){
     $("#aktWord").html('').append(wordWrap);
  }
  return word;
}

// ZAHAJENIE HRY  --------------------------------------------------------------

function generatedGoal(startw, lastw, rules){
  // pripadna kontrola aby negenerovalo znova to iste co predtym -
}

//reset hodnot
function resetValues(){
  $("#goal").html('');
  $(".aktrule").remove();
  usedRules = [];         // pole pre vyklikane pravidla pri generovani
  aktWords = [];
  usedRulesUser = [];         // pole pre vyklikane pravidla -user
  aktWordsUser = [];
}

//reset spolu so startovnymi slovami
function resetGame(){
  resetValues();
  $("#win").removeClass('disp');
  $("#start").html("");
  $(".aktw").remove();
  $("#draggable img").each(function(){
    $(this).attr('draggable', true);
  });
  $('.pravidlo').each(function(){
    $(this).removeClass('gameStop');
  });
}

function startGame(){
  resetValues();

  startw = getStartWord();
  //console.log(startw);
  var aktw = startw;
  //kontrola ci slovo nie je prilis dlhe
  if(startw.length > max) alert("Zvol najviac 5 obrazkov");
  else{
    //generovanie slova
    console.log(rules);

    var lv = localStorage.getItem('MSlevel'); //lv na zaciatku je 1

    //
    for(var i=0; i<parseInt(lv)+set_n-1; i++){
      //nahodne zvolene pravidlo
      //kym sa neaplikuje aspon jedno pravidlo
      var limit = 0;
      while(limit <500){
        limit++;
        var rule = rules[Math.floor(Math.random() * rules.length)];

        if(aktw.indexOf(rule[0]) >= 0){
           //prepis akt slova a zapisanie do pola
           aktw = aktw.replace(rule[0], rule[1]);
           usedRules.push(rule);
           aktWords.push(aktw);
           break;
        }
      }
     }
     aktw=aktw.trim();
     console.log(usedRules);
     console.log(aktw, aktw.length);
     generatedGoals.push(aktw);
     for(var i=0; i<aktw.length; i++){
         $("#goal").append("<img src='"+path+"/"+aktw.charAt(i)+".png' width='40' height='40'/>");
     }
  }
}
