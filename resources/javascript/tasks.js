// -------------------------------------- //
// --------------[ TASKS ]--------------- //
// -------------------------------------- //

class Task{

  constructor(person){
    this.person = person;
  }

  isDone() {
    return this.howLong <= 0;
  }

  run(){
    this.howLong -= 1;
  }

  taskDone() {
    // sometimes overridden
    if (this.describeFinal() != ""){
      var iName = this.person.getName();
      this.person.log.push([this.person.ship.tick, iName + this.describeFinal()]);
    }
  }
  describeFinal(){
    return " is doing something... wrong.";
  }

}
// -------------------------------------- //

class ExerciseTask extends Task{

  constructor(person) {
    super(person);
    this.taskName = "Exercise";
    this.possible_exercises = ["running","to the gym"];
    this.howLong = 5;
    this.notSuccessful = (random(this.person.fitness+2)) == 0; //chance for failure (higher chance if fitness is low)
    this.whichExercise = this.possible_exercises[random(this.possible_exercises.length)];
    this.initialDescription = " has gone " + this.whichExercise + ".";
  }

  run(){
    super.run();
    if (this.person.passions["fitness"] == true){
      this.person.adjustFitness(2);
    } else if (this.notSuccessful == false){  // ie 'if successful'
      this.person.adjustFitness(1);
    } //- otherwise, fitness does not increase
    //decrease energy_level
    this.person.adjustEnergy(-1);
  }

  taskDone() {
    if (this.person.passions["fitness"] == false && this.person.fitness > 50){
      this.person.passions["fitness"] = true;
    }
    return super.taskDone();
  }

  describeFinal(){
    var returnString = "";
    if (this.notSuccessful){
      returnString = " attempted a workout, but couldn't quite finish"
    } else if (this.person.passions["fitness"] == false) {
      returnString = " managed to finish " + this.person.getPronoun(true) + " workout";
    } else if (this.person.passions["fitness"] == true){
      if (this.person.fitness < 99){
        returnString = " finished a good workout";
      } else {
        returnString = " finished a super workout";
      }
    } else {
      returnString = " finished... something"
    }
    return returnString + ".";
  }

}

// -------------------------------------- //
//this is a good template Task class
class DoNothingTask extends Task{
  constructor(person) {
    super(person);
    this.taskName = "Do Nothing";
    this.howLong = 3;
    this.initialDescription = "";
  }

  run(){
    super.run();
  }

  taskDone() {
    return super.taskDone();
  }

  describeFinal(){
    return ""
  }
}

// -------------------------------------- //

class SleepingTask extends Task{
  constructor(person) {
    super(person);
    this.taskName = "Sleeping";
    this.howLong = random(4) + 8; //8 -> 11 hours of sleep
    this.initialDescription = " retired to " + this.person.getPronoun(true) + " quarters.";
  }

  run(){
    this.person.adjustEnergy(1);
    super.run();
  }

  taskDone() {
    //always improve mood by 1 after sleeping
    this.person.adjustMood(1);
    return super.taskDone();
  }

  describeFinal(){
    var energy_descriptor = "";
    if (this.person.energy_level < 10) {
      energy_descriptor = " still feeling a little tired"
    } else if (this.person.energy_level >= 10 && this.person.energy_level < 50){
      energy_descriptor = "";
    } else if (this.person.energy_level >= 50 && this.person.energy_level < 90){
      energy_descriptor = " feeling well-rested";
    } else {
      energy_descriptor = ", bursting with energy";
    }
    return (" woke up from " + this.person.getPronoun(true) + " sleep"
              + energy_descriptor + " and in a " + MOODS[this.person.moodIndex]
              + " mood.");
  }
}


//-------------------------------------------//
//-------------------------------------------//

class NavigatorTask extends Task{
  constructor(person) {
    super(person);
    this.taskName = "Navigation";
    this.howLong = 5;
    this.initialDescription = "";
    this.success = 0;
  }

  run(){
    super.run();
    this.person.adjustEnergy(-1);
    this.success = this.success + 10; //obviously change this in the future.
  }

  taskDone() {
    return super.taskDone();
  }

  describeFinal(){
    return " has plotted a course with an accuracy of " + this.success + "%."
  }
}

//-------------------------------------------//

class EngineerTask extends Task{
  constructor(person) {
    super(person);
    this.taskName = "Engineering";
    this.howLong = 5;
    this.initialDescription = "";
    this.partToFix = this.person.ship.getPartInWorstCondition();
    this.finalDesc = "";
  }

  run(){
    super.run();
    this.person.ship.repair(this.partToFix);
    this.person.adjustEnergy(-1);
  }

  taskDone() {
    //chance to be injured whilst repairing something.
    if (chance(1,5)){
      var injury = random(55) + 1;
      var cause = "";
      var causeDesc = "";
      if (random(2) == 0){
        cause = "explosion";
        causeDesc = "something caused a small explosion."
      } else {
        cause = "fall";
        causeDesc = this.person.getPronoun(false) + " had a nasty fall."
      }
      var injuryDesc = this.person.causeSpecificInjury(injury, cause);
      this.finalDesc = " has suffered a " + injuryDesc;
      this.finalDesc += " while trying to repair the " + this.partToFix + " -- " + causeDesc;
    } else {
      this.finalDesc = " has completed a minor repair on the " + this.partToFix + ".";
    }
    //-> Done
    return super.taskDone();
  }

  describeFinal(){
    return this.finalDesc;
  }
}

//-------------------------------------------//
//->AVAILABLE_SPECIALTIES = ["Weapons Specialist","Linguist","Botanist","Storyteller","Medic"];
class SpecialistTask extends Task{
  constructor(person) {
    super(person);
    this.taskName = "Specialist Things";
    this.howLong = 5;
    this.initialDescription = "";
    this.finalDescription = "";
  }

  run(){
    super.run();
    this.person.adjustEnergy(-1);
  }

  taskDone() {
    //TODO: shouldn't drop a book -every- time haha..
    //....
    //---[ DROP A BOOK ]---//
    var observation = "cover";
    if (this.person.specialty == "Weapons Specialist"){
      this.person.ship.addAThing("book","a book with the title 'The Weapons Handbook'",observation);
    } else if (this.person.specialty == "Linguist"){
      this.person.ship.addAThing("book","a book with the title 'Languages of the Galaxy'",observation);
    } else if (this.person.specialty == "Botanist"){
      this.person.ship.addAThing("book","a book with the title 'Plants and Stuff'",observation);
    } else if (this.person.specialty == "Storyteller"){
      this.person.ship.addAThing("book","a book with the title 'Myths and Fables'",observation);
    } else if (this.person.specialty == "Medic"){
      var loc = "";
      if (random(2) == 0){
        this.person.ship.addAThing("book","a book with the title 'Medicine in Space'",observation,"sick bay");
      } else {
        this.person.ship.addAThing("book","a book with the title 'Medicine in Space'",observation);
      }
    } else {
      //...
    }

    //---[ What did they do? (generate description AND apply any changes) ]---//
    if (this.person.specialty == "Weapons Specialist"){
      this.finalDescription = this._weaponsSpecialistActivity();
    } else if (this.person.specialty == "Linguist"){
      this.finalDescription = this._linguistActivity();
    } else if (this.person.specialty == "Botanist"){
      this.finalDescription = this._botanistActivity();
    } else if (this.person.specialty == "Storyteller"){
      this.finalDescription = this._storytellerActivity();
    } else if (this.person.specialty == "Medic"){
      this.finalDescription = this._medicActivity();
    } else {
      //shouldn't reach here.
      this.finalDescription = " was confused. Huh?";
    }
    //---> Done
    return super.taskDone();
  }

  describeFinal(){
    return this.finalDescription;
  }

  //"Weapons Specialist"
  _weaponsSpecialistActivity(){
    return " did maintenance on the ship's cannons.";
  }
  //"Linguist"
  _linguistActivity(){
    return " researched an ancient language.";
  }
  //"Botanist"
  _botanistActivity(){
    //chance to produce some provisions for the ship!
    if (random(2) == 0){
      return " watered " + this.person.getPronoun(true) + " plants.";
    } else {
      this.person.ship.provisions += random(5) + 5; //5->10
      return " harvested some weird-looking fruit from " + this.person.getPronoun(true) + " plants, increasing the ships provisions!";
    }
  }
  //"Storyteller"
  _storytellerActivity(){
    //-> chance to make everyone's mood better, or worse.
    if (this.person.ship.people.length <= 1){
      //storyteller has to tell you, the captain, their stories.
      return " told the captain a story. Was the captain even listening?";
    }
    var r = random(2);
    var result = "";
    var desc = "";
    if (r == 0){
      desc = "story with a happy ending";
      result = "[The crew became a little happier]";
      this.person.ship.adjustWholeCrewMood(1);
    } else {
      desc = "tragic tale";
      result = "[The crew felt a little glum]"
      this.person.ship.adjustWholeCrewMood(-1);
    }
    return " told everyone a " + desc + ". " + result;
  }
  //Medic
  _medicActivity(){
    var sickPerson = this.person.ship.getRandomSickPerson();
    if (sickPerson == null){
      return " cleaned " + this.person.getPronoun(true) + " medical instruments.";
    } else {
      sickPerson.adjustHealth(20);
      return " treated " + this.person.getName(sickPerson) + ".";
    }

  }


}

//-------------------------------------------//

class PaintingTask extends Task{
  constructor(person) {
    super(person);
    this.taskName = "Painting";
    this.howLong = 4;
    this.initialDescription = " started to paint.";
    this.paintingLoc = "an unknown place.";
  }

  run(){
    super.run();
  }

  _aboutThePainting(){
    //format should be, for example, 'they noted the [blue and white colour] with interest'
    var options = ["cold-toned colours", "fiery colours", "roughly-drawn figures","imbedded LEDs","hand-made frame", "ocean scene", "abstract shapes", "thickly-applied paint"]
    return options[random(options.length)];
  }

  taskDone() {
    //-> create a 'Thing' in the Ship
    var observation = this._aboutThePainting(); //TODO : change this up
    this.person.ship.addAThing("painting","a painting by " + this.person.getName(), observation);
    //-> grabbing the thing they added by referencing the last element of person.things...
    //-> then set it so it can last between 10 and 610 'days'
    this.person.ship.things[this.person.ship.things.length-1].lastsFor = random(PAINTING_LASTSFOR_MAX) + PAINTING_LASTSFOR_MIN;
    if (this.person.ship.things.length > 0){
      //add the location by grabbing the Thing you just added (for the 2nd time, sorry; not the best practice)
      this.paintingLoc = "the " + this.person.ship.things[this.person.ship.things.length - 1].where + ".";
    }
    //-> Done
    return super.taskDone();
  }

  describeFinal(){
    return " has finished a painting. " + capitalize(this.person.getPronoun(false)) + " hung it in " + this.paintingLoc;
  }
}

//-------------------------------------------//

class CookingTask extends Task{
  constructor(person) {
    super(person);
    this.taskName = "Cooking";
    this.howLong = 4;
    this.initialDescription = "";
    this.foodCreated = "";
  }

  run(){
    super.run();
  }

  taskDone() {
    //-> create a 'Thing' in the Ship
    //observation format should be, for example, 'they noted the [blue and white colour] with interest'
    var typeOptions = ["treat","food"];
    var type = typeOptions[random(2)];
    var success = random(5); //TODO: make this not-so-random. (0 == failure)
    var observation = "";
    var what = "";
    var whatSpecific = "";
    var stat = 0;
    //location = galley or lounge
    var galleyOrLounge = ["galley","lounge"];
    if (type == "treat"){
      var r = random(2);
      if (r == 0){
        what = "chocolate cake";
        whatSpecific = "cake";
      } else {
        what = "space-pie";
        whatSpecific = "pie";
      }
      this.foodCreated = " did some baking.";
      stat = 1;
    } else {
      var r = random(3);
      if (r == 0){
        what = "stew";
        whatSpecific = "stew";
        this.foodCreated = " finished cooking a big pot of stew.";
      } else if (r == 1) {
        what = "salad";
        whatSpecific = "salad";
        this.foodCreated = " tossed a salad.";
      } else {
        what = "freshly-baked space-bread";
        whatSpecific = "bread";
        this.foodCreated = " pulled a freshly-baked loaf out of the oven.";
      }
      stat = 2;
    }
    //Done
    if (success == 0){
      observation = "dubious " + whatSpecific;
      stat = -stat; //reduces health D:
    } else {
      //succeeded: mediocrity and above.
      var goodness = random(3);
      if (goodness == 0){
        observation = "a little odd-looking but probably edible " + type;
        stat = stat - 1;
      } else if (goodness == 1) {
        observation = whatSpecific;
      } else {
        observation = "delicious-looking " + type;
        stat = stat + 1;
      }

    }
    this.person.ship.addAThing("food", what, observation, galleyOrLounge[random(galleyOrLounge.length)], stat, this.person.getName());
    return super.taskDone();
  }

  describeFinal(){
    return this.foodCreated;
  }
}

//-------------------------------------------//

class WanderTask extends Task{
  constructor(person) {
    super(person);
    this.taskName = "Wander";
    this.howLong = 2;
    this.initialDescription = "";
  }

  run(){
    super.run();
  }

  taskDone() {
    return super.taskDone();
  }

  describeFinal(){
    //TODO: obviously flesh this class out...
    //for now, just pick a thing to stumble across
    var thingFound = "";
    if (this.person.ship.things.length > 0){
      var th = this.person.ship.things[random(this.person.ship.things.length)];
      thingFound = th.reactToThing(this.person);
    }
    return " wandered about the ship." + thingFound;
  }
}

//-------------------------------------------//
//-------------------------------------------//

//dictionary: [length topic lasts, type]
// 0 = normal
// 1 = pick a person
var TOPICS_NEUTRAL = ["the threat of space pirates",
                "what they had for lunch",
                "their favourite foods",
                "solar flares",
                "taxes",
                "the temperature",
                "the meaning of life",
                "the pros and cons of the Great Planetary War",
                "new and undiscovered alien species",
                "the importance of staying hydrated",
                "the market value of silver wheat",
                "how best to make coffee",
                "how bad the coffee was that morning",
                "cutting-edge water-recyling systems",
                "the weird taste of the water recently",
                "the shortage of orange-drink",
                "their preferred atmospheric conditions",
                "space station traffic",
                "trees",
                "their childhoods"  ];


class PairActivity {
  constructor() {
  }
}

class Conversation extends PairActivity {

  constructor(tt0, tt1, p0, p1) {
    super();
    this.tt0 = tt0;
    this.tt1 = tt1;
    this.p0 = p0;
    this.p1 = p1;
    //--choose a topic--//
    this.topic = this._chooseATopic();
    this.topicHistory = [];
    this.topicTimeLeft = random(4) + 1; //random (for now)
  }

  //-->function to choose a topical topic
  _chooseATopic(){
    //======>>[LOTTERY]<<=======//
    var choices = ["neutral","passion","celestialBody","destination","cargo","hunger"];
    var lots = [1, 1, 1, 1, 1, 1];
    //~~~adjust the odds~~~//
    if (this.p0.ship.dockingPossible){
      lots[3] = 5; // increase destination-topic chance
    }
    if (this.p0.ship.craftedCargoName != ""){
      lots[4] = 2;
    }
    if (this.p0.isStarving || this.p1.isStarving){
      lots[5] = 2;
    }
    //~~~~~~~~~~~~~~~~~~~~//
    var choice = lottery(lots);
    //=======lottery over=======//

    if (choices[choice] == "neutral"){
      return TOPICS_NEUTRAL[random(TOPICS_NEUTRAL.length)];

    } else if (choices[choice] == "passion"){
      //-> passion
      return (this._passionTopic());

    } else if (choices[choice] == "celestialBody"){
      //-> planet
      return (this._celestialBodyTopic());

    } else if (choices[choice] == "destination") {
      //-> journey
      return (this._destinationTopic());

    } else if (choices[choice] == "cargo") {
      //-> cargo
      if (this.p0.ship.craftedCargoName != ""){
        return "the " + this.p0.ship.craftedCargoName + " currently in the hold";

      } else if (this.p0.ship.cargo.length > 0){
        var cargo = this.p0.ship.cargo[random(this.p0.ship.cargo.length)].name;
        return "the use, if at all, of the " + cargo + " in the hold";

      } else {
        return "the dust gathering in the cargo bay";
      }
    } else if (choices[choice] == "hunger"){
      if (this.p0.isStarving || this.p1.isStarving){
        return "the bleak state of things";
      } else {
        return "the proper management of provisions";
      }
    } else {
      console.log("Error when choosing topic.");
      return "black holes"; //just in case: if this comes up, though, something has gone wrong
    }
    //------------------//
  }

  //=========[ RUN ]=========//
  run(t) {
    //--> 1. time topic has been talked about for ++
    this.topicTimeLeft--;
    //--> 2. if done, this is where the actual topic is added to the history
    if (this.topicTimeLeft == 0) {
      // first topic, or earlier topic has ended //
      //-------[ ADD A TOPIC ]-------//
      this.topicHistory.push(this.topic);
      //------------done------------------//
      //--> save old topic...
      var oldTopic = this.topic;
      //--> And finally, choose a new topic <--//
      this.topic = this._chooseATopic();
      //--> CAN be the same as the old topic, but if it is...
      //...runs _chooseATopic ONCE more to allow for more variety:
      if (this.topic === oldTopic){
        this.topic = this._chooseATopic();
      }
      this.topicTimeLeft = random(4) + 1;
    }
  }
  //========================//

  _passionTopic(){
    var option = random(2);
    //talk about a random person's random passion (or lack thereof)
    var r = random(this.p0.ship.people.length);
    var tempPerson = this.p0.ship.people[r];
    var passionString = "";
    var allPassions = Object.keys(tempPerson.passions);
    var allPassionsOfPerson = tempPerson.getPassionsAsArray();
    if (option == 1){
      if (allPassionsOfPerson.length > 0){
        //choose a passion at random
        passionString = tempPerson.getName() + "'s love of " + allPassionsOfPerson[random(allPassionsOfPerson.length)];
      } else {
        passionString = tempPerson.getName() + "'s lack of hobbies"
      }
    } else {
      passionString = allPassions[random(allPassions.length)];
    }
    return passionString;
  }

  _celestialBodyTopic(){
    //talk about a random planet OR station, or the home planet of one of the people.
    var planetString = "";
    var option = random(3);
    if (option == 0) {
      //STATION
      var r = random(this.p0.galaxy.spaceStations.length);
      planetString += this.p0.galaxy.spaceStations[r].name;
    } else if (option == 1){
      //PLANET
      var r = random(this.p0.galaxy.planets.length);
      planetString += "the planet of " + this.p0.galaxy.planets[r].name;
    } else {
      //HOME PLANET
      planetString += this.p0.getName() + "'s home planet of " + this.p0.originPlanet.name;
    }
    return planetString;
  }

  //TODO: adjust this. not using at the moment.
  _enemyShipTopic(){
    var string = "";
    if (this.p0.ship.battleHistory.length > 0){
      //just grab the last battle history element.
      string = "the time they " + this.p0.ship.battleHistory[this.p0.ship.battleHistory.length -1];
    } else {
      //no battles recorded
      string = "the peacefulness of space recently"
    }
    return string;
  }

  _destinationTopic(){
    var string = "";
    if (this.p0.ship.dockingPossible && this.p0.ship.whichCelestialBody != null){
      var r = random(2);
      if (r == 0){
        string = "the proximity of " + this.p0.ship.whichCelestialBody.name;
      } else {
        string = "the challenges of docking a spaceship";
      }

    } else if (this.p0.ship.currentJourney != null){
      //-> if it's a space station, get their relationship to it.
      var feelings = ["the dangers of",
                      "what they'd do when they arrived at",
                      "how pleasant it will be to go to"];
      var feeling = "";
      var dest = this.p0.ship.currentJourney.destination;
      if (dest.type == "station"){
        feeling = feelings[dest.faction.relationLevel];
      } else if (dest.type == "planet"){
        feeling = feelings[random(feelings.length)];
      } else {
        //the evil
        feeling = "the utter insanity of going to";
      }
      string = feeling + " " + dest.name;

    } else {
      string = "the ship's apparent lack of destination"
    }
    //-----//
    return string;
  }

}
//====================//

class PairTask extends Task {
  constructor(person, otherPerson, initiator, otherPT, pairAct) {
    super(person);
    this.otherPerson = otherPerson;
    this.initiator = initiator;
    person.waitingFor.push(this);
  }

// Precondition: this.initiator == true
  initiate(otherPT, pairAct){
      this.pairActivity = pairAct;
      otherPT.pairActivity = this.pairActivity;
  }

  run(){
    super.run();
    this.pairActivity.run(this);
  }

  adjustBothKinshipLevels(adjustment){
    //adjust both, grab the desc from only one though.
    var relationship = this.person.adjustKinship(this.otherPerson.id, adjustment);
    this.otherPerson.adjustKinship(this.person.id, adjustment);
    return relationship;
  }

}

class TalkingTask extends PairTask {
  constructor(person, otherPerson, initiator) {
    super(person, otherPerson, initiator);
    this.taskName = "Talking";
    this.howLong = 3;
    this.initialDescription = "";
    this.initiate();
  }

  initiate() {
    if (this.initiator) {
      var otherPT = new TalkingTask(this.otherPerson, this.person, false);
      var pairAct = new Conversation(this, otherPT, this.person, this.otherPerson);
      super.initiate(otherPT, pairAct);
    }
  }

  taskDone(){
    //1. after talking, adjust relationship
    //...
    var iName = this.person.getName();
    var desc = this.describeFinal();
    if (desc != ""){
      this.person.log.push([this.person.ship.tick, iName + desc]);
    }
  }

  describeFinal(){
    if (!this.initiator){
      return "";
    }
    var string = " had a conversation with " + this.otherPerson.getName() + " about ";
    for (var i = 0; i < this.pairActivity.topicHistory.length; i++) {
      if ((this.pairActivity.topicHistory.length > 1) && (i == this.pairActivity.topicHistory.length - 1)) {
        string += ", and ";
      } else if (i != 0){
        string += ", ";
      }
      string += this.pairActivity.topicHistory[i];
    }
    string += ".";
    //-----ADJUST KINSHIP LEVEL------//
    //--> random, for now.
    var kinshipAdjuster = random(3);
    var relationship = "";
    if (kinshipAdjuster == 0){
      //no change.
      relationship = this.adjustBothKinshipLevels(0);
    } else {
      //more likely to increase kinship (2/3)
      relationship = this.adjustBothKinshipLevels(1);
    }
    //---> if their relationship has changed, add it to the string!
    if (relationship != ""){
      string += " [" + this.person.getName() + " and " + this.otherPerson.getName() + " are " + relationship + "s].";
    }
    //-------------------------------//
    return string;
  }

}

// -------------------------------------- //

class MeetingNewPeopleTask extends PairTask {
  constructor(person, initiator, otherPerson = null){
    super(person, otherPerson, initiator);
    this.taskName = "Meeting New People";
    this.howLong = 2;
    this.initialDescription = "";

    //MEET A NEW PERSON: ie make otherPerson not null...
    //1. if there's still people to meet && you're the initatior...
    if (this.person.ship.people.length > this.person.knownPeopleInfo.length + 1 && initiator) {
      var picked = false;
      while (!picked) {
        var r = random(this.person.ship.people.length);
        if (this.person.ship.people[r] === this.person) {
          //ie can't meet yourself
          continue;
        } else {
          var isInKnownPeople = false;
          for (var i = 0; i < this.person.knownPeopleInfo.length; i++) {
            //if the ID of the known person == the randomly chosen person's id...
            if (this.person.knownPeopleInfo[i][0] == this.person.ship.people[r].id) {
              //then set isInKnownPeople to indeed by true.
              isInKnownPeople = true;
              break;
            }
          }
          if (!isInKnownPeople) {
            this.otherPerson = this.person.ship.people[r];
            picked = true;
          }
        }
      }
    }  // otherwise, the person is not the initiator, so don't have to do anything here
    //finally...
    this.initiate();
  }

  initiate() {
    if (this.initiator) {
      var otherPT = new MeetingNewPeopleTask(this.otherPerson, false, this.person); //HERE
      var pairAct = new Conversation(this, otherPT, this.person, this.otherPerson); // TODO: Change this from conversation to something else
      super.initiate(otherPT, pairAct);
    }
  }

  run(){
    super.run();
  }

  taskDone(){
    if (this.otherPerson != null){
      var kinshipLevel = INITITAL_KINSHIP;
      this.person.knownPeopleInfo.push([this.otherPerson.id, kinshipLevel, 1]);
      var iName = this.person.getName();
      this.person.log.push([this.person.ship.tick, iName + this.describeFinal()]);
    }

  }

  describeFinal(){
    if (this.otherPerson != null){
      var iName = this.otherPerson.getName();
      return " met " + iName + " for the first time.";
    } else {
      return " met... no one?";
    }
  }

}

// -------------------------------------- //

//2-player games :)
class GameTask extends PairTask {
  constructor(person, otherPerson, initiator){
    super(person, otherPerson, initiator);
    this.taskName = "Game";
    this.howLong = 4;
    this.initialDescription = "";
    this.initiate();
  }

  initiate() {
    if (this.initiator) {
      var otherPT = new GameTask(this.otherPerson, this.person, false); //HERE
      var pairAct = new Conversation(this, otherPT, this.person, this.otherPerson); // TODO: Change this from conversation to something else
      super.initiate(otherPT, pairAct);
    }
  }

  run(){
    super.run();
  }

  taskDone(){
    if (this.otherPerson != null){
      var iName = this.person.getName();
      var desc = this.describeFinal();
      if (desc != ""){
        this.person.log.push([this.person.ship.tick, iName + desc]);
      }
    }
  }

  describeFinal(){
    if (!this.initiator){
      return "";
    }
    var possible_games = ["go-fish","checkers","Cosmical Confrontation II","Cosmical Confrontation Classic","tic-tac-toe"];
    var game = possible_games[random(possible_games.length)];
    var string = " played a game of " + game + " with " + this.otherPerson.getName() + ".";
    var result = random(3);
    if (result == 0){
      string += " The winner was " + this.otherPerson.getName() + ".";
      this.otherPerson.adjustMood(1); //gets a little happier.
    } else if (result == 1){
      string += " The game ended in a tie.";
    } else {
      string += " The winner was " + this.person.getName() + ".";
      this.person.adjustMood(1);
    }
    //-----ADJUST KINSHIP LEVEL------//
    //--> random, for now.
    var kinshipAdjuster = random(10);
    var relationship = "";
    if (kinshipAdjuster == 0){
      //bad
      relationship = this.adjustBothKinshipLevels(-1);
      string += " " + this.person.getName() + " accused " + this.otherPerson.getName() + " of cheating.";
    } else if (kinshipAdjuster <= 5){
      //no change.
      relationship = this.adjustBothKinshipLevels(0);
    } else {
      //most likely!
      relationship = this.adjustBothKinshipLevels(1);
    }
    //---> if their relationship has changed, add it to the string!
    if (relationship != ""){
      string += " [" + this.person.getName() + " and " + this.otherPerson.getName() + " are " + relationship + "s].";
    }
    //-------------------------------//
    return string;
  }

}

//-----------------------------//


//Have an argument D:<
class ArgumentTask extends PairTask {
  constructor(person, otherPerson, initiator){
    super(person, otherPerson, initiator);
    this.taskName = "Argument";
    this.howLong = 3;
    this.initialDescription = "";
    this.initiate();
  }

  initiate() {
    if (this.initiator) {
      var otherPT = new ArgumentTask(this.otherPerson, this.person, false); //HERE
      var pairAct = new Conversation(this, otherPT, this.person, this.otherPerson); // TODO: Change this from conversation to something else
      super.initiate(otherPT, pairAct);
    }
  }

  run(){
    super.run();
  }

  taskDone(){
    if (this.otherPerson != null){
      var iName = this.person.getName();
      var desc = this.describeFinal();
      if (desc != ""){
        this.person.log.push([this.person.ship.tick, iName + desc]);
      }
    }
  }

  describeFinal(){
    if (!this.initiator){
      return "";
    }
    var string = " had an argument with " + this.otherPerson.getName() + ".";
    //-----ADJUST KINSHIP LEVEL------//
    //--> random, for now.
    var kinshipAdjuster = random(6);
    var relationship = "";
    if (kinshipAdjuster == 0){
      //good! Rarest.
      relationship = this.adjustBothKinshipLevels(1);
      string += " It ended amicably.";
    } else if (kinshipAdjuster > 0 && kinshipAdjuster <= 3){
      //no change.
      relationship = this.adjustBothKinshipLevels(0);
      string += " They agreed to disagree.";
    } else {
      //most likely to be bad.
      relationship = this.adjustBothKinshipLevels(-1);
      string += " Offense was taken.";
    }
    //---> if their relationship has changed, add it to the string!
    if (relationship != ""){
      string += " [" + this.person.getName() + " and " + this.otherPerson.getName() + " are " + relationship + "s].";
    }
    //-------------------------------//
    return string;
  }

}


//-----------------------------//
//-----------------------------//


class EnemyShipTask extends Task{
  constructor(person) {
    super(person);
    this.taskName = "Enemy Ship";
    this.howLong = 4;
    this.initialDescription = "";
  }

  run(){
    super.run();
  }

  taskDone() {
    return super.taskDone();
  }

  describeFinal(){
    return " reported to battle stations.";
  }
}

//-----------------------------//

//-> person is sick / injured (can happen randomly, or if they are already sick/injured)
class PoorHealthTask extends Task{
  constructor(person) {
    super(person);
    this.taskName = "Poor Health";
    this.howLong = 10;
    this.getsTreatment = false;
    this.injuryDesc = ""; //injury, or illness.
    this.initialDescription = this._getInitDesc();
    this.finalDesc = "";
  }

  _getInitDesc(){
    if (this.person.hasMajorInjury() != ""){
      this.injuryDesc = this.person.hasMajorInjury();
      this.getsTreatment = true;
      return " is laying in bed in the sick bay with a " + this.injuryDesc + ".";
    }

    if (this.person.hasMinorInjury() != ""){
      this.injuryDesc = this.person.hasMinorInjury();
      this.getsTreatment = true;
      if (random(2) == 0){
        return " is healing from a " + this.injuryDesc + ".";
      } else {
        return " complained about " + this.person.getPronoun(true) + " " + this.injuryDesc + ".";
      }
    }

    if (this.person.isSick()){
      this.injuryDesc = this.person.isSick();
      this.getsTreatment = true;
      return "...";
    }

    //--otherwise.... (minor thing, so just loses a bit of health)
    this.getsTreatment = false;
    return " is feeling a little ill.";
  }

  run(){
    super.run();
    if (this.getsTreatment){
      this.person.adjustHealth(1);
    } else {
      this.person.adjustHealth(-1);
    }
  }

  taskDone() {
    //--TREATMENT--//
    //TODO: check if medic. If so, better chance for healing!
    if (this.getsTreatment){
      var skill = 0; //medic's skill (0 if no medic)
      var chance_to_heal = this.person.health + skill;
      var chance_to_get_worse = 1;
      if (chance(chance_to_heal, 100)){
        if (this.person.hasMajorInjury()){
          //upgrade.
          this.person.updateHealthIssues_Injury(MINOR_INJURIES, this.injuryDesc);
          this.finalDesc = "'s " + this.injuryDesc + " is healing well.";
        } else {
          this.person.updateHealthIssues_Injury(NO_INJURIES, "");
          this.finalDesc = " is fully healed! Wonderful.";
        }
        this.person.adjustHealth(20);
      } else if (chance(chance_to_get_worse, 100)){
        this.person.adjustHealth(-10);
        this.finalDesc = "'s condition has deteriorated."
      } else {
        this.finalDesc = " hopes " + this.person.getPronoun(true) + " " + this.injuryDesc + " heals soon.";
      }
    }
    return super.taskDone();
  }

  describeFinal(){
    if (this.getsTreatment){
      return this.finalDesc;
    } else {
      return " is starting to feel a little better.";
    }
  }
}


//====================================//

class DeathTask extends Task{
  constructor(person) {
    super(person);
    this.taskName = "Death";
    this.howLong = 1;
    var cause = this.person.getCauseOfDeath();
    this.initialDescription = " has died of " + cause + ".";
  }

  run(){
    super.run();
  }

  taskDone() {
    return super.taskDone();
  }

  describeFinal(){
    return " has passed away.";
  }
}

//====================================//

//kind of like a single-person conversation
class WonderingTask extends Task{
  constructor(person) {
    super(person);
    this.taskName = "Wondering";
    this.howLong = 2;
    this.initialDescription = "";
    this.finalDesc = "";
  }

  run(){
    super.run();
  }

  taskDone() {
    var possibleThoughts = [];
    if (this.person.isStarving){
      possibleThoughts.push(" thought about how hungry " + this.person.getPronoun(false) + " is.");
    }
    if (this.person.ship.people.length == 1){
      possibleThoughts.push(" thought about how lonely " + this.person.getPronoun(false) + " felt.");
    }
    if (this.person.ship.deceased.length > 0){
      var r = random(this.person.ship.deceased.length);
      possibleThoughts.push(" mourned the loss of " + this.person.ship.deceased[r] + ".");
    }
    //--other topics--//
    var otherThoughts = [" wondered about the captain's mysterious past.",
                          " wondered if the captain could, in fact, hear the crew's thoughts.",
                          " pondered the rumours of ghosts in the lower hallways.",
                          " puzzled over the unfamiliar technology of The " + this.person.ship.shipName + ".",
                          " reflected on the events of the past few days.",
                          " mulled over " + this.person.getPronoun(true) + " options.",
                          " contemplated the magnificent view out the ship's windows.",
                          " dwelled on " + this.person.getPronoun(true) + " past."];
    var other_r = random(otherThoughts.length);
    possibleThoughts.push(otherThoughts[other_r]);
    //===============//
    if (possibleThoughts.length <= 0){
      this.finalDesc = " was lost in thought."; //probably won't happen.
    } else {
      this.finalDesc = possibleThoughts[random(possibleThoughts.length)];
    }
    return super.taskDone();
  }

  describeFinal(){
    return this.finalDesc;
  }
}

//======================================//

class WheatTask extends Task{
  constructor(person) {
    super(person);
    this.taskName = "Wheat";
    this.howLong = 5;
    this.initialDescription = "";
  }

  run(){
    super.run();
  }

  taskDone() {
    return super.taskDone();
  }

  describeFinal(){
    // (1 bushel = 200 cups of flour)
    var hasWheat = this.person.ship.millFlour(50); //milled wheat into 50 cups.
    if (hasWheat){
      return " milled some wheat into flour."
    } else {
      return " thought about wheat.";
    }

  }
}
