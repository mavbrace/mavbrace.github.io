//-----[ GAME ]------//

class Game {
  constructor(){
    this.galaxy = null;
    this.ship = null;
    this.view = 0;  // 0 = Main View // 1 = Space Station
    this.iteration = 0;
    this.peopleInStation = [];
    this.IDcounter = 0;
    //IDCounter: for assigning a unique id to each and every person created...
    //...whether or not they are added to the ship
    //Event Keeper -> key:time left in event IN DAYS
    this.event_keeper = {"space debris":0,
                          "enemy ship":0  };
    //--- possibilities ---//
    this.possibleJourney = ""; //A Journey as set in the MODAL, not the official journey!!!
    this.possiblePurchasedTradeItem = null; // when docked, a trade item you are considering buying.
    this.possibleCrewMember = null; //A Person, ie a stranger, when docked, you are considering hiring.
    //-- crew slideshow --//
    this.slideshowIndex = -1; //corresponds to index of ship.people: -1 means nobody is shown.
  }

  tickToClockTime(tick){
    //testing this: 1 tick = 1 hour, even if there's less than 24 ticks.
    var partOfDay = tick % TICK_BUNDLE;
    var timeString = "" + partOfDay + ":00";
    return timeString;
  }

  //--SETUP--//
  setup(){

    this.galaxy = new Galaxy();
    this.ship = new Ship("Reliant");

    // clear some html elements
    shipStatusText_Element.innerHTML = "[ 100 | 100 | 100 | 100 | 100]"
    debugText.innerHTML = "";
    shipCargoSymbols.innerHTML = "";
    // reset slideshow
    this.slideshowIndex = -1;

    this._plotPlanets(); //set up planet buttons (which appear in the modal)
    this._plotStations(); //set up station buttons (...)
    this._plotEvil(); //set up evil button (...)

    for (var i = 0; i < NUMBER_OF_INIT_PEOPLE; i++){
      var tempPerson = this.personGenerator();
      this.ship.people.push(tempPerson);
    }
    if (NUMBER_OF_INIT_PEOPLE > 0){
      this.slideshowIndex = 0; // show first person in slideshow.
    }

    this.updateCrewSlideshow();

  }


  //--GO--//
  go(){
    //0. update location AND draw new location on MODAL
    if (this.ship.currentJourney != null){
      if (this.ship.currentJourney.isDone()){
        this.ship.dockingPossible = true;  //journey's end
        this.ship.whichCelestialBody = this.ship.currentJourney.destination;
        this.ship.currentJourney = null;
      } else {
        this.ship.dockingPossible = false;  //can't dock in the middle of nowhere
        this.ship.whichCelestialBody = null; //nope
        this.ship.currentJourney.progressJourney();
        this.ship.currentLoc = nextPoint(this.ship.currentLoc, this.ship.currentJourney.destination.coords, this.ship.velocity);
      }
    }
    this._plotLocation(this.ship.currentLoc[0], this.ship.currentLoc[1]);

    console.log("----[ BEGINNING DAY ]----");
    //1. clear heading
    logText_Element.innerHTML = "";

    for (var i = 0; i < TICK_BUNDLE; i++) {

      for (var j = 0; j < this.ship.people.length; j++) {
        this.ship.people[j].waitingForTasks();
      }
      for (var j = 0; j < this.ship.people.length; j++){
        this.ship.people[j].manageTasks();
      }
      for (var j = 0; j < this.ship.people.length; j++) {
        this.ship.people[j].endTasks();
      }

      this.ship.tick++; // advancing time
    }


    //---------[ UPDATE SHIP'S LOG ]----------//
    //-> CLEAR SHIPLOG FROM BEFORE
    var shipLog = []; //array of length TICK_BUNDLE
    //-> POPULATE WITH EMPTY STRINGS, READY TO BE FILLED (SOME TICKS REMAIN EMPTY)
    for (var i = 0; i < TICK_BUNDLE; i++){
      shipLog.push("");
    }
    //->GENERATE THE LOG BY GATHERING, FOR EACH PERSON, THEIR PERSONAL LOGS
    for (var i = 0; i < this.ship.people.length; i++){
      var personalLog = this.ship.people[i].log;
      //TODO: clear each person's old logs so they don't build up forever
      for (var j = 0; j < personalLog.length; j++){
        shipLog[personalLog[j][0] - (TICK_BUNDLE * this.iteration)] += personalLog[j][1] + " ";
      }
    }
    //---finished updating ship's log---//

    //--[ Add necessary wear-and-tear to ship, etc ]--//
    //----> change how this is done, maybe?
    this.ship.updateShip(this.iteration);
    //----------[ EVENTS ]----------//
    this.handleEvents();
    //-----------------------------------------------//
    //-[ GO TO NEXT 'ITERATION' ]-//
    this.iteration++;
    //----------------------------//
    //----[ WARNINGS  ]----//
    warningsText_Element.innerHTML = "WARNINGS: ";
    warningsText_Element.innerHTML += this.ship.getWarningsAsString();
    //--------------------//
    this._updateHTML(shipLog);

  }


  _updateHTML(shipLog){
    //-----update info-----//
    //--> ADD LOG TO HTML <--//
    for (var i = 0; i < shipLog.length; i++){
      //var tickLabel = i + (TICK_BUNDLE * this.iteration)
      var tickLabel = "<strong>" + this.tickToClockTime(i) + "</strong>";
      logText_Element.innerHTML += tickLabel + "  " + shipLog[i] + "<br>";
    }
    //----------------------//

    //-----[ PRINT OUT SHIP'S HISTORY ]------//
    shipHistoryText_Element.innerHTML = "";
    if (this.ship.shipHistory.length <= 0){
      shipHistoryText_Element.innerHTML = "< No reports >";
    } else {
      for (var i = 0; i < this.ship.shipHistory.length; i++){
        shipHistoryText_Element.innerHTML += this.ship.shipHistory[i] + "<br>";
      }
    }
    //----------------------------------------//

    shipStatusText_Element.innerHTML = "ENGINE: " + this.ship.parts["engine"] + "<br>" +
          "HULL: " + this.ship.parts["hull"] + "<br>" +
          "SHIELDS: " + this.ship.parts["shields"] + "<br>" +
          "THRUSTERS: " + this.ship.parts["thrusters"] + "<br>" +
          "LIFE-SUPPORT: " + this.ship.parts["life-support systems"] + "<br>";

    //also, print out the Things that are on the ship (for debug)
    if (SHOW_DEBUG_HTML){
      debugText.innerHTML = "";
      for (var i = 0; i < this.ship.things.length; i++){
        debugText.innerHTML += this.ship.things[i].what + " # ";
      }
    }

    this.updateJourneyInfoHTML();

    //---------------------//
  }

  updateJourneyInfoHTML(){
    //....update journey info
    journeyText_Element.innerHTML = "FUNDS: " + this.ship.funds + " units<br>";
    journeyText_Element.innerHTML += "DAY: " + this.iteration + "<br>";
    journeyText_Element.innerHTML += "DESTINATION: ";
    if (this.ship.currentJourney != null){
      journeyText_Element.innerHTML += this.ship.currentJourney.destination.name;
      journeyText_Element.innerHTML += ", time left: " + this.ship.currentJourney.lengthInDays;
      updateControlPanelNotifs("destination is " + this.ship.currentJourney.destination.name);
    } else if (this.ship.inFlight == false) {
      journeyText_Element.innerHTML += "(REACHED) " + this.ship.whichCelestialBody.name;
      updateControlPanelNotifs("docked at " + this.ship.whichCelestialBody.name);
    } else {
      journeyText_Element.innerHTML += "No destination set";
      updateControlPanelNotifs("drifting in space");
      if (this.ship.whichCelestialBody != null && this.ship.dockingPossible){
        journeyText_Element.innerHTML += ", can dock at " + this.ship.whichCelestialBody.name + ".";
      }
    }
  }


  //the keeper of events
  handleEvents(){
    //for now, if an event is going on, can't add another
    //ALSO: decrease count here!!!
    var eventKeys = Object.keys(this.event_keeper);
    var eventGoingOn = false;
    for (var i = 0; i < eventKeys.length; i++){
      if (this.event_keeper[eventKeys[i]] > 0){
        this.event_keeper[eventKeys[i]] -= 1;
        eventGoingOn = true;
      }
    }
    if (eventGoingOn){
      return;
    }
    //OTHERWISE...
    //if no ongoing events, RESET all ship elements set
    this.ship.enemyShipEvent = false;
    //And, finally, continue on.....
    var events = [];
    //--> at the moment, can get multiple events at once...
    if (chance(1,CHANCE_FOR_DAMAGE_BY_SPACE_DEBRIS)){
      events.push("space debris");
    }
    if (chance(1,CHANCE_FOR_ENEMY_SHIP)){
      events.push("enemy ship");
    }

    for (var i = 0; i < events.length; i++){
      if (events[i] == "space debris"){
        this.event_keeper["space debris"] = 1;
        this.ship.respondToSpaceDebris(this.iteration);
      } else if (events[i] == "enemy ship"){
        this.event_keeper["enemy ship"] = 1;
        this.ship.enemyShipEvent = true;
        for (var j = 0; j < this.ship.people.length; j++) {
          this.ship.people[j].task_chances["EnemyShip"] = 100; //chance for this task goes WAY up
        }
        this.ship.respondToEnemyShip(this.iteration);
      }
    }
  }

  //-GO, but for when you're at a station-//
  spaceStationGo(){
    if (this.ship.whichCelestialBody == null){
      console.log("ERROR");
      return;
    }
    updateControlPanelNotifs("docked at " + this.ship.whichCelestialBody.name);

    warningsText_Element.innerHTML = ""; //NOTE: get rid of this later.
    logText_Element.innerHTML = "You look around the station, spotting a few strangers who look open to conversation.<br>";

    var tempPeople = [];
    for (var i = 0; i < NUM_PEOPLE_IN_STATION; i++){
      //1. generate person
      var tempPerson = this.personGenerator(this.ship.whichCelestialBody);
      tempPeople.push(tempPerson);
      //2. display info (TODO: don't display info until click, and later, another step)
      //...
    }
    this.peopleInStation = tempPeople;

    //-----//
    //generate available trade items ('cargo'):
    // THREE items
    this.ship.whichCelestialBody.tradeItemsAvailable = []; //for now, just clear old
    var tradeItemButtons = [tradeItemButton0, tradeItemButton1, tradeItemButton2];
    for (var i = 0; i < 3; i++){
      this.ship.whichCelestialBody.tradeItemsAvailable.push(new Cargo);
      tradeItemButtons[i].innerHTML = this.ship.whichCelestialBody.tradeItemsAvailable[i].symbol;
    }

  }


  addNewPersonToShip(newPerson){
    this.ship.people.push(newPerson);
  }


  //--[~ GENERATE A PERSON ~]--//
  personGenerator(probablePlanet = null){
    //1. pick origin planet - IF probablePlanet != "", it's most likely to be probablePlanet.
    var origin = null;
    var originIndex = 0;
    var fromDifferentPlanet = chance(1,4);
    if (probablePlanet != null && probablePlanet.type == "planet" && !fromDifferentPlanet){
      origin = probablePlanet;
      originIndex = this.galaxy.planets.indexOf(probablePlanet);
      if (originIndex == -1){
        //set back to 0, since indexOf went wrong
        originIndex = 0;
      }
    } else {
      originIndex = random(NUM_PLANETS);
      origin = this.galaxy.planets[originIndex];
    }
    //2. pick a gender
    var gender = random(2); // 0 = female, 1 = male
    //3. make a name
    var name = nameMaker(originIndex, gender);
    //4. pick a title (can be no-title)
    var r3 = random(TITLES.length);
    var title = TITLES[r3]; //there are actuallly [4] titles (blank is one)
    //4(b). pick a specialty if their title is Specialist
    var specialty = "";
    if (title == "Specialist"){
      var r4 = random(AVAILABLE_SPECIALTIES.length);
      specialty = AVAILABLE_SPECIALTIES[r4];
    }
    //5. assign a fitness value
    var fitness = random(STARTER_FITNESS_VALUE_MAX);
    //---[ make the new person ]---//
    var newPerson = new Person(this.galaxy, this.ship, this.IDcounter, name, gender, fitness, title, specialty, origin);
    //----------------------------//
    //6. assign any PASSIONS
    if (PASSIONS_ALLOWED){
      var r5 = lottery([1,1,2]); //0 = painting, 1 = cooking, 2 = nothing
      if (r5 == 0){
        newPerson.passions["painting"] = true;
      } else if (r5 == 1){
        newPerson.passions["cooking"] = true;
      }
    }
    //done creating person; increment the IDcounter
    this.IDcounter += 1;
    //ALL DONE
    return newPerson;
  }


  //==========[ PLOT THINGS ON THE MODAL MAP ]==========//
  _plotLocation(x,y){
    var adjustment_y = -8;
    y = y + adjustment_y;
    if (y < 0){
      y = 0;
    }
    locText_Element.style.position = "absolute";
    locText_Element.style.left = x + 'px';
    locText_Element.style.top = y + 'px';
  }

  _plotPlanets(){
    //----~~~~----//
    //add destination buttons as required
    //Note: 'canvas' (just a div now, but still) is 500 x 300, with minimums of about 40
    //--> in parts of 50
    //Note: have to adjust all planetbutton-related things manually
    var planetButtons = [planet0, planet1, planet2, planet3];
    for (var i = 0; i < NUM_PLANETS; i++){
      var planetButton = planetButtons[i];
      //planetButton.innerHTML = "Planet " + this.galaxy.planets[i].name;
      planetButton.className = "destinationButtons_planets"; //for css hopefully
      planetButton.style.position = "absolute";
      planetButton.style.left = this.galaxy.planets[i].coords[0] + 'px';
      planetButton.style.top = this.galaxy.planets[i].coords[1] + 'px';
    }
    //----~~~~----//
  }

  _plotStations(){
    //----~~~~----//
    //add destination buttons as required
    //Note: 'canvas' (just a div now, but still) is 500 x 300, with minimums of about 40
    //--> in parts of 50
    //Note: have to adjust all planetbutton-related things manually
    var stationButtons = [station0, station1, station2];
    for (var i = 0; i < NUM_SPACE_STATIONS; i++){
      var stationButton = stationButtons[i];
      //stationButton.innerHTML = "Station " + this.galaxy.spaceStations[i].name;
      stationButton.className = "destinationButtons_stations"; //for css hopefully
      stationButton.style.position = "absolute";
      stationButton.style.left = this.galaxy.spaceStations[i].coords[0] + 'px';
      stationButton.style.top = this.galaxy.spaceStations[i].coords[1] + 'px';
    }
    //----~~~~----//
  }

  _plotEvil(){
    //plot -one- evil >:)
    //evilButton
    evilButton.className = "destinationButtons_evil";
    evilButton.style.position = "absolute";
    evilButton.style.left = this.galaxy.evil.coords[0] + 'px';
    evilButton.style.top = this.galaxy.evil.coords[1] + 'px';
  }

  //=====================================================//

  //--> crew member 'slideshow' (not really a slideshow, but...)
  updateCrewSlideshow(updateCanvas = true){
    if (this.slideshowIndex <= -1){
      //empty out html -> TODO: do this fully, once everything's in place.
      crewMemberDesc.innerHTML = "";
    } else {
      if (this.ship.people.length > this.slideshowIndex){
        //--update slideshow--//
        var crewmember = this.ship.people[this.slideshowIndex];
        var desc = crewmember.title + " " + crewmember.name + " (from " +
              crewmember.originPlanet.name + ")";
        if (crewmember.title == "Specialist"){
          desc += " " + crewmember.specialty;
        }
        crewMemberDesc.innerHTML = desc;
        //update image
        if (updateCanvas){
          this.updatePersonCanvas(crewmember);
        }
      } else {
        console.log("Error: index out of bounds (index: " + this.slideshowIndex + ")");
      }
    }
  }

  updatePersonCanvas(whichPerson){
    //random for now... ohhh boy...
    //note: can't getImageData on a local file, so not doing that (maybe later)
    //ORDER: "skin","hairColour","upperFace","lowerFace",...
    //..."faceOutline","hairOutline","clothingColour","clothingOutline"
    //----------------------//
    //grab relevant visual features of the person.
    var parts = whichPerson.visualFeatures;
    var whatHairLength = whichPerson.hairLength;
    //1. clear old images from canvas
    crewContext.clearRect(0, 0, crewCanvas.width, crewCanvas.height);

    //2. draw
    //ORDER: "skin","hairColour","upperFace","lowerFace",...
    //..."faceOutline","hairOutline","clothingColour","clothingOutline"
    var keyParts = Object.keys(parts);
    for (var i = 0; i < keyParts.length; i++){
      if (parts[keyParts[i]] != null){
        if (keyParts[i] == "hairColour" || keyParts[i] == "hairOutline"){
          crewContext.drawImage(parts[keyParts[i]][whatHairLength],0,0,320,200);
        } else {
          crewContext.drawImage(parts[keyParts[i]],0,0,320,200);
        }
      } else {
        console.log("Error: " + keyParts[i] + " is null.");
      }
    }
    //finally, add an overlay so it looks like a crt screen :)
    crewContext.drawImage(crtImage, 0, 0);

  }

  displayMorePersonInfo(){
    //TODO: checks
    //TODO: finish this up
    var crewmember = this.ship.people[this.slideshowIndex];
    var desc = "--| " + crewmember.name + " |--<br>";
    desc += crewmember.getFullDesc();
    crewMemberDesc.innerHTML = desc;
  }

  //==========================================//

}
