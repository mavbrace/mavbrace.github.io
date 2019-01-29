// ---[THINGS: Cargo and Thing]---//

//just names...
var possible_cargos = [["flimmer","shun","darmerger"],
                      ["hummer","sharlar","routerrum"],
                      ["humdinger","thingimibob","blibbleblob"],
                      ["rallot","sherver","nall","tello"],
                      ["shertubble","mumbler","hortiolo"]];

//just names... unused so far.
var secondary_possible_cargos = ["sharder","glum","fiddle"];
//just names...
var final_tech_names = ["mucker","sharl","dubs","hams"];


class Cargo {
  constructor(){
    this.cost = 0;
    this.name = "";
  }
}

class FinalTech extends Cargo{
  constructor(galax){
    super();
    this.name = final_tech_names[random(final_tech_names.length)]; //probably should make this not-so-random, since there will be repeats otherwise...
    this.created = false; //doesn't 'exist' until true.
    this.ingredients = this._chooseIngredients(galax); //list of tech that goes into creating this.
    console.log("FINAL TECH: " + this.name + ".... INGREDIENTS: \n-" + this.ingredients[0].name + "\n-" + this.ingredients[1].name + "\n");

    var keys_temp = Object.keys(extra_stuff_for_sale);
    this.extraBit = keys_temp[random(keys_temp.length)];//somethin' else.
  }

  _chooseIngredients(galax){
    //go through the planets and stations, and choose (1) Tech from a Station, and (1) Tech from a Planet.
    var station = galax.spaceStations[random(galax.spaceStations.length)];
    var techA = station.techForSale[random(station.techForSale.length)];

    var planet = galax.planets[random(galax.planets.length)];
    var techB = planet.techForSale[random(planet.techForSale.length)];

    return [techA, techB];
  }

  getRecipe(){
    return "" + this.ingredients[0].name + " + " + this.ingredients[1].name + " + " + this.extraBit;
  }
}

class Tech extends Cargo{
  constructor(associatedID, level){
    super();
    this.level = level;
    this.associatedID = associatedID % possible_cargos.length;
    this.type = "tech";
    this.index = random(possible_cargos[this.associatedID].length);
    this.name = possible_cargos[this.associatedID][this.index];
    this.cost = random(700) + 500; //500->1200 per item.
  }
}

class Commodity extends Cargo{
  constructor(){
    super();
    this.type = "commodity";
    this.name = "wheat";
    this.cost = random(100) + 100; //100->200 per bushel.
  }

}


//things so far: painting, garbage, book
class Thing{

  // constructor: string, string, list of ints (indices, which correspond to all_possible_reactions array above)
  constructor(category, what, where, observations, stat, belongsToName){
    this.all_possible_reactions = [
      this._cleanUp,
      this._observe,
      this._eat
    ]
    this.belongsTo = belongsToName; // the NAME of a person only.
    this.category = category; // eg. painting, garbage...
    this.what = what; //eg. a more verbose name
    this.where = where;
    this.observations = observations; // any extra descriptions: format eg = 'they observed the [blue and white colour]'
    this.possibleReactions = []; //= relevant reactions to encountering this Thing
    this._populateReactions();
    this.lastsFor = 10; //when lastsFor == 0, this Thing is removed from the ship automatically
    //some things can be set to last longer, of course, like certain paintings
    this.stat = stat; //the amount to increase or decrease some attribute, depends on the category.
    this.markedForRemoval = false;
  }

  //depending on the 'what', populate possibleReactions (note: with indices)
  _populateReactions(){
    if (this.category == "painting"){
      this.possibleReactions.push(1); // can observe
    } else if (this.category == "garbage"){
      this.possibleReactions.push(0); // can pick up
    } else if (this.category == "book"){
      this.possibleReactions.push(0); // can pick up
      this.possibleReactions.push(1); // can observe
    } else if (this.category == "food") {
      this.possibleReactions.push(1); //can observe
      this.possibleReactions.push(2); //can eat
      this.possibleReactions.push(2); //can eat x2 (better chance to eat.)
    } else {
      //...
    }
  }

  reactToThing(person){
    if (this.possibleReactions.length > 0){
      var r = random(this.possibleReactions.length);
      var belongsToName = "";
      if (person.name == this.belongsTo){
        belongsToName = person.getSelfPronoun();
      } else {
        belongsToName = this.belongsTo;
      }
      var reaction = this.all_possible_reactions[this.possibleReactions[r]](this, person, belongsToName);
      return reaction;
    } else {
      return "";
    }
  }

  _inOrOnLocation(){
    if (this.where == "bridge"){
      return " on the " + this.where;
    } else {
      return " in the " + this.where;
    }
  }

  _observationsAsSentence(person){
    if (this.observations == ""){
      return "";
    } else {
      var string = "";
      var randomObs = random(2);
      if (randomObs){
        string = " " + capitalize(person.getPronoun(false)) + " examined the " + this.observations + " with interest."
      } else {
        string = " The " + this.observations + " caught " + person.getPronoun(true) + " interest, and " + person.getPronoun(false) + " considered it thoughtfully.";
      }
      return string;
    }
  }
  //---[ REACTIONS ]---//     //t = this
  // 0. CLEANUP
  _cleanUp(t, person){
    t.markedForRemoval = true;
    return (" " + capitalize(person.getPronoun(false)) + " picked up " + t.what + ".");
  }
  //1. OBSERVE
  _observe(t, person){
    var string = " " + capitalize(person.getPronoun(false))
    string += " stumbled across " + t.what;
    string += t._inOrOnLocation() + ".";
    string += t._observationsAsSentence(person);
    return string;
  }
  //2. EAT
  _eat(t, person, ownedBy){
    person.adjustHealth(t.stat);
    var string = " " + capitalize(person.getPronoun(false)) + " decided to eat a bit of the " + t.what + " made by " + ownedBy + ". "; //ownedBy can be 'themselves'
    if (t.stat > 0){
      string += "It was quite tasty. " + capitalize(person.getName()) + "'s health increased a little.";
    } else if (t.stat < 0){
      string += "A bad idea, because it tasted foul. " + capitalize(person.getName()) + "'s health decreased a little.";
    } else {
      string += "It tasted pretty good.";
    }
    //half the time left.
    this.lastsFor = (this.lastsFor/2)|0; //eg. 10 -> 5 -> 2 -> 1
    return string;
  }

}
