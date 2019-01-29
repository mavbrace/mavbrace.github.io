var FEMALE = 0;
var MALE = 1;

var MOODS = ["terrible","bad","neutral","so-so","good","wonderful"];

var MOTIVES = ["adventure","fortune","fame","company","revenge"];

var NOT_MOTIVATED = 0;
var MOTIVATED = 1;
var EXTREMELY_MOTIVATED = 2;

var NO_INJURIES = 0;
var MINOR_INJURIES = 1;
var MAJOR_INJURIES = 2; // placed in sick bay.

var INITITAL_KINSHIP = 4;
var KINSHIP_NAMES = ["bitter rival","rival","stranger","stranger",
                    "aquaintance","aquaintance",
                    "colleague","pal","good mate",
                    "friend","friend","friend","good friend",
                    "close friend","best friend"];


//-- PERSON --//
class Person{

  constructor(galaxy, ship, id, name, gender, fitness, title, specialty, originPlanet){
    this.hiringStage = 0; //before they're part of your crew...
    this.guessedMotive = ""; //only a guess. True motive is below.
    //-----
    this.galaxy = galaxy;
    this.ship = ship;
    this.id = id;
    this.name = name;
    this.gender = gender;
    this.originPlanet = originPlanet; // (string) name of person's origin planet
    //----attributes of a person----//
    this.fitness = fitness; // 0 -> 100
    // note: each passion is dealt with slightly differently
    this.passions = { "fitness": false,
                      "painting": false,
                      "cooking": false  };
    this.motivation_level = MOTIVATED;
    this.energy_level = 50; // 0 -> 100
    this.moodIndex = 2; //pertains to MOODS
    this.motive = MOTIVES[random(MOTIVES.length)]; //pertains to MOTIVES; what drives them.
    //this.competance = 0;
    this.isFirstMate = false; //1 first mate, who deals with stuff.
    this.health = 100; // if 0, dead.
    this.healthIssues = { "isSick": false,
                          "injuryLevel": NO_INJURIES,
                          "injuryDesc": ""    };
    //------------[is...]-----------//
    this.isStarving = false;
    this.deathIsClose = false;
    this.isDead = false;
    this.pleaseRemove = false;
    //------------------------------//
    this.title = title;
    this.specialty = specialty; // only need to fill in if person is a specialist ("" if none)
    this.knownPeopleInfo = []; // [ID of person you know, level of like, type of relationship]
    this.log = [];
    //----task things----//
    this.task = null; //One main task
    this.possibleTasks = []; //A list of tasks for the person to choose from, when they choose a new task
    this.waitingFor = []; // List of tasks in queue
    //-> probabilites for each and every task:
    this.task_chances = { "DoNothing":1,
                          "Sleeping":1,
                          "Exercise":1,
                          "MeetingNewPeople":1,
                          "Talking":1,
                          "Navigator":1,
                          "Engineer":1,
                          "Specialist":1,
                          "Painting":1,
                          "Wander":1,
                          "Cooking":1,
                          "EnemyShip":100,
                          "PoorHealth": 1,
                          "Death": 100,
                          "Wondering": 1,
                          "Game": 1,
                          "Argument": 1 };
    //-> visuals
    this.visualFeatures = {"hairColour":null,
                          "skin":null,
                          "upperFace":null,
                          "lowerFace":null,
                          "faceOutline":null,
                          "hairOutline":null,
                          "clothingColour":null,
                          "clothingOutline":null
    }
    this.hairlength = 0;
    this._generateVisualFeatures(); //fill in visualFeatures, and hairlength
  }


  //--> fill out this.visualFeatures
  _generateVisualFeatures(){
    //----CLASSIFICATIONS----//
    //GROUP A, B, and C (based on origin)
    //MASC, FEM, and EITHER
    var features = ['Fem','Masc','Either'];
    //note: the features translate to: masc+either, fem+either, or just either
    var groups = ['A','B','C'];
    var group = groups[this.originPlanet.indexID % 3];
    var feature = features[this.gender];
    this.hairLength = random(3);
    //----------------------//
    //3 version each of hairColour (_short, _med, _long)
    //3 versions each of hairOutline (_short, _med, _long)
    //for each part... choose one.
    var keyParts = Object.keys(this.visualFeatures);
    for (var i = 0; i < keyParts.length; i++){

      if (group == 'A' && (keyParts[i] in groupA_images)){
          var r = random(groupA_images[keyParts[i]].length);
          this.visualFeatures[keyParts[i]] = groupA_images[keyParts[i]][r];
      } else if (group == 'B' && keyParts[i] in groupB_images){
        var r = random(groupB_images[keyParts[i]].length);
        this.visualFeatures[keyParts[i]] = groupB_images[keyParts[i]][r];
      } else if (group == 'C' && keyParts[i] in groupC_images){
        var r = random(groupC_images[keyParts[i]].length);
        this.visualFeatures[keyParts[i]] = groupC_images[keyParts[i]][r];
      //=====//
      } else if (feature == 'Masc' && (keyParts[i] in masc_images)){
          //-> chance for it to be an either image, as well.
          if (random(3) == 0 && keyParts[i] in either_images){
            var r = random(either_images[keyParts[i]].length);
            this.visualFeatures[keyParts[i]] = either_images[keyParts[i]][r];
          } else {
            var r = random(masc_images[keyParts[i]].length);
            this.visualFeatures[keyParts[i]] = masc_images[keyParts[i]][r];
          }
      //----//
      } else if (feature == 'Fem' && (keyParts[i] in fem_images)){
          //-> chance for it to be an either image, as well
          if (random(3) == 0 && keyParts[i] in either_images){
            var r = random(either_images[keyParts[i]].length);
            this.visualFeatures[keyParts[i]] = either_images[keyParts[i]][r];
          } else {
            var r = random(fem_images[keyParts[i]].length);
            this.visualFeatures[keyParts[i]] = fem_images[keyParts[i]][r];
          }
      //----//
      } else if (keyParts[i] in either_images){
          var r = random(either_images[keyParts[i]].length);
          this.visualFeatures[keyParts[i]] = either_images[keyParts[i]][r];
      //----//
      } else {
        console.log("Error adding visual feature.");
      }
    }
  }


  //---[ GETS ]---//

  getName(){
    return "<u>" + this.name + "</u>";
  }

  hasPoorHealth(){
    //in general!
    if (this.hasMajorInjury() != ""){
      return true;
    }
    if (this.hasMinorInjury() != ""){
      return true;
    }
    if (this.isSick()){
      return true;
    }
    return false;
  }

  hasMajorInjury(){
    if (this.healthIssues["injuryLevel"] == MAJOR_INJURIES){
      return this.healthIssues["injuryDesc"];
    } else {
      return "";
    }
  }
  hasMinorInjury(){
    if (this.healthIssues["injuryLevel"] == MINOR_INJURIES){
      return this.healthIssues["injuryDesc"];
    } else {
      return "";
    }
  }
  isSick(){
    if (this.healthIssues["isSick"]){
      return true;
    } else {
      return false;
    }
  }


  //--- RETURNS NAME -OR- IF IT'S THE SAME PERSON, RETURN "him/her/themself".
  getPlainName(testPerson){
    if (testPerson === this){
      if (this.gender == FEMALE){
        return "herself";
      } else if (this.gender == MALE){
        return "himself";
      } else {
        return "themself";
      }
    } else {
      return testPerson.name;
    }
  }

  //simply returns "himself","herself", or "themself"
  getSelfPronoun(){
    if (this.gender == FEMALE){
      return "herself"
    } else if (this.gender == MALE){
      return "himself"
    } else {
      return "themself"
    }
  }


  // get all passions THAT THE PERSON HAS (ie == true) as a list
  getPassionsAsArray(){
    var keys = Object.keys(this.passions);
    var passionArray = [];
    for (var i = 0; i < keys.length; i++){
      if (this.passions[keys[i]] == true){
        passionArray.push(keys[i]);
      }
    }
    return passionArray;
  }


  //'possessive' is a boolean value
  getPronoun(possessive){
    //he/she and his/her (possessive)
    if (this.gender == FEMALE){
      if (possessive){
        return "her";
      } else {
        return "she";
      }
    } else if (this.gender == MALE){
      if (possessive){
        return "his";
      } else {
        return "he";
      }
    } else {
      if (possessive){
        return "their";
      } else {
        return "they";
      }
    }
  }

  getFullDesc(){
    /* (Title) Name, from Origin.
    *  - specialty
    *  - Name has a passion for Passion.
    *  - Fitness level: Motivation level: Energy level: Mood:
    */
    var desc = "";

    var passionsArray = this.getPassionsAsArray();
    if (passionsArray.length > 0){
      desc += "<br>" + this.name + " has a passion for ";
      for (var i = 0; i < passionsArray.length; i++){
        if (i > 0){
          desc += ", ";
        }
        desc += passionsArray[i]; //TODO: format this correctly (for multiple)
      }
      desc += ".";
    }

    if (this.isFirstMate){
      desc += "<br>< FIRST MATE >"
    }
    if (this.hasPoorHealth()){
      desc += "<br>## has a " + this.healthIssues["injuryDesc"] + " ##";
    }
    desc += "<br>-fitness level: " + this.fitness;
    desc += "<br>-motivation level: " + this.motivation_level;

    return desc;
  }
  //================//


  //this.health: 0 -> 100, where 0 = dead.
  adjustHealth(adjustment){
    this.health = this.health + adjustment;
    if (this.health > 100){
      this.health = 100;
    }
    if (this.health < 0){
      this.health = 0; //TODO: make dead.
    }
  }


  // 'adjustment' should be +1 or -1... but it's also okay if it's 0
  adjustMood(adjustment){
    //mood range is [-1 to 2] (inclusive) see MOOD constants
    this.moodIndex = this.moodIndex + adjustment;
    if (this.moodIndex >= MOODS.length){
      this.moodIndex = MOODS.length-1;
    }
    if (this.moodIndex < 0){
      this.moodIndex = 0;
    }
  }


  //adjustment of energy. Can be -n, 0, or n.
  adjustEnergy(adjustment){
    this.energy_level += adjustment;
    if (this.energy_level > 100){
      this.energy_level = 100;
    }
    if (this.energy_level < 0){
      this.energy_level = 0;
    }
  }


  //adjustment of fitness. Can be -n, 0, or n.
  adjustFitness(adjustment){
    this.fitness += adjustment;
    if (this.fitness > 100){
      this.fitness = 100;
    }
    if (this.fitness < 0){
      this.fitness = 0;
    }
  }


  //input: 'amount' should be from 1 -> ~90
  causeRandomInjury(amount){
    this.health -= amount;
    if (this.health < 0){
      this.health = 0; //TODO: they're dead x_x
    }
    var desc = "";
    if (amount <= 20){
      return this.getName() + " fell, luckily suffering only a few bruises.";
    } else if (amount > 20 && amount <= 50){
      this.updateHealthIssues_Injury(MINOR_INJURIES, "broken wrist");
      return this.getName() + " reported a broken wrist.";
    } else {
      this.updateHealthIssues_Injury(MAJOR_INJURIES, "fractured skull");
      return this.getName() + " was brought to the sick bay with major injuries.";
    }
  }


  //causes can be: "fire", "explosion", "fall", "projectile", "animal attack"
  causeSpecificInjury(amount, cause){
    this.health -= amount;
    if (this.health < 0){
      this.health = 0; //they're dead...
    }
    var desc = "";
    //========================//
    if (amount <= 20){
      if (cause == "explosion" || cause == "fall") {
        return "few bruises";
      } else {
        return "few scratches";
      }
    }
    var a = "a";
    if (startsWithVowel(cause)){
      var a = "an";
    }
    this.ship.shipHistory.push("====| REPORT |====<br>" + this.getName() + " suffered injuries due to " + a + " " + cause + ".<br>");
    //========================//
    if (amount > 20 && amount <= 50){
      var possibleInjuries = [];
      if (cause == "fire"){
        possibleInjuries.push("minor burn");
      } else if (cause == "explosion"){
        possibleInjuries.push("broken wrist", "sprained ankle", "minor burn",
                              "fractured rib", "minor chemical burn", "collection of deep cuts");
      } else if (cause == "fall"){
        possibleInjuries.push("broken wrist", "sprained ankle", "broken arm",
                              "fractured rib", "sprained wrist", "concussion");
      } else if (cause == "projectile"){
        possibleInjuries.push("deep cut","wounded arm","wounded hand","lost finger");
      } else if (cause == "animal"){
        possibleInjuries.push("collection of scrapes","collection of deep cuts","collection of bruises");
      } else {
        //something else...
        possibleInjuries.push("broken wrist", "sprained ankle", "broken arm",
                              "fractured rib", "sprained wrist", "concussion");
      }

      var inj = possibleInjuries[random(possibleInjuries.length)];
      this.updateHealthIssues_Injury(MINOR_INJURIES, inj);
      return inj;
    }
    //========================//
    if (amount > 50){
      var possibleInjuries = [];
      if (cause == "fire"){
        possibleInjuries.push("bad burn");
      } else if (cause == "explosion"){
        possibleInjuries.push("fractured skull","concussion","broken leg","3rd-degree burn",
                              "collection of life-threatening injuries");
      } else if (cause == "fall"){
        possibleInjuries.push("fractured skull","concussion","broken leg", "collection of life-threatening injuries");
      } else if (cause == "projectile"){
        possibleInjuries.push("pierced lung","projectile lodged in the skull","punctured stomach",
                              "collection of life-threatening injuries");
      } else if (cause == "animal attack"){
        possibleInjuries.push("torn throat","collection of life-threatening injuries");
      } else {
        //something else...
        possibleInjuries.push("broken wrist", "sprained ankle", "broken arm",
                              "fractured rib", "sprained wrist", "concussion");
      }

      var inj = possibleInjuries[random(possibleInjuries.length)];
      this.updateHealthIssues_Injury(MAJOR_INJURIES, inj);
      return inj;
    }

    //shouldn't reach here...
    console.log("Error: something went wrong when giving injuries.");
    return "...";

  }

  //=====~~~~=====//
  updateHealthIssues_Injury(level, desc){
    this.healthIssues["injuryLevel"] = level;
    this.healthIssues["injuryDesc"] = desc;
    if (level == MINOR_INJURIES){
      this.adjustMood(-2); //also, decrease mood by 2.
      this.task_chances["PoorHealth"] += 10;
    } else if (level == MAJOR_INJURIES){
      this.adjustMood(-3); //also, decrease mood by 3.
      this.task_chances["PoorHealth"] = 100;
    } else if (level = NO_INJURIES){
      this.adjustMood(1); //happier!
      this.task_chances["PoorHealth"] = 1;
    }
  }
  //=====~~~~=====//

  //========[ TASKS ]========// //---> Runs every tick
  //=======//
  //-> waitingFor
  waitingForTasks(){
    // Waiting for is just for pairs
    // Assuming this.waitingFor has otherPerson thing (for now)
    // Checks if both people are doing nothing, then checks if the tasks
    // they are waiting for are the same.
    //-----//
    //before all that, check if the person you're waiting for.. is dead.
    if (this.waitingFor.length > 0 && (!this.waitingFor[0].otherPerson || !this.waitingFor[0] || !this.waitingFor[0].otherPerson.waitingFor[0] || this.waitingFor[0].otherPerson.isDead)){
      this.task = null; //make sure person is free to choose a dif task.
      this.waitingFor.splice(0, 1); //remove from waiting-for array
      return;
    }
    //if alive, continue on with the check...
    if (this.waitingFor.length > 0 &&
      this.task == null && this.waitingFor[0].otherPerson.task == null &&
      this.waitingFor[0].pairActivity === this.waitingFor[0].otherPerson.waitingFor[0].pairActivity) {
      // Sets both people's tasks to their next waiting for tasks.
      this.task = this.waitingFor[0];
      this.waitingFor[0].otherPerson.task = this.waitingFor[0].otherPerson.waitingFor[0];
      // Remove from waiting-for array for both people:
      this.waitingFor[0].otherPerson.waitingFor.splice(0, 1);
      this.waitingFor.splice(0, 1);
    }
  }


  manageTasks(){
      //1. choose a new task if needed
      if (this.task == null && this.waitingFor.length == 0){
        this.chooseNewTask();
      }
      //2. run the task
      if (this.task != null) {
        this.task.run();
      }
  }

  endTasks(){
    if (this.task != null && this.task.isDone()) {
      this.task.taskDone();
      this.task = null;
    }
  }
  //=======//

  chooseNewTask(){
    //====[ TASK IDS ENCYCLOPEDIA ]=====//
    // 0 = DoNothingTask
    // 1 = Sleeping Task
    // 2 = ExerciseTask
    // 3 = MeetingNewPeopleTask
    // 4 = TalkingTask
    // 5, 6, 7 = NavigatorTask, EngineerTask, SpecialistTask
    // 8 = PaintingTask
    // 9 = WanderTask
    // 10 = CookingTask
    // 11 = EnemyShipTask
    // 12 = PoorHealthTask
    // 13 = DeathTask
    // 14 = WonderingTask
    // 15 = GameTask
    // 15 = ArgumentTask
    //==================================//
    this.possibleTasks = []; //list of task 'IDs'; empty and refill here...
    //-> probability list that will be generated (and picked from):
    var probabilities = [];

    //...depends on ship elements and person elements (eg mood)
    //0. DoNothingTask: no prerequisits
    this.possibleTasks.push(0);
    probabilities.push(this.task_chances["DoNothing"]);
    //1. SleepingTask: no prerequisits
    this.possibleTasks.push(1);
    probabilities.push(this.task_chances["Sleeping"]);
    //2. ExerciseTask: can't be in poor health.
    if (!this.hasPoorHealth() && this.energy_level > EXHAUSTION_LEVEL){
      this.possibleTasks.push(2);
      probabilities.push(this.task_chances["Exercise"]);
    }
    //3. MeetingNewPeopleTask: ...
    if (this.knownPeopleInfo.length < this.ship.people.length - 1){
      this.possibleTasks.push(3);
      probabilities.push(this.task_chances["MeetingNewPeople"]);
    }
    //4. TalkingTask: ...
    if (this.knownPeopleInfo.length > 0){
      this.possibleTasks.push(4);
      probabilities.push(this.task_chances["Talking"]);
    }
    //5. NavigatorTask: ...
    if (this.title == "Navigator"){
      this.possibleTasks.push(5);
      probabilities.push(this.task_chances["Navigator"]);
    }
    //6. EngineerTask: ...
    if (this.title == "Engineer"){
      this.possibleTasks.push(6);
      var repairPercent = this.ship.getOverallRepairLevel();
      this.task_chances["Engineer"] = (1/repairPercent)|0;
      probabilities.push(this.task_chances["Engineer"]);
    }
    //7. SpecialistTask: ...
    if (this.title == "Specialist"){
      this.possibleTasks.push(7);
      probabilities.push(this.task_chances["Specialist"]);
    }
    //8. PaintingTask: ...
    if (this.passions["painting"] == true){
      this.possibleTasks.push(8);
      probabilities.push(this.task_chances["Painting"]);
    }
    //9. WanderTask: no prerequisits
    this.possibleTasks.push(9);
    probabilities.push(this.task_chances["Wander"]);
    //10. CookingTask: ...
    if (this.passions["cooking"] == true){
      this.possibleTasks.push(10);
      probabilities.push(this.task_chances["Cooking"]);
    }
    //11. EnemyShipTask: ...
    if (this.ship.enemyShipEvent){
      this.possibleTasks.push(11);
      probabilities.push(this.task_chances["EnemyShip"]);
    }
    //12. PoorHealthTask
    if (this.health < 50 || this.hasPoorHealth()){
      this.possibleTasks.push(12);
      probabilities.push(this.task_chances["PoorHealth"]);
    }
    //13. DeathTask
    if (this.isDead){
      console.log(this.name + " is dead.");
      this.possibleTasks.push(13);
      probabilities.push(this.task_chances["Death"]);
      this.pleaseRemove = true; //even if not chosen, MUST set this.
    }
    //14. WonderingTask
    this.possibleTasks.push(14);
    probabilities.push(this.task_chances["Wondering"]);
    //15. GameTask
    if (this.knownPeopleInfo.length > 0){
      this.possibleTasks.push(15);
      probabilities.push(this.task_chances["Game"]);
    }
    //16. ArgumentTask
    if (this.knownPeopleInfo.length > 0){
      this.possibleTasks.push(16);
      probabilities.push(this.task_chances["Argument"]);
    }

    //------------------//
    // PICK A TASK //
    //var chosenTaskID = this.possibleTasks[Math.floor(Math.random() * this.possibleTasks.length)];
    var chosenTaskID = this.possibleTasks[lottery(probabilities)];
    var newTask = null;

    //=====[ DEBUG: disallow/allow certain tasks ]================//
    if (SINGLE_ACTIONS_ONLY && (chosenTaskID == 3 || chosenTaskID == 4)){
      //ignore pair-actions if SINGLE_ACTIONS_ONLY is activated (change to DoNothingTask)
      console.log("DEBUGGING NOTE: no pair-tasks are being chosen.");
      chosenTaskID = 0;
    }
    if (JOB_ACTIONS_ONLY && (chosenTaskID < 5 || chosenTaskID > 7)){
      console.log("DEBUGGING NOTE: job actions only are being chosen.");
      if (this.title == "Navigator"){
        chosenTaskID = 5;
      } else if (this.title == "Engineer"){
        chosenTaskID = 6;
      } else if (this.title == "Specialist"){
        chosenTaskID = 7;
      } else {
        chosenTaskID = 0;
      }
    }
    //===========================================================//
    var smallTask = ""; //something that doesn't require a full task.

    if (chosenTaskID == 0) {
      newTask = new DoNothingTask(this);
    } else if (chosenTaskID == 1) {
      newTask = new SleepingTask(this);
    } else if (chosenTaskID == 2) {
      newTask = new ExerciseTask(this);
    } else if (chosenTaskID == 3) {
      new MeetingNewPeopleTask(this, true); // Purposely NOT set to newTask!!
    } else if (chosenTaskID == 4) {
      var r = random(this.knownPeopleInfo.length);
      var conversation_partner = this.ship.findPersonInShipByID(this.knownPeopleInfo[r][0]);
      if (!conversation_partner) {
        //if this happens to happen, remove that ID from knownPeopleInfo
        this.knownPeopleInfo.splice(r, 1);
      } else {
        //talking to someone alive!
        new TalkingTask(this, conversation_partner, true); // This adds the task...
          //... to each of the people's waitingFor task queues.
          // Purposely NOT set to newTask!!
      }
    } else if (chosenTaskID == 5){
      newTask = new NavigatorTask(this);
    } else if (chosenTaskID == 6){
      newTask = new EngineerTask(this);
    } else if (chosenTaskID == 7){
      newTask = new SpecialistTask(this);
    } else if (chosenTaskID == 8){
      newTask = new PaintingTask(this);
    } else if (chosenTaskID == 9){
      newTask = new WanderTask(this);
    } else if (chosenTaskID == 10){
      newTask = new CookingTask(this);
    } else if (chosenTaskID == 11){
      newTask = new EnemyShipTask(this);
    } else if (chosenTaskID == 12){
      newTask = new PoorHealthTask(this);
    } else if (chosenTaskID == 13){
      newTask = new DeathTask(this);
    } else if (chosenTaskID == 14){
      newTask = new WonderingTask(this);
    } else if (chosenTaskID == 15){
      var r = random(this.knownPeopleInfo.length);
      var conversation_partner = this.ship.findPersonInShipByID(this.knownPeopleInfo[r][0]);
      if (!conversation_partner) {
        //if this happens to happen, remove that ID from knownPeopleInfo (they be dead)
        this.knownPeopleInfo.splice(r, 1);
      } else {
        //playing a game with someone alive!
        new GameTask(this, conversation_partner, true);
      }
    } else if (chosenTaskID == 16){
      var r = random(this.knownPeopleInfo.length); //TODO: should be more likely to be someone you already dislike.
      var conversation_partner = this.ship.findPersonInShipByID(this.knownPeopleInfo[r][0]);
      if (!conversation_partner) {
        //if this happens to happen, remove that ID from knownPeopleInfo (they be dead)
        this.knownPeopleInfo.splice(r, 1);
      } else {
        //have an argument.
        new ArgumentTask(this, conversation_partner, true);
      }
    } else {
      console.log("Error: no tasks chosen.");
    }
    //-----[ LOG ]-----//
    if (newTask != null && newTask.initialDescription != ""){
      if (smallTask == ""){
        var iName = this.getName();
        this.log.push([this.ship.tick, iName + newTask.initialDescription]);
      } else {
        var iName = this.getName();
        this.log.push([this.ship.tick, iName + newTask.initialDescription]);
      }
    }
    this.task = newTask;
  }


  //===========================//
  //once per day.
  updateSelf(whatIteration) {
    //every day, update bits and bobs of one's self.
    //1. hungriness.
    if (this.ship.provisions <= 0){
      this.isStarving = true;
      this.adjustHealth(-HEALTH_LOST_FROM_STARVATION);
      this.adjustEnergy(-ENERGY_LOST_FROM_STARVATION);
    } else {
      this.isStarving = false;
    }
    //============================//
    //if not dead... maybe die.
    if (this.health <= 0 && !(this.isDead)){
      //uh oh.
      var r = random(3);
      if (r == 0){
        this.health = 1;
        this.deathIsClose = true;
      } else if (r == 1){
        this.health = 0;
        this.deathIsClose = true;
      } else {
        //====[ DEAD ]====//
        this.isDead = true;
        this.health = 0;
        //---> update ship history.
        var hist = "===[REPORT, DAY " + whatIteration + "]===<br>Sadly, " + this.getName() + " has died of " + this.getCauseOfDeath() + ". " + capitalize(this.getPronoun(false)) + " was given a space-burial. " + capitalize(this.getPronoun(false)) + " will be missed.<br>";
        this.ship.shipHistory.push(hist);
      }
    } else {
      this.deathIsClose = false;
    }

  }

  //--------------------//

  getCauseOfDeath(){
    //make a list of causes.
    var causes = [];
    if (this.isStarving){
      causes.push("starvation");
    }
    //temp
    causes.push("other causes");

    if (causes.length <= 0){
      return "natural causes";
    } else {
      var str = "";
      for (var i = 0; i < causes.length; i++){
        if (causes.length > 1 && i == causes.length-1){
          str += " and "
        } else if (i != 0){
          str += ", "
        }
        str += causes[i];
      }
      return str;
    }
  }

  //===========================//

  adjustKinship(knownPersonID, adj){
    if (this.knownPeopleInfo.length <= 0){
      return "";
    }
    if (adj == 0){
      return "";
    }
    for (var i = 0; i < this.knownPeopleInfo.length; i++){
      if (knownPersonID == this.knownPeopleInfo[i][0]){
        this.knownPeopleInfo[i][1] += adj;
        if (this.knownPeopleInfo[i][1] < 0){
          this.knownPeopleInfo[i][1] = 0;
        }
        if (this.knownPeopleInfo[i][1] >= KINSHIP_NAMES.length){
          this.knownPeopleInfo[i][1] = KINSHIP_NAMES.length - 1;
        }
        return KINSHIP_NAMES[this.knownPeopleInfo[i][1]];
      }
    }
    //shouldn't reach here.
    console.log("Error: could not adjust kinship level.");
    return "";

  }


}
