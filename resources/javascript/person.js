var FEMALE = 0;
var MALE = 1;

var MOODS = ["terrible","bad","neutral","so-so","good","wonderful"];

var NOT_MOTIVATED = 0;
var MOTIVATED = 1;
var EXTREMELY_MOTIVATED = 2;



//-- PERSON --//
class Person{

  constructor(galaxy, ship, id, name, gender, fitness, title, specialty, originPlanet){
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
    //this.competance = 0;
    //------------------------------//
    this.title = title;
    this.specialty = specialty; // only need to fill in if person is a specialist ("" if none)
    this.knownPeopleInfo = []; // [ID of person you know, level of like, type of relationship]
    this.log = [];
    //----task things----//
    this.task = null; //One main task
    this.possibleTasks = []; //A list of tasks for the person to choose from, when they choose a new task
    this.waitingFor = []; // List of tasks in queue
    //-> probabilites for each and every task:  //FOR NOW: all probabilites added == 1 (ie equal probability)
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
                          "EnemyShip":100 };
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
    var group = 'A';
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
      //----//
      } else if (feature == 'Masc' && (keyParts[i] in masc_images)){
          var r = random(masc_images[keyParts[i]].length);
          this.visualFeatures[keyParts[i]] = masc_images[keyParts[i]][r];
      } else if (feature == 'Fem' && (keyParts[i] in fem_images)){
          var r = random(fem_images[keyParts[i]].length);
          this.visualFeatures[keyParts[i]] = fem_images[keyParts[i]][r];
      } else if (keyParts[i] in either_images){
          var r = random(either_images[keyParts[i]].length);
          this.visualFeatures[keyParts[i]] = either_images[keyParts[i]][r];
      } else {
        console.log("Error adding visual feature.");
      }
    }
  }

  //---[ GETS ]---//

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
    var desc = this.title + " " + this.name + ", from " + this.originPlanet.name;
    desc += "<br>-" + this.specialty;

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

    desc += "<br>-fitness level: " + this.fitness;
    desc += "<br>-motivation level: " + this.motivation_level;
    desc += "<br>-energy level: " + this.energy_level;
    desc += "<br>-mood: " + MOODS[this.moodIndex];

    return desc;
  }

  //================//

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

  //========[ TASKS ]========// //---> Runs every tick
  //=======//
  //-> waitingFor
  waitingForTasks(){
    // Waiting for is just for pairs
    // Assuming this.waitingFor has otherPerson thing (for now)
    // Checks if both people are doing nothing, then checks if the tasks
    // they are waiting for are the same.
    if (this.waitingFor.length > 0 &&
      this.task == null && this.waitingFor[0].otherPerson.task == null &&
      this.waitingFor[0].pairActivity === this.waitingFor[0].otherPerson.waitingFor[0].pairActivity) {
      // Sets both people's tasks to their next waiting for tasks.
      this.task = this.waitingFor[0];
      this.waitingFor[0].otherPerson.task = this.waitingFor[0].otherPerson.waitingFor[0];
      // Remove from waiting for array for both people:
      this.waitingFor[0].otherPerson.waitingFor.splice(0, 1);
      this.waitingFor.splice(0, 1);
    }
  }


  manageTasks(){
      //1. choose a new task if needed
      if (this.task == null && this.waitingFor.length == 0){
        //console.log("Choosing new task...");
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
    //2. ExerciseTask: no prerequisits
    this.possibleTasks.push(2);
    probabilities.push(this.task_chances["Exercise"]);
    //3. MeetingNewPeopleTask: ...
    if (this.knownPeopleInfo.length < this.ship.people.length - 1){
      this.possibleTasks.push(3);
      probabilities.push(this.task_chances["MeetingNewPeople"]);
    }
    //4. TalkingTask: ...
    if (this.knownPeopleInfo.length != 0){
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

    //------------------//
    // PICK A TASK // -->Random task (for now)
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
      if (conversation_partner != null){
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
    } else {
      //TODO.....handle this?
      console.log("Error: no tasks chosen.");
    }
    //-----[ LOG ]-----//
    if (newTask != null && newTask.initialDescription != ""){
      var iName = "<i>" + this.name + "</i>"
      this.log.push([this.ship.tick, iName + newTask.initialDescription]);
    }
    this.task = newTask;
  }


  //===========================//
  //===========================//

}
