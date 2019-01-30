//-------<[ GAME ]>-------//
var MAIN_VIEW = 0;
var SPACE_STATION_VIEW = 1;

//1. start a new game
var begin = new Begin();
var game = null;

//---SKIP_INTRO is for testing----//
if (SKIP_INTRO == true){
  //force beginning to end.
  begin.finishUp();
  begin = null;
  game = new Game("Noname");
  game.setup();
}
//--------------------------------//

beginButton.onclick = function(){
  var isDone = begin.done();
  if (isDone){
    //====| BEGIN GAME |====//
    game = new Game(begin.ship_name);
    begin = null; //disconnect the object
    game.setup();
    //======================//
  }
}

resetButton.onclick = function(){
  game = null;
  begin = new Begin();
  //game.iteration = 0;
  //game.setup();
  //game.go();
}



//----------[ BUTTONS! ]-----------//
goButton.onclick = function(){
  if (game.view == MAIN_VIEW){

    goButton.innerHTML = "PROGRESS";

    updateControlPanelNotifs("");
    if (game.iteration == 0){
      //first click of the game.
      game.setup();
      //reveal some things.
      goButton.innerHTML = "PROGRESS";
      toggleButton.style.display = "inline";
      newDestButton.style.display = "inline";
      recipeButton.style.display = "inline";
      document.getElementById("frontside").style.display = "block";
      moreCrewInfoBtn.style.display = "block";
      //--> go...
      game.go();
    } else {
      //===TRAVEL: animation===//
      var anim = document.getElementById("shipAnimDiv");
      anim.style.animation = "slide 2s linear infinite";
      if (!NO_DELAY){
        goButton.disabled = true;
        goButton.innerHTML = "TRAVELLING";
        window.setTimeout(andProgress,DELAY);
      } else {
        //just go there immediately (debug only)
        andProgress();
      }
      //----------------------//
    }
  } else {
    updateControlPanelNotifs("");
    game.spaceStationGo();
  }
}

//====after animation (travel delay)=====//
function andProgress(){
  //--testing:animation---//
  goButton.innerHTML = "PROGRESS"; //reset this.
  goButton.disabled = false; //enable button once more.
  var anim = document.getElementById("shipAnimDiv");
  anim.style.animation = "slide 60s linear infinite";
  //----------------------//
  game.go();
}

//=============[hiring stuff]===============//

addPersonButton.onclick = function(){
  //add the person in question to the ship
  //----> hide the extra option buttons.
  motiveDiv.style.display = "none";
  //----> continue
  if (game.possibleCrewMember != null){
    //============================//
    //0. check if there's too many people!
    if (game.ship.people.length > MAX_CREW){
      strangerDesc_Element.innerHTML = "Your ship is full.";
      return;
    }
    //============================//
    //-->Check if that person is a crew member already
    //-> using Array.prototype.map() to do so in one line, via the person's unique ID
    var check = game.ship.people.map(function(p){ return p.id; }).indexOf(game.possibleCrewMember.id);
    if (check == -1){
      //a. They're NOT in the crew, everything's a go.
      //=================================//
      game.possibleCrewMember.hiringStage = handleHiringStage(game.possibleCrewMember.hiringStage, true);
      //=================================//
    } else {
      //b. They ARE in the crew, so let the player know.
      strangerDesc_Element.innerHTML = "Um, you already hired " + game.possibleCrewMember.name + ".";
    }
  } else {
    console.log("Error: possible crew member doesn't exist.");
    strangerDesc_Element.innerHTML = "And you're hiring... who?";
  }
  //TODO: update relevant HTML (note: but don't need to get rid of stranger-button or anything)
}

//----------------//
//input: stage(int) and goToNext(boolean)
function handleHiringStage(currentStage, goToNext){
  addPersonButton.style.display = "inline";
  motiveDiv.style.display = "none";
  //-->...
  var stage = currentStage;
  //--> if specified, go to next stage.
  if (goToNext){
    if (stage < 3){
      stage++;
    }
  }
  //--> continue on...
  if (stage == 0){
    strangerDesc_Element.innerHTML = "Turns out the stranger's name is " + game.possibleCrewMember.name;
    if (game.possibleCrewMember.title != ""){
      if (game.possibleCrewMember.title == "Engineer"){
        strangerDesc_Element.innerHTML += ", and they're an " + game.possibleCrewMember.title + ".";
      } else {
        strangerDesc_Element.innerHTML += ", and they're a " + game.possibleCrewMember.title + ".";
      }
    } else {
      strangerDesc_Element.innerHTMl += ".";
    }
    addPersonButton.innerHTML = " HIRE ";

  } else if (stage == 1){
    setupMotiveButtons();
    motiveDiv.style.display = "block";
    addPersonButton.style.display = "none"
    strangerDesc_Element.innerHTML = game.possibleCrewMember.name + " stares at you for a moment, then asks, 'Why should I join you?'";

  } else if (stage == 2){
    strangerDesc_Element.innerHTML = "'Um, " + game.possibleCrewMember.guessedMotive + "?' you try.";
    motiveDiv.style.display = "none";
    addPersonButton.style.display = "inline";
    addPersonButton.innerHTML = "CONTINUE";

  } else if (stage == 3){
    //----[ HIRING ]----//
    addPersonButton.style.display = "none";
    if (game.possibleCrewMember.guessedMotive == game.possibleCrewMember.motive){
      strangerDesc_Element.innerHTML = game.possibleCrewMember.name + "'s eyes light up. 'Well why didn't you say so! I'm in.'<br>";
      strangerDesc_Element.innerHTML += game.possibleCrewMember.name + " has been hired!";
      game.addNewPersonToShip(game.possibleCrewMember, game.ship);
      //note: don't bother removing person from station (or planet, same thing)
      //...logic-wise, they're still ON the planet/station until you've taken off...
      //... so it's okay.
      //-> increase stage here.
      stage++;
    } else {
      //failure...
      strangerDesc_Element.innerHTML = game.possibleCrewMember.name + " laughs at you. '" + capitalize(game.possibleCrewMember.guessedMotive) + ", really? <i>Really?</i>'  Before you can change your answer " + game.possibleCrewMember.name + " is gone.";
      stage += 2;
    }

  } else if (stage == 4){
    strangerDesc_Element.innerHTML = game.possibleCrewMember.name + " is now a member of your crew.";

  } else if (stage == 5){
    strangerDesc_Element.innerHTML = "..."; //failure.

  } else {
    console.log("Error when hiring.");
    strangerDesc_Element.innerHTML = "...";
  }
  return stage;
}
//---------------//

function setupMotiveButtons(){
  //-> set up motive buttons!
  var trueMotive = game.possibleCrewMember.motive;
  //-> choose a random wrong motive; can't be the true motive of course.
  var falseMotiveIndex = random(MOTIVES.length);
  if (MOTIVES[falseMotiveIndex] == trueMotive){
    falseMotiveIndex = (falseMotiveIndex+1) % MOTIVES.length;
  }
  if (random(2) == 0){
    motiveButton1.innerHTML = trueMotive;
    motiveButton2.innerHTML = MOTIVES[falseMotiveIndex];
  } else {
    motiveButton1.innerHTML = MOTIVES[falseMotiveIndex];
    motiveButton2.innerHTML = trueMotive;
  }
}

strangerButton0.onclick = function(){
  handleStrangerClicks(0);
}
strangerButton1.onclick = function(){
  handleStrangerClicks(1);
}
strangerButton2.onclick = function(){
  handleStrangerClicks(2);
}
strangerButton3.onclick = function(){
  handleStrangerClicks(3);
}

function handleStrangerClicks(index){
  if (game.peopleInStation.length > 0){
    game.possibleCrewMember = game.peopleInStation[index];
    game.possibleCrewMember.hiringStage = handleHiringStage(game.possibleCrewMember.hiringStage, false);

  } else {
    console.log("Error: no people here.");
    strangerDesc_Element.innerHTML = "-null-";
  }
}


motiveButton1.onclick = function(){
  handleMotiveClick(motiveButton1.innerHTML);
}
motiveButton2.onclick = function(){
  handleMotiveClick(motiveButton2.innerHTML);
}

function handleMotiveClick(chosenMotive){
  game.possibleCrewMember.guessedMotive = chosenMotive;
  game.possibleCrewMember.hiringStage = handleHiringStage(game.possibleCrewMember.hiringStage, true);
}
//================================================//


//TOGGLE BUTTON = dock/take off button! :)
toggleButton.onclick = function(){
  //for the moment, toggles between space station and the main view
  //implement the changes: for now, right column
  if (game.view == MAIN_VIEW){
    //-> STATION VIEW or EVIL VIEW <--//
    if (game.ship.whichCelestialBody != null && game.ship.dockingPossible){

      if (game.ship.whichCelestialBody.type == "evil"){
        //===[ 1) EVIL ]===//
        updateControlPanelNotifs("approaching...");
        game.view = SPACE_STATION_VIEW;
        game.ship.inFlight = false;
        //----HTML----//
        //-> hide all normal columns
        c1 = document.getElementsByClassName("shipcolumn")[0];
        c2 = document.getElementsByClassName("centercolumn")[0];
        c3 = document.getElementsByClassName("logcolumn")[0];
        c1.style.display = "none";
        c2.style.display = "none";
        c3.style.display = "none";
        //-> display the evilDiv
        evilDiv = document.getElementById("evilDiv");
        evilDiv.style.display = "block";

      } else {
        //===[ 2) NORMAL SPACE-STATION VIEW ]===//
        updateControlPanelNotifs("docking...");
        game.view = SPACE_STATION_VIEW;
        game.ship.inFlight = false;
        game.ship.firstMateDuties(); //first mate performs station duties.
        //----HTML----//
        toggleButton.innerHTML = "TAKE OFF";
        logText_Element.innerHTML = "...";
        rightColumnTitle_Element.innerHTML = "OBSERVATIONS";
        confirmPurchaseText.innerHTML = "...";
        //------------//
        shipViewVisibilityOn(false);
        tradeDivVisibilityOn(true);
        strangersVisibilityOn(true);
        //immediate results:
        game.updateJourneyInfoHTML();
        game.spaceStationGo();
        //-----------//
      }

    } else {
      updateControlPanelNotifs("docking impossible");
    }
  } else {
    //=====[ MAIN (INFLIGHT) VIEW ]=====//
    shiftToMainView("taking off...");
  }
}

function shiftToMainView(message){
  //===[ SHIFT TO SPACE (MAIN) VIEW ]===// (ie Taking off)
  updateControlPanelNotifs(message);
  game.view = MAIN_VIEW;
  game.ship.inFlight = true;
  //----HTML----//
  toggleButton.innerHTML = "DOCK";
  strangerDesc_Element.innerHTML = "";
  rightColumnTitle_Element.innerHTML = "LOG";
  //------------//
  shipViewVisibilityOn(true);
  tradeDivVisibilityOn(false);
  strangersVisibilityOn(false);
  //immediate results:
  game.go();
}


//OPEN modal
newDestButton.onclick = function() {
  //set up modal first
  modalText_Element.innerHTML = "Destination: ";
  if (game.galaxy != null){
    if (game.ship.currentJourney != null){
      modalText_Element.innerHTML += game.ship.currentJourney.destination.name;
    }
    //finally,display the modal
    modal.style.display = "block";
    //==================//
  } else {
    console.log("Error: galaxy is null.");
  }
}


//button in the modal: set the destination specified
modalGoButton.onclick = function() {
  if (game.possibleJourney != null && game.possibleJourney.destination != null){
    //-> SET THE OFFICIAL JOURNEY
    game.ship.currentJourney = game.possibleJourney;
    //-> update html right away
    game.updateJourneyInfoHTML();
    //-> temporary value, possibleJourney, is reset
    game.possibleJourney = null;
    modal.style.display = "none";
  } else {
    modalText_Element.innerHTML = "--Please select a destination--";
  }
}
//------[closing modal stuff]------//

//closing modal: click exit, exit
span.onclick = function() {
  modal.style.display = "none";
}

//closing modal: if clicked outside of modal, exit
window.onclick = function(event){
  //console.log("clickety : " + event.target.id);
  var insideMainModal = (event.target.parentElement.id == "mainmodal"
              || event.target.parentElement.id == "modalcontent"
              || event.target.id == "mainmodal"
              || event.target.id == "newDestButton");
  var insideRecipeModal = (event.target.parentElement.id == "recipemodal"
              || event.target.id == "mainmodal"
              || event.target.id == "recipeButton");
  if ((modal.style.display == 'block') && (!insideMainModal)) {
    modal.style.display = "none";
  }
  if ((recipemodal.style.display == 'block') && (!insideRecipeModal)) {
    recipemodal.style.display = "none";
  }
}

//----[ GALAXY-MAP PLANET BUTTONS ]----//
//-> if adding a new planet, have to set manually (sorry)
planet0.onclick = function(){
  handleCelestialBodyClicks(0, "planet");
}
planet1.onclick = function(){
  handleCelestialBodyClicks(1, "planet");
}
planet2.onclick = function(){
  handleCelestialBodyClicks(2, "planet");
}
planet3.onclick = function(){
  handleCelestialBodyClicks(3, "planet");
}
//----[ GALAXY-MAP SPACE STATION BUTTONS ]----//
station0.onclick = function(){
  handleCelestialBodyClicks(0, "station");
}
station1.onclick = function(){
  handleCelestialBodyClicks(1, "station");
}
station2.onclick = function(){
  handleCelestialBodyClicks(2, "station");
}
evilButton.onclick = function(){
  handleCelestialBodyClicks(0, "evil");
}

//--------------------------------//
function handleCelestialBodyClicks(index, type){
  var string = "";

  if (type == "planet"){
    string = "Destination: " + game.galaxy.planets[index].name;
    if (!game.galaxy.planets[index].discovered){
      string += " <u>(you haven't been here yet)</u>";
    }
    // days == distance / velocity
    var timespan = getDistance(game.galaxy.planets[index].coords, game.ship.currentLoc) / game.ship.velocity;
    game.possibleJourney = new Journey(game.galaxy.planets[index], timespan|0); //pass in the celestialObject

  } else if (type == "station"){
    var station = game.galaxy.spaceStations[index];
    string = "Destination: " + station.name + " [" + station.faction.name + "]" + "<br>Note: " + station.faction.getRelation();
    if (!station.discovered){
      string += " <u>(you haven't been here yet)</u>";
    }
    var timespan = getDistance(game.galaxy.spaceStations[index].coords, game.ship.currentLoc) / game.ship.velocity;
    game.possibleJourney = new Journey(game.galaxy.spaceStations[index], timespan|0); //pass in the celestialObject

  } else if (type == "evil"){
    var evil = game.galaxy.evil;
    string = "Destination: " + evil.name;
    var timespan = getDistance(game.galaxy.evil.coords, game.ship.currentLoc) / game.ship.velocity;
    game.possibleJourney = new Journey(game.galaxy.evil, timespan|0);

  } else {
    console.log("Error: something went wrong when clicking on celestial body.");
    string = "...?";
  }

  //--> finally, set the HTML element
  modalText_Element.innerHTML = string;


}
//-----------------[ TRADE STUFF ]-----------------//


//~~~~~~~~~~~~~~~~~~~~~~~~//

//--[BROWSE CARGOS (specifically TECH) FOR SALE]--//
leftPurchaseButton.onclick = function(){
  var numCargoForSale = game.ship.whichCelestialBody.techForSale.length;
  game.browseCargoIndex = (game.browseCargoIndex - 1).mod(numCargoForSale);
  game.possibleItemToBuy = game.ship.whichCelestialBody.techForSale[game.browseCargoIndex];
  cargoPurchaseButton.innerHTML = game.possibleItemToBuy.name;
}
//--[BROWSE CARGOS FOR SALE]--//
rightPurchaseButton.onclick = function(){
  var numCargoForSale = game.ship.whichCelestialBody.techForSale.length;
  game.browseCargoIndex = (game.browseCargoIndex + 1).mod(numCargoForSale);
  game.possibleItemToBuy = game.ship.whichCelestialBody.techForSale[game.browseCargoIndex];
  cargoPurchaseButton.innerHTML = game.possibleItemToBuy.name;
}
//--a click here expresses intention to buy the cargo. (Must confirm to actually buy)
cargoPurchaseButton.onclick = function(){
  if (!game.possibleItemToBuy){
    confirmPurchaseText.innerHTML = "...";
  } else {
    confirmPurchaseText.innerHTML = "Buy the " + game.possibleItemToBuy.name + "? Price: " + game.possibleItemToBuy.cost + " units.";
  }
}

commodityAButton.onclick = function(){
  var comm = game.ship.whichCelestialBody.commoditiesForSale[0]; //for now just the first.
  game.possibleItemToBuy = comm;
  confirmPurchaseText.innerHTML = "Buy bushel of " + comm.name + "? Price: " + game.possibleItemToBuy.cost + " units.";
}

commodityBButton.onclick = function(){
  //TODO..
}

confirmPurchaseButton.onclick = function(){
  if (!game.possibleItemToBuy){
    confirmPurchaseText.innerHTML = "Please choose something to buy.";
    return;
  }
  //-> check if you have enough funds!
  if (game.ship.funds < game.possibleItemToBuy.cost){
    confirmPurchaseText.innerHTML = "Whoops, you can't afford that.";
    return;
  }
  //-> if good, subtract money from your funds.
  game.ship.funds -= game.possibleItemToBuy.cost;
  //-> continue on...
  confirmPurchaseText.innerHTML = "Thank you! " + capitalize(game.possibleItemToBuy.name) + " purchased.";
  if (game.possibleItemToBuy.type == "tech"){
    game.ship.cargo.push(game.possibleItemToBuy);
    //display that last thing you added (inventory):
    inventoryText.innerHTML = game.ship.cargo[game.ship.cargo.length-1].name;
  } else if (game.possibleItemToBuy.type == "commodity"){
    game.ship.wheat++;
  }
  //--> at last, update ship information.
  game.updateJourneyInfoHTML(); //update bushel count / funds
}

//~~~~~~~~~~~inventory stuff~~~~~~~~~~~~~//

//display cargo!
leftInventoryButton.onclick = function(){
  updateInventoryText(-1);
}
rightInventoryButton.onclick = function(){
  updateInventoryText(1);
}

//adjustor should be -1 or +1
function updateInventoryText(adjustor){
  if (game.ship.cargo.length <= 0){
    inventoryText.innerHTML = "-- empty --";
    return;
  }
  game.browseInventoryIndex = (game.browseInventoryIndex + adjustor).mod(game.ship.cargo.length);
  inventoryText.innerHTML = game.ship.cargo[game.browseInventoryIndex].name;
}

//=====[ add item in inventory to COMBINER (fusedevice) ]=====//
addToCombinerButton.onclick = function(){
  if (game.ship.cargo.length <= 0){
    return;
  }
  combinerText.innerHTML = "";
  //pop and unshift.
  game.ship.combiner.unshift(game.ship.cargo[game.browseInventoryIndex]); //add element to beginning
  game.ship.combiner.pop(); //remove last element
  //finally, remove from ship.cargo
  game.ship.cargo.splice(game.browseInventoryIndex, 1);
  //===PRINT===//
  updateCombinerText();
  updateInventoryText(-1);
}

function updateCombinerText(){
  var first = "";
  var second = "";
  if (!game.ship.combiner[0]){
    first = "________";
  } else {
    first = game.ship.combiner[0].name;
  }
  if (!game.ship.combiner[1]){
    second = "________";
  } else {
    second = game.ship.combiner[1].name;
  }
  combinerText.innerHTML = first + " + " + second;
}

//----[ ATTEMPT TO COMBINE ITEMS ]----//
cargoCombineButton.onclick = function(){
  if (!game.ship.combiner[0] || !game.ship.combiner[1]){
    combinationText.innerHTML = "Need 2 items to combine!";
  } else {
    combinationText.innerHTML = "Wow, combined!";
    game.ship.combiner = [null, null];
    updateCombinerText();
  }
}

//----[ EMPTY OUT COMBINER (put items back into inventory) ]----//
cargoEmptyButton.onclick = function(){
  if (game.ship.combiner[0] != null){
    game.ship.cargo.push(game.ship.combiner[0]);
  }
  if (game.ship.combiner[1] != null){
    game.ship.cargo.push(game.ship.combiner[1]);
  }
  game.ship.combiner = [null, null];
  combinationText.innerHTML = "Fusedevice is empty.";
  updateCombinerText();
}
//~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~//

function updateVendorText(){
  var str = "";
  var buttonStr = "";
  var game_stage = 0;

  str = game.ship.whichCelestialBody.vendor.getGreetingDialogue(game.game_stage);
  buttonStr = game.ship.whichCelestialBody.vendor.getYourGreeting(game.game_stage);

  vendorButton.innerHTML = buttonStr;
  vendorText.innerHTML = str;
}

//--> conversation with the vendor.
vendorButton.onclick = function(){
  var str = "";
  str = game.ship.whichCelestialBody.vendor.getNextDialogue(game.game_stage);
  if (game.ship.whichCelestialBody.vendor.dialogueAllDone()){
    //disable button.
    console.log("disabled");
    vendorButton.innerHTML = ".....";
    vendorButton.disabled = true;
  }
  if (game.ship.whichCelestialBody.vendor.gaveRecipe){
    recipeTexts_full = [recipeTextA_full, recipeTextB_full, recipeTextC_full];
    for (var i = 0; i < recipeTexts_full.length; i++){
      if (recipeTexts_full[i].innerHTML == ""){
        recipeTexts_full[i].innerHTML = game.galaxy.finalTech[i].getRecipe();
        break;
      }
    }
  }
  //----------//
  vendorText.innerHTML = str;
  game.updateJourneyInfoHTML();
}

//----------------------------------//
//----------------------------------//

//---SLIDESHOW BUTTONS (CREWMEMBERS)
leftSlideshowButton.onclick = function(){
  if (game.ship != null){
    if (game.ship.people.length <= 0){
      return;
    }
    game.slideshowIndex -= 1;
    game.slideshowIndex = game.slideshowIndex.mod(game.ship.people.length);
    if (moreCrewInfoBtn.innerHTML == "MORE INFO"){
      //go to next front of card
      game.updateCrewSlideshow();
    } else {
      //go to next back of card
      game.displayMorePersonInfo();
    }
  } else {
    console.log("Error: ship is null.");
  }

}
rightSlideshowButton.onclick = function(){
  if (game.ship != null){
    if (game.ship.people.length <= 0){
      return;
    }
    game.slideshowIndex += 1;
    game.slideshowIndex = game.slideshowIndex.mod(game.ship.people.length);
    if (moreCrewInfoBtn.innerHTML == "MORE INFO"){
      //go to next front of card
      game.updateCrewSlideshow();
    } else {
      //go to next back of card
      game.displayMorePersonInfo();
    }

  } else {
    console.log("Error: ship is null.");
  }
}

moreCrewInfoBtn.onclick = function(){
  if (game.ship != null){
    if (game.ship.people.length <= 0){
      return;
    }
    if (moreCrewInfoBtn.innerHTML == "MORE INFO"){
      //FLIP TO 'side 2'
      //1. change button
      moreCrewInfoBtn.innerHTML = "BACK";
      //2. hide + display
      document.getElementById("frontside").style.display = "none";
      document.getElementById("flipside").style.display = "block";
      //crewCanvas.style.display = "none";
      //3. add
      game.displayMorePersonInfo();
    } else {
      flipToFront();
    }
  } else {
    console.log("Error: ship is null.");
  }
}

function flipToFront(){
  //FLIP TO 'front side'
  //1. change button
  moreCrewInfoBtn.innerHTML = "MORE INFO";
  //2. hide + display
  document.getElementById("flipside").style.display = "none";
  document.getElementById("frontside").style.display = "block";
  //crewCanvas.style.display = "block";
  //3. re-write
  game.updateCrewSlideshow(false);
}

//----------------------------------//

evilInteractionButton.onclick = function(){
  //-> hide the evilDiv
  evilDiv = document.getElementById("evilDiv");
  evilDiv.style.display = "none";
  //reveal once more.
  c1 = document.getElementsByClassName("shipcolumn")[0];
  c2 = document.getElementsByClassName("centercolumn")[0];
  c3 = document.getElementsByClassName("logcolumn")[0];
  c1.style.display = "block";
  c2.style.display = "block";
  c3.style.display = "block";
  // shift back to main / inflight view
  shiftToMainView("Retreating...");
}

//----------------------------------//

recipeButton.onclick = function(){
  //update the content of the modal, anytime you open it.
  var recipeTexts = [recipeTextA, recipeTextB, recipeTextC];
  //note: recipeTextA,B,C_full are filled in elsewhere (as you discover them.)
  for (var i = 0; i < game.galaxy.finalTech.length; i++){
    recipeTexts[i].innerHTML = "<mark>" + game.galaxy.finalTech[i].name + "</mark>";
    recipeTexts[i].innerHTML += "<br>";
  }
  recipemodal.style.display = "block";
}


//----------------------------------//

console.log("Done!");
