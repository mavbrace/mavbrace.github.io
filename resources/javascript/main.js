//-------<[ GAME ]>-------//
var MAIN_VIEW = 0;
var SPACE_STATION_VIEW = 1;

//1. start a new game
var game = new Game();


//----------[ BUTTONS! ]-----------//
goButton.onclick = function(){
  if (game.view == MAIN_VIEW){
    updateControlPanelNotifs("");
    if (game.iteration == 0){
      game.setup();
    }
    game.go();
  } else {
    updateControlPanelNotifs("");
    game.spaceStationGo();
  }
}


resetButton.onclick = function(){
  game.iteration = 0;
  game.setup();
  game.go();
}


addPersonButton.onclick = function(){
  //add the person in question to the ship
  if (game.possibleCrewMember != null){
    //-->Check if that person is a crew member already
    //-> using Array.prototype.map() to do so in one line, via the person's unique ID
    var check = game.ship.people.map(function(p){ return p.id; }).indexOf(game.possibleCrewMember.id);
    if (check == -1){
      //a. They're NOT in the crew.
      strangerDesc_Element.innerHTML = game.possibleCrewMember.name + " has been hired!";
      game.addNewPersonToShip(game.possibleCrewMember, game.ship);
      //note: don't bother removing person from station (or planet, same thing)
      //...logic-wise, they're still ON the planet/station until you've taken off...
      //... so it's okay.
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

//TOGGLE BUTTON = dock/take off button! :)
toggleButton.onclick = function(){
  //for the moment, toggles between space station and the main view
  //implement the changes: for now, right column
  if (game.view == MAIN_VIEW){
    //===[ SHIFT TO STATION VIEW ]===// (ie DOCK)
    if (game.ship.whichCelestialBody != null && game.ship.dockingPossible){
      updateControlPanelNotifs("docking...");
      game.view = SPACE_STATION_VIEW;
      game.ship.inFlight = false;
      //----HTML----//
      toggleButton.innerHTML = "TAKE OFF";
      logText_Element.innerHTML = "...";
      rightColumnTitle_Element.innerHTML = "OBSERVATIONS";
      purchaseItemText.innerHTML = "...";
      updateBuyerText();
      //------------//
      toggleShipViewVisibility();
      toggleTradeDivVisibility();
      toggleStrangersVisibility();
      //immediate results:
      game.updateJourneyInfoHTML();
      game.spaceStationGo();
    } else {
      updateControlPanelNotifs("docking impossible");
    }
  } else {
    //===[ SHIFT TO SPACE (MAIN) VIEW ]===// (ie Taking off)
    updateControlPanelNotifs("taking off...");
    game.view = MAIN_VIEW;
    game.ship.inFlight = true;
    //----HTML----//
    toggleButton.innerHTML = "DOCK";
    strangerDesc_Element.innerHTML = "";
    rightColumnTitle_Element.innerHTML = "LOG";
    //------------//
    toggleShipViewVisibility();
    toggleTradeDivVisibility();
    toggleStrangersVisibility();
    //immediate results:
    game.go();
  }
}


function updateBuyerText(){
  var str = "";
  if (game.ship.cargo.length > 0){
    if (game.ship.craftedCargoWorth != 0){
      //if there's a crafted item:
      var p = game.ship.whichCelestialBody.sellPercentage;
      var price = (game.ship.craftedCargoWorth * (p/100))|0;
      str = "I see you have a " + game.ship.craftedCargoName + ".";
      str += " I'll give you " + price + " for it.";
      game.ship.cargoOffer = [-1, price];
    } else {
      var r = random(game.ship.cargo.length);
      var p = game.ship.whichCelestialBody.sellPercentage;
      var price = (game.ship.cargo[r].worth * (p/100))|0;
      str = "I can give you " + price + " for that ";
      str += game.ship.cargo[r].name + " you have.";
      game.ship.cargoOffer = [r, price];
    }
  } else {
    str = "-out to lunch-";
  }
  sellingText.innerHTML = str;
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
  var inside = (event.target.parentElement.id == "mainmodal"
              || event.target.parentElement.id == "modalcontent"
              || event.target.id == "mainmodal"
              || event.target.id == "newDestButton");
  if ((modal.style.display == 'block') && (!inside)) {
    modal.style.display = "none";
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

  if (type == "planet"){
    modalText_Element.innerHTML = "Destination: " + game.galaxy.planets[index].name;
    // days == distance / velocity
    var timespan = getDistance(game.galaxy.planets[index].coords, game.ship.currentLoc) / game.ship.velocity;
    game.possibleJourney = new Journey(game.galaxy.planets[index], timespan|0); //pass in the celestialObject

  } else if (type == "station"){
    var station = game.galaxy.spaceStations[index];
    modalText_Element.innerHTML = "Destination: " + station.name;
    modalText_Element.innerHTML += " [" + station.faction.name + "]";
    modalText_Element.innerHTML += "<br>Note: " + station.faction.getRelation();
    var timespan = getDistance(game.galaxy.spaceStations[index].coords, game.ship.currentLoc) / game.ship.velocity;
    game.possibleJourney = new Journey(game.galaxy.spaceStations[index], timespan|0); //pass in the celestialObject

  } else if (type == "evil"){
    var evil = game.galaxy.evil;
    modalText_Element.innerHTML = "Destination: " + evil.name;
    var timespan = getDistance(game.galaxy.evil.coords, game.ship.currentLoc) / game.ship.velocity;
    game.possibleJourney = new Journey(game.galaxy.evil, timespan|0);

  } else {
    console.log("Error: something went wrong when clicking on celestial body.");
  }

}
//-----------------[ TRADE STUFF ]-----------------//
//--> if you click on an item, reveal text and ok button (TODO)
tradeItemButton0.onclick = function(){
  handleTradeItemClicks(0);
}
tradeItemButton1.onclick = function(){
  handleTradeItemClicks(1);
}
tradeItemButton2.onclick = function(){
  handleTradeItemClicks(2);
}

function handleTradeItemClicks(index){
  purchaseItemText.innerHTML = "PURCHASE ITEM?";
  if (game.ship.whichCelestialBody != null){
    game.possiblePurchasedTradeItem = game.ship.whichCelestialBody.tradeItemsAvailable[index];
    purchaseItemText.innerHTML += " " + game.ship.whichCelestialBody.tradeItemsAvailable[index].name;
    var p = game.ship.whichCelestialBody.sellPercentage;
    var price = (game.ship.whichCelestialBody.tradeItemsAvailable[index].worth * (p/100))|0;
    purchaseItemText.innerHTML += " [ " + price + " units ]";
    console.log("worth..." + game.ship.whichCelestialBody.tradeItemsAvailable[index].worth);
  } else {
    console.log("Error printing out item.");
    purchaseItemText.innerHTML += " -null-";
  }
}

purchaseTradeItemButton.onclick = function(){
  //-> have you selected a part?
  if (game.possiblePurchasedTradeItem == null){
    purchaseItemText.innerHTML = "Please select a shipment to purchase.";
    return;
  }
  //-> is there room?
  if (game.ship.cargo.length >= MAX_CARGO){
    purchaseItemText.innerHTML = "Looks like you don't have room for that.";
    return;
  }
  //-> finally, do you have enough money?
  var p = game.ship.whichCelestialBody.sellPercentage;
  var price = (game.possiblePurchasedTradeItem.worth * (p/100))|0;
  if (game.ship.funds < price){
    purchaseItemText.innerHTML = "Seems you can't afford that."
    return;
  }
  //--- SUCCESS ---//
  game.ship.funds -= price;
  game.ship.cargo.push(game.possiblePurchasedTradeItem);
  purchaseItemText.innerHTML = "Thank you. Please come again.";
  //-> UPDATE RELEVANT HTML <-/
  game.updateJourneyInfoHTML();
  updateBuyerText();
  drawCargo();
  //---------------//
}

acceptSaleButton.onclick = function(){
  if (game.ship.cargoOffer.length > 0){
    var str = "";
    if (game.ship.cargoOffer[0] == -1){
      str = "sold.";
      game.ship.cargo = [];
    } else {
      str = "sold.";
      game.ship.cargo.splice(game.ship.cargoOffer[0], 1);
    }
    game.ship.funds += game.ship.cargoOffer[1];
    game.updateJourneyInfoHTML();
    game.ship.clearCraftedCargoInfo();
    shipCargoMessage.innerHTML = "";
    shipCargoCraftedName.innerHTML = "";
    updateBuyerText();
    drawCargo();
  } else {
    sellingText.innerHTML = "-out to lunch-";
  }
}

//TODO: this.
cargoCombineButton.onclick = function(){
  if (game.ship.cargo.length < MAX_CARGO){
    shipCargoMessage.innerHTML = "-need " + MAX_CARGO + " parts to combine-";
  } else {
    shipCargoMessage.innerHTML = "COMBINING...";
    game.ship.setCraftedCargoInfo();
    shipCargoMessage.innerHTML += "<br>Created a " + game.ship.craftedCargoName;
    shipCargoCraftedName.innerHTML = game.ship.craftedCargoName;
    updateBuyerText();
    console.log("CODE: "  + game.ship.cargo[0].worth + "-" + game.ship.cargo[1].worth + "-" + game.ship.cargo[2].worth);
  }
}

//TODO: and this.
swapAroundButton.onclick = function(){
  //re-arrange order of cargo parts (the list is shifted up and around)
  var reOrderedCargo = [];
  for (var i = 0; i < game.ship.cargo.length; i++){
    var shiftedIndex = (i + 1) % game.ship.cargo.length;
    reOrderedCargo.push(game.ship.cargo[shiftedIndex]);
  }
  game.ship.cargo = reOrderedCargo;
  drawCargo();

}

function drawCargo(){
  shipCargoSymbols.innerHTML = "";
  for (var i = 0; i < game.ship.cargo.length; i++){
    shipCargoSymbols.innerHTML += game.ship.cargo[i].symbol + "<br>";
  }
}
//----------------------------------//

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
  strangerDesc_Element.innerHTML = "STRANGER: ";
  if (game.peopleInStation.length > 0){
    game.possibleCrewMember = game.peopleInStation[index];
    strangerDesc_Element.innerHTML = game.possibleCrewMember.name;
  } else {
    console.log("Error: no people here.");
    strangerDesc_Element.innerHTML = "-null-";
  }
}

//----------------------------------//

//---SLIDESHOW BUTTONS (CREWMEMBERS)
leftSlideshowButton.onclick = function(){
  if (game.ship != null){
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
    if (moreCrewInfoBtn.innerHTML == "MORE INFO"){
      //FLIP TO 'side 2'
      //1. change button
      moreCrewInfoBtn.innerHTML = "BACK";
      //2. remove
      crewCanvas.style.display = "none";
      //3. add
      game.displayMorePersonInfo();
    } else {
      //FLIP TO 'front side'
      //1. change button
      moreCrewInfoBtn.innerHTML = "MORE INFO";
      //2. add
      crewCanvas.style.display = "block";
      //3. re-write
      game.updateCrewSlideshow(false);
    }
  } else {
    console.log("Error: ship is null.");
  }
}

//----------------------------------//



console.log("Done!");