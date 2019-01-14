//------[ P A R A M E T E R S ]------//
//0. debug (parameters for testing)
//1. technically adjustable paramters
//2. adjustable parameters
//3. constants
//-----------------------------------//
//----------> 0.debug <-----------//
var SHOW_DEBUG_HTML = true;
var PASSIONS_ALLOWED = true; //(default = true) (false means nobody is assigned passions from the start)
var SINGLE_ACTIONS_ONLY = false; //(default = false) (true turns off paired tasks)
var JOB_ACTIONS_ONLY = false; //(default = false) (true allows only job-related tasks)

//--> 1.'technically' adjustable parameters <---//
//--> Adjusting these paramters means adjusting a load of other things... so adjust sparingly
//---galaxy---//
var NUM_PLANETS = 4;
var NUM_SPACE_STATIONS = 3;
var NUM_PEOPLE_IN_STATION = 4;
//---time---//
var TICK_BUNDLE = 24; //1 tick kinda equals an hour
var HOUR_CLOCK = 24;
//---cargo---//
var MAX_CARGO = 3;

//---> 2. (easily) adjustable parameters <--//
//--> These parameters should be fine to adjust however you like, within reason
//--galaxy--//
//--people (includes from main)----//
var NUMBER_OF_INIT_PEOPLE = 5;
var STARTER_FITNESS_VALUE_MAX = 10; // therefore fitness will be a random value between 0 and ...MAX - 1
//--ship----//
var CHANCE_FOR_DAMAGE_BY_SPACE_DEBRIS = 10; //1 in chance_for_major_damage
var CHANCE_FOR_ENEMY_SHIP = 12;
var STARTING_MONEY = 100; // x units to start with.
//--tasks--//
var PAINTING_LASTSFOR_MAX = 600; //'days'
var PAINTING_LASTSFOR_MIN = 10; //'days'


//--------> 3.constants <--------//
//---[ MAIN ]---//

//-- 3 THINGS TO BALANCE: Navigation, Engineering, and Specialist Fields ('Special')
//-- TITLES: Navigator, Engineer, and Specialist (and none)
var TITLES = ["Navigator","Engineer","Specialist",""];
//available specialities (within the Specialist title - probably shouldn't add anymore btw)
var AVAILABLE_SPECIALTIES = ["Weapons Specialist","Linguist","Botanist","Storyteller","Medic"];

//================================//
