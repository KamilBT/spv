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

//okno pre vybratie suboru
$("#subor").on("click", function() {
    $("#file-input").trigger("click");
});

$("#settings").on("click", function() {
    $("#settings-wrap").toggleClass("open");
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
      console.log(res);
      path = res[0];
      
      setImages(path);
      setRules(res, path)
      
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
        $("#p"+j+"").append("<img src='"+path+"/"+splitdata[0].charAt(i)+".png'/>");
      }
      $("#p"+j+"").append("<img class='rule_arrow' src='images/arrow_black.png'/>");
      for(var i=0; i<splitdata[1].length; i++){
        //console.log(splitdata[1]);
        $("#p"+j+"").append("<img src='"+path+"/"+splitdata[1].charAt(i)+".png'/>");
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
  for(i=0; i<3; i++){
     var akt = String.fromCharCode(97+i);
    html +="<img id='drag"+akt+"' data-val='"+akt+"' src='"+path+"/"+akt+".png' draggable='true' ondragstart='drag(event)' width='50' height='50'>";
  }
  $("#draggable").html(html);
}

//klikanie na pravidla
$(document).on('click', '.pravidlo', function(){
  if ($("#goal").children().length >0){
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
        var wordWrap = $("<div class='aktw last'></div>");
        for(var i=0; i<aktw.length; i++){
           $(wordWrap).append("<img src='"+path+"/"+aktw.charAt(i)+".png'/>");
        }
        $("#aktWord").append(wordWrap);
        
        //zobrazenie pouziteho pravidla
        var ruleWrap = $("<div class='aktrule'></div>");
        for(var i=0; i<usedRule[0].length; i++){
           $(ruleWrap).append("<img src='"+path+"/"+usedRule[0].charAt(i)+".png'/>"); 
        }
        $(ruleWrap).append("<img src='images/arrow_black.png'/>");
        for(var i=0; i<usedRule[1].length; i++){
           $(ruleWrap).append("<img src='"+path+"/"+usedRule[1].charAt(i)+".png'/>"); 
        }
        $("#aktRule").append(ruleWrap);
        
        //zrusenie classy last pri predchodcovi
        $(".aktw.last").prev().removeClass('last');
        
        //kontrola pre goal
        console.log(aktw, generatedGoals[generatedGoals.length-1]);
        if(aktw == generatedGoals[generatedGoals.length-1])
          alert("Vitaz");   
     }
     else alert("teraz toto pravidlo použiť nemôžeš, skús iné pravidlo");
       
  }
  else alert("najrpv vytvor počiatočný vzor");//alert("aktuálny vzor nespĺňa kliknuté pravidlo, skús iné pravidlo");
});

//klikanie na posledne vytvorene slovo
$(document).on('click', '.aktw.last', function(){
    //zmazanie posledneho slova
    aktWordsUser.pop();
    usedRulesUser.pop();
    //kontrola ci existuju predchadzauje pravidla - class first ma len prvy ktory sa nema mazat
    if(!$(this).prev().hasClass('first')){
      $(this).prev().addClass('last');
    }
    $(this).remove();
    $('.aktrule').last().remove();
});

//nastavenie pre menu
$("#show-rules").on('change', function(){
  if($(this).prop('checked')) {
    $("#aktRule").removeClass('hidden');
  }
  else $("#aktRule").addClass('hidden');
});      
 
});


function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.target.setAttribute("onclick","remove(event);");
  ev.dataTransfer.setData("text", ev.target.id);
}

/*drop pre aktualne uchopeny element a pridanie noveho pri drope do pola so slovom*/
var count = 0;
function drop(ev) {
  count++; //pridavanie cisla pre nove id elementu
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  ev.target.appendChild(document.getElementById(data));
  
  //vytvorenie kopie, ktora ma obmenene id a zruseny event na mazanie
  
  var cln = document.getElementById(data).cloneNode(true);
  cln.setAttribute("id", cln.getAttribute("id")+count);
  cln.removeAttribute("onclick");
  document.getElementById("draggable").appendChild(cln);
  
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
      $(wordWrap).append("<img src='"+path+"/"+wordImage[i].getAttribute("data-val")+".png'/>"); 
  }  
  $("#aktWord").html('').append(wordWrap);
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
  $("#start").html("");
  $(".aktw").remove();
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
    for(var i=0; i<set_n; i++){
       //var apply = 1; //pomocna premenna
      //nahodne zvolene pravidlo 
      //kym sa neaplikuje aspon jedno pravidlo
      var limit = 0;
      while(limit <500){
        limit++;
        var rule = rules[Math.floor(Math.random() * rules.length)];
        //console.log(aktw, aktw.indexOf(rule[0]), rule[0]);
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
         $("#goal").append("<img src='"+path+"/"+aktw.charAt(i)+".png'/>");
     }
  }
}

