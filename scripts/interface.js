﻿
CoC.ui.teams=new function(){

  this.selector="#teams"

  this.view = undefined;
  this.worker = null;
  this.empty = true;
  
  this.clear=function(){
    $(CoC.ui.teams.selector).text("");
    CoC.ui.teams.empty = true;
  }
 
  this.update=function(result, size){
    if(this.view === undefined){
      this.view = new CoC.view.TeamView({
        el: $("#teams")[0]
      });
    }
    this.view.size(size);
    this.view.teams(result.teams);
    this.view.extras(result.extras);
    this.view.render();
  }
}

CoC.ui.roster=new function(){

  this.empty = true;
  this.view = undefined;
  
  this.popup=function(element, champion){
    
    $("#roster-configure-stars").text("");
    $("#roster-configure-stars").append((function(){
      var string = "";
      for(var i=0;i<champion.get("stars");i++)
        string+="<span class='star'></span>";
      return string;
    })());
    if(champion.get("awakened") > 0)
      $("#roster-configure-stars").addClass("awakened")
    else
      $("#roster-configure-stars").removeClass("awakened")

    var synergies;
    
    $("#roster-configure-synergies-to").text("");
    synergies = CoC.data.synergies.where({ toId:champion.get("uid") });
    for(var s=0; s<synergies.length; s++){
      var synergy = synergies[s];
      var effect = CoC.data.effects.findWhere({ uid:synergy.get("effectId") });
      var toChampion = CoC.data.champions.findWhere({ uid:synergy.get("fromId"), stars:synergy.get("fromStars") });
      var syneryEl = $('<div>', { class : "synergy", title: toChampion.get("stars") + "★ " + toChampion.get("name") });
      syneryEl.append($('<img>', { class : "portrait " + toChampion.get("type").toLowerCase(), src:toChampion.portrait() }));
      syneryEl.append($('<img>', { src:effect.get("image") }));
      syneryEl.append($('<span>').text(effect.get("name") + " +" + synergy.get("effectAmount") + "%"));
      $("#roster-configure-synergies-to").append(syneryEl);
    }
    if(synergies.length == 0)
      $("#roster-configure-synergies-to").append($('<div>',{ class : "synergy none" }).append($('<span>').text("None")));
      
    $("#roster-configure-synergies-from").text("");
    synergies = CoC.data.synergies.where({ fromId:champion.get("uid"), fromStars:champion.get("stars") });
    for(var s=0; s<synergies.length; s++){
      var synergy = synergies[s];
      var effect = CoC.data.effects.findWhere({ uid:synergy.get("effectId") });
      var toChampion = CoC.data.champions.findWhere({ uid:synergy.get("toId") });
      var syneryEl = $('<div>', { class : "synergy", title: toChampion.get("name") });
      syneryEl.append($('<img>', { class : "portrait " + toChampion.get("type").toLowerCase(), src:toChampion.portrait() }));
      syneryEl.append($('<img>', { src:effect.get("image") }));
      syneryEl.append($('<span>').text(effect.get("name") + " +" + synergy.get("effectAmount") + "%"));
      $("#roster-configure-synergies-from").append(syneryEl);
    }
    if(synergies.length == 0)
      $("#roster-configure-synergies-from").append($('<div>',{ class : "synergy none" }).append($('<span>').text("None")));
    $("#roster-configure-synergies").children(2).collapsible( "expand" );

    $("#roster-configure-image").prop("src", champion.image());
    $("#roster-configure-name").prop("class", champion.get("type")).text(champion.get("name"));
    $("#roster-configure-class").prop("class", champion.get("type").toLowerCase()).text(champion.get("type"));

    function setupRankLevel(){
      var levels = CoC.data.championLevels[champion.get("stars")];
    
      $("#roster-configure-level").empty();
      for(var i = 1; i<=levels[champion.get("rank")-1]; i++)
        $("#roster-configure-level").append($("<option>").val(i).text(i));
        
      $("#roster-configure-level").unbind( "change" ).change(function(e){              
        champion.set("level", e.target.value);
        champion.save();
        CoC.ui.roster.update();
        $("#roster-configure-level").selectmenu('refresh');
      }).val(champion.get("level")).selectmenu('refresh');
    }
    
    $("#roster-configure-rank").text("");
    for(var i = 1; i<=CoC.data.championLevels[champion.get("stars")].length; i++)
      $("#roster-configure-rank").append($("<option>").val(i).text(i));
    $("#roster-configure-rank").unbind( "change" ).change(function(e){        
      champion.set("rank", e.target.value);
      champion.save();
      CoC.ui.roster.update();
      setupRankLevel();
      $("#roster-configure-rank").selectmenu('refresh');
    }).val(champion.get("rank")).selectmenu('refresh');
    
    setupRankLevel();
    
    $("#roster-configure-awakened").prop("checked", champion.get("awakened") != 0).checkboxradio("refresh").unbind( "change" ).change(function(e){

      champion.set("awakened", (e.target.checked)? 1: 0)
      champion.save();
      
      if(champion.get("awakened") > 0){
        $("#roster-configure-stars").addClass("awakened");
        $("#roster-delete-confirm-stars").addClass("awakened");
      }
      else{
        $("#roster-configure-stars").removeClass("awakened")
        $("#roster-delete-confirm-stars").removeClass("awakened");
      }
      CoC.ui.roster.update();
    });
    
    $("#roster-configure-quest").prop("checked", champion.get("quest")).checkboxradio("refresh").unbind( "change" ).change(function(e){
      champion.set("quest", (e.target.checked)? true: false);
      champion.save();
      CoC.ui.roster.update();
    });
    
    $("#roster-configure-delete").unbind( "click" ).click(function(){
      $('#popup-roster-configure').popup("option","transition","none").popup("close");
      setTimeout(function(){
        $("#popup-roster-delete-confirm").popup("open",{
          positionTo:"window"
        })
      },50);
    });
    
    $("#roster-delete-confirm-name").attr("class", champion.get("type").toLowerCase()).text(champion.get("name"));
    $("#roster-delete-confirm-stars").text("").attr("class", (champion.get("awakened") > 0)? "awakened": "");
    for(var i=0; i<champion.get("stars");i++)
      $("#roster-delete-confirm-stars").append($("<span>",{ class:'star' }));
    $("#roster-delete-confirm-yes").unbind( "click" ).click(function(){
      $("#popup-roster-delete-confirm").popup("close");
      champion.destroy();
      CoC.ui.roster.update();
    })
    
    $('#popup-roster-configure').popup("open",{
      positionTo:$(element)
    })
  
  }
  
  this.update=function(){
  
    if(this.view === undefined){
      this.view = new CoC.view.RosterView({
        el: $("#roster")[0]
      });
    }
    this.view.render();
  }
}

CoC.ui.add=new function(){

  this.stars = 2;
  this.view = undefined;
  
  this.setStars=function(stars){
    this.stars = stars;
    CoC.ui.add.update();
  }
  
  this.update=function(){
    if(this.view === undefined){
      this.view = new CoC.view.AddChampionsView({
        el: $("#add-champions")[0]
      });
    }
    this.view.stars(this.stars)
    this.view.render();
  }
}

//Make swipes move to the next screen
$( document ).on( "pagecreate", "#page-add", function() {
  $( document ).on( "swipeleft", "#page-add", function( e ) {
    $("#page-add").find("#header a[href=#page-roster]").click()
  });
});

//Make swipes move to the next screen
$( document ).on( "pagecreate", "#page-roster", function() {
  $( document ).on( "swipeleft", "#page-roster", function( e ) {
    if($("#page-roster").find(".panel").hasClass("ui-panel-open"))
      return;
    $("#page-roster").find("#footer a[href=#page-teams]").click()
  });
  $( document ).on( "swiperight", "#page-roster", function( e ) {
    if($("#page-roster").find(".panel").hasClass("ui-panel-open"))
      return;
    $("#page-roster").find("#header a[href=#panel-roster-options]").click()
  });
});

//Make swipes move to the last screen or open the panel
$( document ).on( "pagecreate", "#page-teams", function() {
  $( document ).on( "swipeleft", "#page-teams", function( e ) {
    if($("#page-teams").find(".panel").hasClass("ui-panel-open"))
      return;
    $("#page-teams").find("#header a[href=#panel-team-settings]").click()
  });
  $( document ).on( "swiperight", "#page-teams", function( e ) {
    if($("#page-teams").find(".panel").hasClass("ui-panel-open"))
      return;
    $("#page-teams").find("#footer a[href=#page-roster]").click()
  });
});

//Make swipes move to the next screen
$( document ).on( "pagecreate", "#page-settings-advanced", function() {
  $( document ).on( "swiperight", "#page-settings-advanced", function( e ) {
    $("#page-settings-advanced").find("#footer a[href=#page-teams]").click()
  });
});

$("#page-roster").on("pagebeforeshow",function(){

  $('#roster-import a').click(function(){
    console.log("importing csv...");
    
    $('#roster-import input').change(function(e){
      if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
          var result = e.target.result;
          CoC.roster.csv(result);
          CoC.ui.roster.update();
        }
        reader.readAsText(this.files[0]);
      }
    }).click();
    $('#panel-roster-options').panel("close");
  });
  
  $('#roster-export').click(function(){
    console.log("exporting to csv...");
    
    var csvRoster = CoC.roster.csv();
    $('#roster-export').attr('download', 'coc-roster.csv').attr('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRoster));
    
    $('#panel-roster-options').panel("close");
  });
  
  
  $('#roster-clear-all').click(function(){
    $("#popup-roster-clear-confirm").popup("open",{
      positionTo:"window"
    });
  });
  
  $('#popup-roster-configure').on("popupafterclose",function(){
    $(CoC.ui.roster.selector).find(".container").removeClass("selected");
  });
  
  $("#roster-delete-confirm-no").click(function(){
    $("#popup-roster-delete-confirm").popup("close");
  });
  
  $("#roster-clear-confirm-no").click(function(){
    $("#popup-roster-clear-confirm").popup("close");
  });
  
  $("#roster-clear-confirm-yes").click(function(){
    CoC.roster.clear();
    CoC.ui.roster.update();
    $("#popup-roster-clear-confirm").popup("close");
    $('#panel-roster-options').panel("close");
  });

  $('#roster-sort-stars').change(function(){
    CoC.settings.setValue("roster-sort", "stars");
    CoC.ui.roster.update();
  }).prop("checked", (CoC.settings.getValue("roster-sort") == "stars")? true: false).checkboxradio('refresh');
  $('#roster-sort-class').change(function(){
    CoC.settings.setValue("roster-sort", "class");
    CoC.ui.roster.update();
  }).prop("checked", (CoC.settings.getValue("roster-sort") == "class")? true: false).checkboxradio('refresh');
  $('#roster-sort-name').change(function(){
    CoC.settings.setValue("roster-sort", "name");
    CoC.ui.roster.update();
  }).prop("checked", (CoC.settings.getValue("roster-sort") == "name")? true: false).checkboxradio('refresh');

  
  var filters = [
    'roster-filter-stars-1',
    'roster-filter-stars-2',
    'roster-filter-stars-3',
    'roster-filter-stars-4',
    "roster-filter-cosmic",
    "roster-filter-tech",
    "roster-filter-mutant",
    "roster-filter-skill",
    "roster-filter-science",
    "roster-filter-mystic",  
  ];
  $('#roster-filter-all').click(function(){
    for(var i=0; i<filters.length; i++){
      $('#'+filters[i]).prop("checked", true).checkboxradio('refresh')
      CoC.settings.setValue(filters[i], true);
    }
    CoC.ui.roster.update();
  });
  for(var i=0; i<filters.length; i++)
    (function(filter){
      $('#'+filter).change(function(){
        CoC.settings.setValue(filter, this.checked);
        CoC.ui.roster.update();
      })
      .prop("checked", CoC.settings.getValue(filter)? true: false)
      .checkboxradio('refresh');
    })(filters[i])
    
  
  CoC.ui.roster.update();
});

$("#page-add").on("pagebeforeshow",function(){
  $("#page-add #add-stars a").removeClass("ui-btn-active");
  $("#page-add a#add-stars-"+CoC.ui.add.stars).addClass("ui-btn-active");
  CoC.ui.add.update();
});

$("#page-teams").on( "pagecreate", function() {

  var algorithm = CoC.settings.getValue("algorithm") || "greedy";
  for(var i in CoC.algorithm)
    $("#team-settings-algorithm").append($('<option>', { value:i }).text( "Algorithm - " + CoC.algorithm[i].name ));

});
$("#page-teams").on( "pagebeforeshow", function() {
  $("#team-build-progress").attr("class", (CoC.ui.teams.worker === null)? "hidden": "");
  $("#team-build-progress input").css('opacity', 0).css('pointer-events','none');
  $("#team-build-progress .ui-slider-handle").remove();
  $('#team-build-progress .ui-slider-track').css('margin','0 15px 0 15px').css('pointer-events','none');
  
  var teamSettingsSize = $('input:radio[name=team-settings-size]');
  teamSettingsSize.filter('[value='+CoC.settings.getValue("size")+']').prop("checked", true).checkboxradio("refresh");
  teamSettingsSize.change(function(){ CoC.settings.setValue("size",this.value) });
    
  function enableResultOptions(){
    var algorithm = CoC.settings.getValue("algorithm");    
    var isQuesting = CoC.settings.getValue("quest-group");
    
    var canQuest = true;
    if(!CoC.algorithm[algorithm].canQuest){
      isQuesting = false;
      canQuest = false;
    }

    var canExtras = false;
    if(!isQuesting)
      canExtras = true;
  
    $('#team-settings-algorithm-description').text( CoC.algorithm[algorithm].description );
    $('#team-settings-quest').slider(canQuest? "enable": "disable").slider("refresh");
    $('#team-settings-extras').slider(canExtras? "enable": "disable").slider("refresh");
  }
    
  $("#team-settings-algorithm").change(function(){
    CoC.settings.setValue("algorithm",this.value);
    enableResultOptions();
  }).val(CoC.settings.getValue("algorithm") || "greedy").selectmenu("refresh");  
    
  $('#team-settings-quest').change(function(){
    CoC.settings.setValue("quest-group",this.value=="yes");
    enableResultOptions();
  }).val(CoC.settings.getValue("quest-group")? "yes": "no").slider('refresh');
    
  $('#team-settings-extras').change(function(){
    CoC.settings.setValue("include-extras",this.value=="yes") 
  })
    .val(CoC.settings.getValue("include-extras")? "yes": "no")
    .slider('refresh');
    
    
  enableResultOptions();
  
  $("#button-team-settings-apply").click(function(){
    $("#panel-team-settings").panel( "close" );
    
    var size = CoC.settings.getValue("size");
    if(size === undefined)
      size = 3;
      
    var filterStars = {
      1: CoC.settings.getValue("roster-filter-stars-1"),
      2: CoC.settings.getValue("roster-filter-stars-2"),
      3: CoC.settings.getValue("roster-filter-stars-3"),
      4: CoC.settings.getValue("roster-filter-stars-4")
    };
    var filterTypes = {
      Cosmic: CoC.settings.getValue("roster-filter-cosmic"),
      Tech: CoC.settings.getValue("roster-filter-tech"),
      Mutant: CoC.settings.getValue("roster-filter-mutant"),
      Skill: CoC.settings.getValue("roster-filter-skill"),
      Science: CoC.settings.getValue("roster-filter-science"),
      Mystic: CoC.settings.getValue("roster-filter-mystic")
    }
    var roster = CoC.data.roster.filter(function(champion){
      if(filterStars[champion.get("stars")] === false)
        return false;
      return filterTypes[champion.get("type")];
    });
    
    var algorithm = CoC.settings.getValue("algorithm") || "greedy";
    var quest = CoC.settings.getValue("quest-group")===true;
    var extras = CoC.settings.getValue("include-extras")===true;
    $("#team-build-progress input").val(0).slider("refresh");
    $("#team-build-progress").attr("class","");
    
    CoC.ui.teams.empty = false;
    
    var startTime = new Date(), workerWorking = false;
    if (window.Worker){
  
      try{
        if(CoC.ui.teams.worker !== null)
          CoC.ui.teams.worker.terminate();
        CoC.ui.teams.worker = new Worker('scripts/worker.js?');
        CoC.ui.teams.worker.onmessage=function(event){
          if(event.data.type === "progress"){
            var current = event.data.current;
            var max = event.data.max;
            var description = event.data.description;
            if(description){
              $("#onboarding-progress .text").text(description);
              $("#onboarding-progress").addClass("show");
            }
            $("#team-build-progress input").val(Math.min(1000 * (current / max), 1000)).slider("refresh");
          }
          if(event.data.type === "failed"){
            $("#team-build-progress input").val(10000).slider("refresh");
            $("#team-build-progress").attr("class","hidden");
            $("#onboarding-progress").removeClass("show");
            CoC.ui.teams.update(event.data.result, size);
            CoC.ui.teams.worker.terminate();
            CoC.ui.teams.worker = null;
            console.log(event.data.message);
          }
          if(event.data.type === "complete"){
            $("#team-build-progress input").val(10000).slider("refresh");
            $("#team-build-progress").attr("class","hidden");
            $("#onboarding-progress").removeClass("show");
            
            var result = {};
            if(event.data.result.teams !== undefined){
              result.teams=[];
              for(var i=0; i<event.data.result.teams.length; i++){
                var team = [];
                for(var j=0; j<event.data.result.teams[i].length; j++)
                  team.push(new CoC.model.Champion( event.data.result.teams[i][j].attributes ))
                result.teams.push(team);
              }
            }
            if(event.data.result.extras !== undefined){
              result.extras=[];
              for(var i=0; i<event.data.result.extras.length; i++)
                result.extras.push(new CoC.model.Champion( event.data.result.extras[i].attributes ))
            }
            
            CoC.ui.teams.update(result, size);
            CoC.ui.teams.worker.terminate();
            CoC.ui.teams.worker = null;
            console.log(CoC.algorithm[algorithm].name + " search completed in "+((new Date() - startTime) / 1000)+" seconds");
          }
        };
        
        var rosterJSON = [];
        for(var i=0; i<roster.length; i++)
          rosterJSON.push(roster[i].toJSON());
        
        CoC.ui.teams.worker.postMessage({
          algorithm:algorithm,
          roster:rosterJSON, 
          size:size, 
          quest:quest, 
          extras:extras,
          weights:CoC.settings.weights, 
          update:250
        });
        workerWorking = true;
      }
      catch(e){
        console.error(e)
      }
    }

    if(!workerWorking){
      setTimeout(function(){
        var lastTime = (new Date()).getTime();
        var result = CoC.algorithm[algorithm].build({ heroes:roster, size:size, quest:quest, extras:extras });
        $("#team-build-progressprogress input").val(10000).slider("refresh");
        setTimeout(function(){
          CoC.ui.teams.update(result, size);
          $("#team-build-progress").attr("class","hidden");
          $("#onboarding-progress").removeClass("show");
          console.log(CoC.algorithm[algorithm].name + " search completed in "+((new Date() - startTime) / 1000)+" seconds (worker failed)");
        },0);
      },0);
    }
    
  });
});

$("#page-settings-advanced").on( "pagecreate", function() {

  var sliders = {};

  function addPresets(category){
    var container = $("#settings-advanced-preset-"+category.toLowerCase()),
      presets = CoC.settings.preset.ids(category);      
    for(var i in presets){
      var preset = CoC.settings.preset.info(presets[i]);
      container.append($('<option>', { value:preset.id }).text( preset.name ));
    }
  }
  addPresets("Synergies");
  addPresets("Duplicates");
  
  $("#settings-advanced-preset-defaults").click(function(){
    CoC.settings.preset.apply("defaults", function(key, value){
      var slider = $(sliders[key]);
      if(slider.length){
        slider.val(value * 100).slider("refresh")
        return true;
      }
      return false;
    });
  });
  
  $("#settings-advanced-preset-synergies, #settings-advanced-preset-duplicates").change(function(){
    CoC.settings.preset.apply(this.value, function(key, value){
      var slider = $(sliders[key]);
      if(slider.length){
        slider.val(value * 100).slider("refresh")
        return true;
      }
      return false;
    });
  });
  
  function enableSlider(id, type){
    var value = CoC.settings.getWeight(type);
    $(id).val(value * 100).slider("refresh").change(function(){
      CoC.settings.setWeight(type, parseInt(this.value) / 100.0);
    })
    sliders[type]=id;
  }
  enableSlider("#settings-advanced-star4","stars-4");
  enableSlider("#settings-advanced-star3","stars-3");
  enableSlider("#settings-advanced-star2","stars-2");
  enableSlider("#settings-advanced-star1","stars-1");
  enableSlider("#settings-advanced-awakened","awakened");
  enableSlider("#settings-advanced-class2","duplicates-2");
  enableSlider("#settings-advanced-class3","duplicates-3");
  enableSlider("#settings-advanced-class4","duplicates-4");
  enableSlider("#settings-advanced-class5","duplicates-5");
  enableSlider("#settings-advanced-attack","attack");
  enableSlider("#settings-advanced-stun","stun");
  enableSlider("#settings-advanced-critrate","critrate");
  enableSlider("#settings-advanced-critdamage","critdamage");
  enableSlider("#settings-advanced-perfectblock","perfectblock");
  enableSlider("#settings-advanced-block","block");
  enableSlider("#settings-advanced-powergain","powergain");
  enableSlider("#settings-advanced-armor","armor");
  enableSlider("#settings-advanced-health","health");
  
});