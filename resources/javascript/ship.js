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
    this.people = []; //Person objects
    this.deceased = []; //names (strings) only

    this.currentJourney = null; //the Journey (object) the ship is currently on
    this.currentLoc = [(random(9) + 1)*50,(random(5) + 1)*50]; //random, for now
    this.velocity = 10; // units the ship can travel per day (constant value)

    this.tick = 0;

    this.dockingPossible = true;  //journey's end
    this.whichCelestialBody = null; // journey's end
    this.inFlight = true; //after docking, inflight = false (really similar to this.dockingPossible)

    this.funds = STARTING_MONEY; //your money
    this.provisions = STARTING_PROVISIONS; //food, drink, equipment
    this.fuel = STARTING_FUEL; //ship's fuel.
    this.fuelRate = STARTING_FUEL_ECONOMY;

    this.integrity = 20; // for now, rate at which ship decays
    this.level = 0; // can work to upgrade your ship
    this.things = []; // 'things' strewn about the ship - (**'Thing' objects**)
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

  adjustWholeCrewMood(amount){
    for (var p = 0; p < this.people.length; p++){
      this.people[p].adjustMood(amount);
    }
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
    this.craftedCargoWorth = initWorth;
  }


  addAThing(categoryOfThing, nameOfThing, observations = "", location = "", addStat = 0, nameOfPerson = ""){
    if (location == "") {
      //need to generate a random location
      //TODO: if medical-related, should usually be in "sick bay"
      var randomLoc = ship_locations[random(ship_locations.length)];
      this.things.push(new Thing(categoryOfThing, nameOfThing, randomLoc, observations, addStat, nameOfPerson));
    } else {
      //the location is specified :)
      this.things.push(new Thing(categoryOfThing, nameOfThing, location, observations, addStat, nameOfPerson));
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
    if (warningKeysList.length <= 0){
      //all warnings have been activated; normal, but not usual.
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

  //returns 0.0 -> 1.0 (percentage repaired)
  getOverallRepairLevel(){
    var repairLevel = 0;
    var fullyRepaired = 500;
    repairLevel = this.parts["engine"] +
                  this.parts["hull"] +
                  this.parts["shields"] +
                  this.parts["thrusters"] +
                  this.parts["life-support systems"];
    return repairLevel / fullyRepaired;
  }

  getPartInWorstCondition(){
    //put in most likely order.
    var worstCondition = 100;
    var worstPart = "shields";
    var allParts = ["shields","hull","thrusters","engine","life-support systems"];
    for (var i = 0; i < allParts.length; i++){
      if (this.parts[allParts[i]] < worstCondition){
        worstPart = allParts[i];
        worstCondition = this.parts[allParts[i]];
      }
    }
    return worstPart;
  }


  getRandomSickPerson(){
    var sickPeople = [];
    for (var i = 0; i < this.people.length; i++){
      if (this.people[i].hasPoorHealth()){
        sickPeople.push(this.people[i]);
      }
    }
    if (sickPeople.length <= 0){
      return null;
    } else {
      var r = random(sickPeople.length);
      return sickPeople[r];
    }
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
      if (this.things[i].lastsFor <= 0 || this.things[i].markedForRemoval){
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
    if (random(2) == 0){
      this.addAThing("garbage","a bit of debris");
    }
    //-----------//

    //--[make sure all the parts are above 0]--//
    this._ensurePartsAboveZero();
    //----------------------------------------//

    //---------//
    //pay wages. Each person is paid [x] units per day.
    this.funds -= WAGES_PPPD; //TODO: add ability to turn this off temporarily (when low on funds)
    //reduce provisions. Each person consume [x] provision per day.
    this.provisions -= (this.people.length * PROVISIONS_PPPD);
    if (this.provisions < 0){
      this.provisions = 0;
    }
    //reduce fuel IF TRAVELLING. Ship consume [x]% of fuel per day.
    if (this.currentJourney !== null){
      this.fuel -= this.fuelRate;
    }
    //---------//

  }

  _ensurePartsAboveZero(){
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
    //otherwise, return null: this CAN happen (usually if the person has died)
    return null;
  }

  //hmmm..
  respondToSpaceDebris(whatIteration){
    //TODO: better navigators = fewer hitting of asteroids
    var partReport = "";

    var dmg = random(35) + 5; // 5 -> 40
    this.damageShipExternal(dmg);

    if (dmg < 10){
      partReport = "minimal damage.";
    } else if (dmg >= 10 && dmg < 30){
      partReport = "some damage.";
    } else {
      partReport = "significant damage.";
    }

    //---injury caused?---//
    var injuryDesc = "";
    if (this.people.length > 0){
      if (random(CHANCE_FOR_INJURY_BY_SPACE_DEBRIS) == 0){
        var injury = random(30) + dmg; //absolute max is ~70
        //choose a random person to 'cause injury' to.
        var p = this.people[random(this.people.length)];
        injuryDesc = p.causeRandomInjury(injury);
      }
    }

    var reportToAdd = "";
    reportToAdd += "===| REPORT, DAY " + whatIteration + " |===<br>";
    reportToAdd += "The ship has hit a bit of space debris.";
    reportToAdd += "The ship sustained " + partReport + "<br>";
    if (injuryDesc != ""){
      reportToAdd += injuryDesc + "<br>";
    }
    this.shipHistory.push(reportToAdd);
  }


  //=====~~~=====//
  respondToEnemyShip(whatIteration){
    //TODO: weapons specialist = better chance with enemies
    //TODO: linguist = better chance with alien enemies / talking people down
    //TODO: navigators = better chance at escaping
    //-- occurs once per day, as long as the attack lasts --//
    var record = ""; //to be used in conversation (not using atm)
    var names1 = ["Swift","Dangerous","Angry","Jumpy"];
    var names2 = ["Wasp","Walrus","Apple","Spoons"];
    var enemyShipName = names1[random(names1.length)] + " " + names2[random(names2.length)];
    //1. damage?
    var dmg = 0;
    if (random(2) == 0){
      dmg = random(100);
      this.damageShipExternal(dmg);
    }

    //--generate a battle account-//
    var points = 0;
    var report = "> The " + this.shipName + " was pursued by an enemy ship.";
    var MAX_POINTS = 6;
    for (var i = 0; i < 3; i++){
      report += "<br>";
      var r = random(3);
      if (r == 0){
        report += ">> Tried to outrun the pursuer";
        var success = random(3);
        points += success; // 0, 1, or 2 points
        if (success == 0){
          report += ", but we couldn't quite manage it.";
        } else {
          report += "; we sped away from them.";
        }

      } else if (r == 1){
        report += ">> Fired cannons.";
        var success = random(3);
        points += success;
        if (success == 0){
          report += " Missed.";
        } else {
          report += " Got a hit!";
        }

      } else {
        report += ">> Attempted to contact the unknown pursuers.";
        var success = random(3);
        points += success;
        if (success == 0){
          report += " The ship ignored our attempts.";
        } else {
          report += " The ship identified themselves as the " + enemyShipName + ".";
        }
      }
    }
    report += "<br>";

    //==GENERATE CONCLUSION==//
    var isBadScore = true;
    if (points <= 0){
      //WORST SCORE.
      isBadScore = true;
      report += "You really flubbed that, captain";
    } else if (points > 0 && points <= 3){
      //MEDIOCRE
      isBadScore = true;
      report += "The incident ended poorly";
    } else if (points > 3 && points < 6){
      //PRETTY GOOD
      isBadScore = false;
      report += "Thanks to some deft maneuvering, things ended well";
    } else {
      //PERFECT SCORE.
      isBadScore = false;
      report += "Brilliant job";
    }

    //==== DAMAGE ====//
    if (dmg <= 0){
      if (isBadScore){
        report += ", but (somehow)";
      } else {
        report += ":";
      }
      report += " the ship sustained no damage.";
    } else if (dmg > 0 && dmg <= 50){
      report += "."
      report += " The ship sustained some damage.";
    } else if (dmg > 50){
      if (isBadScore){
        report += "; not surprisingly,"
      } else {
        report += "; unfortunately"
      }
      report += " the ship sustained major damage.";
    }
    //================//
    //---injury caused?---//
    var injuryDesc = "";
    if (this.people.length > 0){
      if (random(CHANCE_FOR_INJURY_BY_ENEMY_SHIP) == 0 && dmg > 0){
        var injury = random(40) + (dmg/50)|0; //absolute max is ~90
        //choose a random person to 'cause injury' to.
        var p = this.people[random(this.people.length)];
        injuryDesc = p.causeRandomInjury(injury);
      }
    }
    //================//
    this.battleHistory.push(""); //not using atm

    var reportToAdd = "";
    reportToAdd += "===| REPORT, DAY " + whatIteration + " |===<br>";
    reportToAdd += report + "<br>";
    if (injuryDesc != ""){
      reportToAdd += injuryDesc + "<br>";
    }
    this.shipHistory.push(reportToAdd);
  }
  //=======~~~~~=======//


  //---[damage from the outside]---//
  //--> input 'damage', integer from 0+
  damageShipExternal(damageAmount){
    var remaining_damage = damageAmount;
    //-> ORDER is important here. Keys must relate to this.parts, but are in a dif order.
    var keys = ["shields","hull","thrusters","engine","life-support systems"];
    var k = 0;
    while (remaining_damage > 0 && k < keys.length){
      if (!this.parts[keys[k]] in this.parts){
        console.log("Something went wrong when damaging the ship.");
        return;
      }
      if (this.parts[keys[k]] > 0){
        var dmg = remaining_damage;
        remaining_damage = remaining_damage - this.parts[keys[k]];
        console.log("remaining_damage: " + remaining_damage);
        this.parts[keys[k]] -= dmg;
      }
      k++;
    }
    //---[ set all parts that are negative to 0 ]---//
    this._ensurePartsAboveZero();

  }

  firstMateDuties(){
    //1. when at a station, replenish fuel and provisions. TODO: make different kinds of first mates :D
    //TODO: make this smart. Fuel is easy, since it goes to 100%.
    var fuel_to_buy = 100 - this.fuel;
    this.funds -= FUEL_BASE_PRICE * fuel_to_buy;
    this.fuel += fuel_to_buy;
    //----
    var provisions_cost = this.funds + 1; //set it so it's guaranteed to be >= this.funds
    var provisions_to_buy = 0;
    if (this.provisions <= 10){
      //critical
      provisions_to_buy = 31;
    } else if (this.provisions > 10 && this.provisions <= 50){
      //okay
      provisions_to_buy = 21;
    } else if (this.provisions > 50 && this.provisions <= 200){
      //good
      provisions_to_buy = 11;
    } else {
      //too much
      provisions_to_buy = 1;
    }
    while (provisions_cost >= this.funds){
      provisions_to_buy -= 1;
      provisions_cost = provisions_to_buy * this.people.length * PROVISIONS_BASE_PRICE;
    }
    this.funds -= provisions_cost;
    this.provisions += provisions_to_buy * this.people.length;
    //----
    var firstMateReport = "~~~ first mate's report ~~~";
    firstMateReport += "<br>-purchased " + FUEL_BASE_PRICE * fuel_to_buy + " units worth of fuel, and " + PROVISIONS_BASE_PRICE * (provisions_to_buy * this.people.length) + " units worth of provisions.<br>";
    this.shipHistory.push(firstMateReport);
  }


}
