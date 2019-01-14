//======< SHIP >=======//

//--> CRAFTING <--//
var craftingRecipes = [];

//--> LOCATIONS <--//
var ship_locations = ["bridge","port hallway","starboard hallway","engine room","cargo bay","lounge","galley","sick bay"];
//-- SHIP --//
class Ship {
  constructor(shipName) {
    this.shipName = shipName;
    this.shipHistory = []; //-->history pertaining to the ship itself<--
    this.people = [];

    this.currentJourney = null; //the Journey (object) the ship is currently on
    this.currentLoc = [(random(9) + 1)*50,(random(5) + 1)*50]; //random, for now
    this.velocity = 10; // units the ship can travel per day (constant value)

    this.tick = 0;

    this.dockingPossible = true;  //journey's end
    this.whichCelestialBody = null; // journey's end
    this.inFlight = true; //after docking, inflight = false (really similar to this.dockingPossible)

    this.funds = STARTING_MONEY; //your money
    this.integrity = 20; // for now, rate at which ship decays
    this.level = 0; // can work to upgrade your ship
    this.things = []; // 'things' strewn about the ship - (**'Thing' objects**)
    //maybe add (parts): wiring, plumbing...?
    this.parts = {
      "engine": 100,
      "hull": 100,
      "shields": 100,
      "thrusters": 100,
      "life-support systems": 100
    };
    this.warnings = {
      "SHIELDS LOW": false,
      "SHIELDS DOWN": false,
      "CRITICAL DAMAGE TO HULL": false
    };
    this.enemyShipEvent = false;
    this.battleHistory = [];

    this.cargo = []; //a list of Cargo objects (3 (MAX_CARGO) allowed at a time)
    this.craftedCargoName = "";
    this.craftedCargoWorth = 0;
    this.cargoOffer = []; // [whatCargo, offer] -1 means an offer on the crafted cargo
  }

  clearCraftedCargoInfo(){
    this.craftedCargoName = "";
    this.craftedCargoWorth = 0;
    this.cargoOffer = [];
  }

  setCraftedCargoInfo(){
    //set all (craftedCargoName, and Worth)
    if (this.cargo.length < MAX_CARGO){
      console.log("Error: crafting parts not set.");
      return;
    }
    //1.
    var tempnames = ["Supermixer","Grand-hummerder","Frim-lumbler"];
    this.craftedCargoName = tempnames[random(tempnames.length)];

    //2.
    var recipeStr = "";
    var initWorth = 0;
    for (var i = 0; i < 3; i++){
      initWorth += this.cargo[i].worth;
      if (i != 0){
        recipeStr += "-";
      }
      recipeStr += this.cargo[i].worth;
    }
    //recipeStr: a-b-c
    //if recipeStr is in craftingRecipes, add value (TODO)
    //if the recipe has bookends, add value
    if (this.cargo[0].worth == this.cargo[2].worth){
      initWorth *= 2;
    }
    console.log(initWorth);
    this.craftedCargoWorth = initWorth;
  }


  addAThing(categoryOfThing, nameOfThing, observations = "", location = ""){
    if (location == "") {
      //need to generate a random location
      //TODO: if medical-related, should usually be in "sick bay"
      var randomLoc = ship_locations[random(ship_locations.length)];
      this.things.push(new Thing(categoryOfThing, nameOfThing, randomLoc, observations));
    } else {
      //the location is specified :)
      this.things.push(new Thing(categoryOfThing, nameOfThing, location, observations));
    }
  }


  _activateWarnings(warningKeysList){
    if (warningKeysList.length < 1){
      //no warnings in list; perfectly normal
      return;
    }
    for (var i = 0; i < warningKeysList.length; i++){
      if(warningKeysList[i] in this.warnings){
        this.warnings[warningKeysList[i]] = true;
      } else {
        console.log("Error: could not find key in warnings");
      }
    }
  }

  _deactivateWarnings(warningKeysList){
    if (warningKeysList.length < 1){
      console.log("Error: no warnings in list");
      return;
    }
    for (var i = 0; i < warningKeysList.length; i++){
      if(warningKeysList[i] in this.warnings){
        this.warnings[warningKeysList[i]] = false;
      } else {
        console.log("Error: could not find key in warnings");
      }
    }
  }

  //TODO: flesh this out
  getWarningsAsString(){
    var warningsAsString = "";
    var warningKeys = Object.keys(this.warnings);
    for (var i = 0; i < warningKeys.length; i++){
      if (this.warnings[warningKeys[i]] == true){
        warningsAsString += " | " + warningKeys[i];
      }
    }
    return warningsAsString;
  }

  //called every bundle of ticks
  //---> input the 'iteration' ie the current bundle of ticks ie the 'day'
  //---> adds normal wear and wear and tear
  //---> add information to shipHistory
  updateShip(iteration){
    //----[ adds normal wear and tear ]----//
    if (this.inFlight && (this.tick % this.integrity) == 0){
      this.parts["engine"] -= 1;
      this.parts["shields"] -= 1;
      if (this.parts["shields"] <= 0){
        this.parts["hull"] -= 1;
      }
      this.parts["thrusters"] -= 1;
      this.parts["life-support systems"] -= 1;
    }

    //------[ update the Things ]------//
    //-> age;  remove thing from this.things if necessary
    for (var i = 0; i < this.things.length; i++){
      this.things[i].lastsFor -= 1;
      if (this.things[i].lastsFor <= 0){
        //time's up: remove the item
        console.log("Removing " + this.things[i].what + " from the ship.");
        this.things.splice(i, 1);
      }
    }

    //----------------------//
    //--[ activate and deactivate any neccessary warnings ]--//
    var warningsToActivate = [];
    var warningsToDeactivate = [];
    var LOW_SHIELD_PERCENTAGE = 15;
    var CRITICAL_HULL_PERCENTAGE = 15;
    //-----//
    if (this.parts["shields"] < LOW_SHIELD_PERCENTAGE){
      warningsToActivate.push("SHIELDS LOW");
    }
    if (this.parts["shields"] >= LOW_SHIELD_PERCENTAGE){
      warningsToDeactivate.push("SHIELDS LOW")
    }
    //-----//
    if (this.parts["shields"] <= 0){
      warningsToActivate.push("SHIELDS DOWN");
    }
    if (this.parts["shields"] > 0){
      warningsToDeactivate.push("SHIELDS DOWN")
    }
    //-----//
    if (this.parts["hull"] < CRITICAL_HULL_PERCENTAGE){
      warningsToActivate.push("CRITICAL DAMAGE TO HULL");
    }
    if (this.parts["hull"] >= CRITICAL_HULL_PERCENTAGE){
      warningsToDeactivate.push("CRITICAL DAMAGE TO HULL");
    }
    //-------------//
    this._activateWarnings(warningsToActivate);
    this._deactivateWarnings(warningsToDeactivate);
    //----------------------------------------//

    //--------//
    //--add some debris... I guess
    this.addAThing("garbage","a bit of debris");
    //-----------//

    //--[make sure all the parts are above 0]--//
    if (this.parts["engine"] < 0){
      this.parts["engine"] = 0;
    }
    if (this.parts["hull"] < 0){
      this.parts["hull"] = 0;
    }
    if (this.parts["shields"] < 0){
      this.parts["shields"] = 0;
    }
    if (this.parts["thrusters"] < 0){
      this.parts["thrusters"] = 0;
    }
    if (this.parts["life-support systems"] < 0){
      this.parts["life-support systems"] = 0;
    }
    //----------------------------------------//

  }

  //called each relevant tick (ie multiple times in a row)
  repair(whichPart, effort = 100){
    if (whichPart in this.parts){
      this.parts[whichPart] = this.parts[whichPart] + 1;
      if (this.parts[whichPart] > 100){
        this.parts[whichPart] = 100;
      }
    } else {
      //ERROR//
      console.log("There an error when repairing the ship.");
    }
  }

  //find person in question by examining their unique ID
  findPersonInShipByID(theID){
    for (var i = 0; i < this.people.length; i++){
      if (this.people[i].id == theID){
        return this.people[i];
      }
    }
    //otherwise, return null: this shouldn't happen
    console.log("Error: could not find person via ID.");
    return null;
  }

  //hmmm..
  respondToSpaceDebris(whatIteration){
    //TODO: better navigators = fewer hitting of asteroids
    var partReport = "";
    if (this.parts["shields"] <= 0){
      this.parts["hull"] -= 20;
      partReport = "hull is now at " + this.parts["hull"] + "%.";
    } else {
      this.parts["shields"] -= 20;
      partReport = "shields are now at " + this.parts["shields"] + "%.";
    }

    this.shipHistory.push("< Report [day : " + whatIteration + "] >");
    this.shipHistory.push("The ship has hit a bit of space debris.");
    this.shipHistory.push("The ship sustained some damage: " + partReport);
  }

  respondToEnemyShip(whatIteration){
    //TODO: weapons specialist = better chance with enemies
    //TODO: linguist = better chance with alien enemies / talking people down
    //TODO: navigators = better chance at escaping

    var report = "";
    var record = ""; //to be used in conversation
    var enemyShipName = "that one pirate ship"; //TODO: generate this
    var r = random(3);
    if (r == 0){
      report = "Managed to outrun our hostile pursuer.";
      record = "were pursued by " + enemyShipName;
    } else if (r == 1){
      report = "Enemy ship has been eliminated.";
      record = "defeated " + enemyShipName;
    } else {
      report = "An agreement was reached. Parted ways with no further conflict.";
      record = "outsmarted " + enemyShipName;
    }

    this.battleHistory.push(record);

    this.shipHistory.push("< Report [day : " + whatIteration + "] >");
    this.shipHistory.push("The " + this.shipName + " was pursued by an enemy ship.");
    this.shipHistory.push(report);
  }

}
