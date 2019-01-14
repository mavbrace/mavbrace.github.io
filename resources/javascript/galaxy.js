//---------//
//---- ONE JOURNEY -----//
class Journey {
  constructor(celestialObj, timespan){
    this.destination = celestialObj; //must be a CelestialObject (object)
    this.distanceTo = 100; //'units' (unused at the moment)
    this.lengthInDays = timespan; //should be calculated based on ship's speed
    this.summary = "";
  }

  //always progress 1 day
  progressJourney(){
    this.lengthInDays -= 1;
  }

  isDone(){
    return this.lengthInDays <= 0;
  }

  journeyDone(){
    //...
  }
}

//---- GALAXY -----//
class Galaxy {
  constructor(){
    //-----//
    this.factions = [];
    //one faction per space station
    for (var i = 0; i < NUM_SPACE_STATIONS; i++){
      this.factions.push(new Faction());
    }
    //-----//
    this.spaceStations = [];
    for (var i = 0; i < NUM_SPACE_STATIONS; i++){
      this.spaceStations.push(new SpaceStation(this._randomLocInGalaxy(),
                                        i, this.factions[i]));
    }
    //-----//
    this.planets = []; //planet IDs are the indices
    for (var i = 0; i < NUM_PLANETS; i++){
      this.planets.push(new Planet(this._randomLocInGalaxy()));
    }
    this.evil = new Evil(this._randomLocInGalaxy());
  }

  _randomLocInGalaxy(){
    var x1 = (random(9) + 1) * 50; //[1 -> 9] * 50 = [50 -> 450]
    var y1 = (random(5) + 1) * 50; //[1 -> 5] * 50 = [50 -> 250]
    return [x1, y1];
  }

}

var FACTION_RELATION_DESCS = ["bad terms", "neutral terms", "friendly terms"];

class Faction {
  constructor(){
    this.name = this._generateName();
    this.colour = 0;
    this.relationLevel = random(3);
  }

  getRelation(){
    if (this.relationLevel >= FACTION_RELATION_DESCS.length){
      //shouldn't reach here.
      return (this.name + " is your eternal ally.");
    }
    var relStr = "(You are on " + FACTION_RELATION_DESCS[this.relationLevel] +
                " with " + this.name + ")";
    return relStr;
  }

  _generateName(){
    //NOTE: not capitalized
    var newName = "";
    var options1 = ["Hal","Ell","San","Fer","Eb","Quil"];
    var options2 = ["yon","yius","kar","tarion","syl","far","rat"];
    // eg. the First Halkar Empire
    var descOptions = ["First","Second","Third","Fourth","Fifth","Sixth",
        "Seventh","Ninth","Tenth","Great","United"];

    var singularOptions = ["Blood","Gold","Galactic"];
    var postTitles = ["Empire","Company","Federation","Partnership","Moons","Alliance"];

    var name1 = options1[random(options1.length)] + options2[random(options2.length)];
    var singleName = singularOptions[random(singularOptions.length)];
    var desc = descOptions[random(descOptions.length)];
    var postTitle = postTitles[random(postTitles.length)];
    var the = ""
    if (random(0,2) == 0){
      the = "the ";
    }

    var type = random(5);
    if (type == 0){
      newName = name1;
    } else if (type == 1){
      newName = the + singleName + " " + postTitle;
    } else if (type == 2){
      newName = the + name1 + " " + postTitle;
    } else if (type == 3){
      newName = desc + " " + name1;
    } else {
      newName = the + desc + " " + singleName + " " + postTitle;
    }
    return newName;
  }

}

//======================//
//--superclass for planets and space stations
class CelestialObject {
  constructor(coords){
    this.coords = coords;
    this.type = "";
    this.tradeItemsAvailable = []; //items you can buy for TRADE
    this.buyPercentage = 80 + random(40); // percentage of cargo.worth
    this.sellPercentage = this.buyPercentage; // percentage of cargo.worth
  }
}

//------PLANET--------//
class Planet extends CelestialObject {
  constructor(coords){
    super(coords);
    this.name = this._planetNameMaker();
    this.type = "planet";
  }

  _planetNameMaker(){
    var o0 = ["H","E","Ek","M","Enn","V","Xi","R","Ar","Whe","Arw"]
    var o1 = ["el","wa","ur","i","la","os","im","ro"];
    var o2 = ["ver","fa","lem","do","yo","ath","dia","uth",""];
    var r0 = random(o0.length);
    var r1 = random(o1.length);
    var r2 = random(o2.length);
    return (o0[r0] + o1[r1] + o2[r2]);
  }
}

//------SPACE STATION-----//
//---created automatically with the creation of the Galaxy
//--> faction is a Faction object
class SpaceStation extends CelestialObject {
  constructor(coords, num, faction){
    super(coords);
    this.faction = faction;
    //name has a three digit id:
    this.name = "Space Station " + random(10) + random(10) + random(10);
    this.type = "station";
    this.num = num; //unused
  }
}

//-----~EVIL THING~-----//
//-> one of these things, whatever they end up being
class Evil extends CelestialObject {
  constructor(coords){
    super(coords);
    this.name = "[ THE EVIL ]";
    this.type = "evil";
    this.health = 100;
  }
}
//======================//
