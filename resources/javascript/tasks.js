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
      var iName = "<i>" + this.person.name + "</i>"
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
      this.person.fitness += 2;
    } else if (this.notSuccessful == false){  // ie 'if successful'
      this.person.fitness += 1;
    } //- otherwise, fitness does not increase
    //decrease energy_level
    this.person.energy_level -= 1;
    if (this.person.energy_level < 0){
      this.person.energy_level = 0;
    }
    //enforce upper limit of fitness
    if (this.person.fitness > 100){
      this.person.fitness = 100;
    }
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
    this.howLong = 10;
    this.initialDescription = " retired to " + this.person.getPronoun(true) + " quarters.";
  }

  run(){
    this.person.energy_level += 1;
    if (this.person.energy_level > 100){
      this.person.energy_level = 100;
    }
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
    this.person.energy_level -= 1;
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
    this.partToFix = randomKey(this.person.ship.parts);
  }

  run(){
    super.run();
    this.person.ship.repair(this.partToFix);
    this.person.energy_level -= 1;
  }

  taskDone() {
    //-> Done
    return super.taskDone();
  }

  describeFinal(){
    return " has completed a minor repair on the " + this.partToFix + ".";
  }
}

//-------------------------------------------//
//AVAILABLE_SPECIALTIES = ["Weapons Specialist","Linguist","Botanist","Storyteller","Medic"];
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
    this.person.energy_level -= 1;
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
      this.finalDescription = " was acting confused.";
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
    return " watered " + this.person.getPronoun(true) + " plants.";
  }
  //"Storyteller"
  _storytellerActivity(){
    //-> (TODO) INCREASE OR DECREASE crews' stats.
    var r = random(2);
    var result = "";
    var desc = "";
    if (r == 0){
      desc = "story with a happy ending";
      result = "Everyone became a little happier.";
    } else {
      desc = "tragic tale";
      result = "There wasn't a dry eye in sight."
    }
    return " told everyone a " + desc + ". " + result;
  }
  //Medic
  _medicActivity(){
    return " cleaned " + this.person.getPronoun(true) + " medical instruments.";
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
    var options = ["cold-toned colours", "fiery colours", "roughly-drawn figures","imbedded LEDs",
                    "hand-made frame", "ocean scene", "abstract shapes", "thickly-applied paint"]
    return options[random(options.length)];
  }

  taskDone() {
    //-> create a 'Thing' in the Ship
    var observation = this._aboutThePainting(); //TODO : change this up
    this.person.ship.addAThing("painting","a painting by " + this.person.name, observation);
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
  }

  run(){
    super.run();
  }

  taskDone() {
    //-> create a 'Thing' in the Ship
    //observation format should be, for example, 'they noted the [blue and white colour] with interest'
    var typeOptions = ["treat","food"];
    var type = typeOptions[random(2)];
    var observation = "delicious-looking " + type; //TODO : change this up
    //location = galley or lounge
    var galleyOrLounge = ["galley","lounge"];
    var r = random(galleyOrLounge.length);
    if (type == "treat"){
      this.person.ship.addAThing("food","cake baked by " + this.person.name, observation, galleyOrLounge[r]);
    } else {
      this.person.ship.addAThing("food","stew cooked by " + this.person.name, observation, galleyOrLounge[r]);
    }
    //Done
    return super.taskDone();
  }

  describeFinal(){
    return " cooked something.";
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
    var choices = ["neutral","passion","celestialBody","destination","cargo"];
    var lots = [1, 1, 1, 1, 1];
    //~~~adjust the odds~~~//
    if (this.p0.ship.dockingPossible){
      lots[3] = 5; // increase destination-topic chance
    }
    if (this.p0.ship.craftedCargoName != ""){
      lots[4] = 2;
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
        passionString = tempPerson.name + "'s love of " + allPassionsOfPerson[random(allPassionsOfPerson.length)];
      } else {
        passionString = tempPerson.name + "'s lack of hobbies"
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
      planetString += this.p0.name + "'s home planet of " + this.p0.originPlanet.name;
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

  describeFinal(){
    var string = " had a conversation with " + this.otherPerson.name + " about ";
    for (var i = 0; i < this.pairActivity.topicHistory.length; i++) {
      if ((this.pairActivity.topicHistory.length > 1) && (i == this.pairActivity.topicHistory.length - 1)) {
        string += ", and ";
      } else if (i != 0){
        string += ", ";
      }
      string += this.pairActivity.topicHistory[i];
    }
    return string + ".";
  }

  taskDone(){
    //1. after talking, adjust relationship
    //...
    var iName = "<i>" + this.person.name + "</i>"
    this.person.log.push([this.person.ship.tick, iName + this.describeFinal()]);
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
        if (this.person.ship.people[r] == this.person) {
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

  describeFinal(){
    //TODO: probably put this check somewhere else..
    if (this.otherPerson != null){
      var iName = "<i>" + this.otherPerson.name + "</i>"
      return " met " + iName + " for the first time.";
    } else {
      return " met... no one?";
    }
  }
  taskDone(){
    if (this.otherPerson != null){
      this.person.knownPeopleInfo.push([this.otherPerson.id,1,1]);
      var iName = "<i>" + this.person.name + "</i>"
      this.person.log.push([this.person.ship.tick, iName + this.describeFinal()]);
    }

  }

}

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