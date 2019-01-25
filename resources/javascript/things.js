// ---[THINGS: Cargo and Thing]---//

//note: C_SYMBOLS are ordered by worth.
var C_SYMBOLS = ["[]", "#", "||", "-", "*", ".", "=", "o", ":", "~",
                "|", "=", "==", "_"];

class Cargo{
  constructor(){
    this.symbol = "";
    this.name = "";
    this.worth = 0;
    this._generateScrap(); //SETS SYMBOL, NAME and WORTH
  }

  _generateScrap(){
    //-----GENERATE A SCRAP----//
    //-> 5 symbols (including containers)
    var max_chars = 5;  //can adjust this freely, but 5 is a nice number
    var minCenter = max_chars % 2;  //1 for odd, 2 for even
    //type 1: symmetric
    var index = random(C_SYMBOLS.length)
    this.worth += index;
    var centerPiece = C_SYMBOLS[index];
    if (minCenter == 2){
      centerPiece += centerPiece; //make it double
      this.worth += index;
    }
    var scrap = this._recursiveSymmetry((max_chars/2)|0, centerPiece);
    //type 2: asymmetric
    //...
    //set the symbol
    this.symbol = scrap;
    //get the proper name by using the WORTH
    //-> NOTE: not random. Taking each digit of this.worth, we choose an element from each array.
    //-> eg. worth = 21.  Therefore options[0][2] + options[1][1]
    var options = [["Energy ","Micro ","Re-","Multi-","Ham","Sum","Shed","Hey","Oy","Last"],
                ["Supply","Sorter","Tammuld","Shoe","Sand","Hurr","Bar","Crabble","Snub","Laster"],
                ["(v0)","(v1)","(v2)","(v3)","(v4)","(v5)","(v6)","(v7)","(v8)","(v9)"]];
    var w = "" + this.worth; //1. convert to string
    var foundName = "";
    for (var i = 0; i < 3; i++){
      if (w.charAt(i) != ""){
        var index = parseInt(w.charAt(i));
        if (!isNaN(index) && options[i].length >= 9){
          foundName += options[i][index];
        } else {
          console.log("Error: couldn't parse int to find scrap name, or options is missing elements.")
        }
      }
    }

    //set the name
    this.name = foundName;
  }

  _recursiveSymmetry(num, c){
    if (num <= 0){
      return c;
    }
    var index = random(C_SYMBOLS.length)
    this.worth += index;
    var bookend = C_SYMBOLS[index];
    return bookend + this._recursiveSymmetry(num - 1, c) + bookend;
  }



}
/*
<#~#>   : 0
||-||   : 1
[*_*]   : 2
~~!~~   : 3
=[.]=   : 4
>>>>|   : 5
|<<<<   : 6
::o::   : 7
[???]   : 8

>>>>|=[.]=|<<<<  5-4-6
*/


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
