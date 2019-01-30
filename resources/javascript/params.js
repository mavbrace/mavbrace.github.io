//------[ P A R A M E T E R S ]------//
//0. debug (parameters for testing)
//1. technically adjustable paramters
//2. adjustable parameters
//3. constants
//-----------------------------------//
//----------> 0.debug <-----------//
var SKIP_INTRO = false; //for GAME: false
var NO_DELAY = false; //for GAME: false;
var SHOW_DEBUG_HTML = false; //for GAME: false;
//....
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
var DELAY = 400;
var NUMBER_OF_INIT_PEOPLE = 0; //FOR GAME: 0
var MAX_CREW = 12; //max people in your ship.
var STARTER_FITNESS_VALUE_MAX = 10; // therefore fitness will be a random value between 0 and ...MAX - 1
//==== ship ====//
var CHANCE_FOR_DAMAGE_BY_SPACE_DEBRIS = 5; //1 in chance_for_major_damage, default: 10
var CHANCE_FOR_ENEMY_SHIP = 10; // default: 12
var PROVISIONS_PPPD = 1; // provisions Per-Person-Per-Day
var STARTING_FUEL_ECONOMY = 2; //x percent per day.
var WAGES_PPPD = 1; //funds allotted Per-Person-Per-Day
var STARTING_MONEY = 2000; // x units to start with.
//-> first mate manages these 3 things:
var STARTING_PROVISIONS = 100; // 100...provisions to start with.
var STARTING_FUEL = 100; //100 percent fueled
//~~~~
var FUEL_BASE_PRICE = 3; //units per percentage.
var PROVISIONS_BASE_PRICE = 2; //units per provision.
//~~~~
var CHANCE_FOR_INJURY_BY_ENEMY_SHIP = 2; //1 in chance for...
var CHANCE_FOR_INJURY_BY_SPACE_DEBRIS = 3; //1 in chance for...
//--tasks--//
var PAINTING_LASTSFOR_MAX = 600; //'days'
var PAINTING_LASTSFOR_MIN = 10; //'days'
//-------//
var HEALTH_LOST_FROM_STARVATION = 5; //per day
var ENERGY_LOST_FROM_STARVATION = 5; //per day
var EXHAUSTION_LEVEL = 20; //energy_level that signifies exhaustion


//--------> 3.constants <--------//
//---[ MAIN ]---//

//-- 3 THINGS TO BALANCE: Navigation, Engineering, and Specialist Fields ('Special')
//-- TITLES: Navigator, Engineer, and Specialist (and none)
var TITLES = ["Navigator","Engineer","Specialist",""];
//available specialities (within the Specialist title - probably shouldn't add anymore btw)
var AVAILABLE_SPECIALTIES = ["Weapons Specialist","Linguist","Botanist","Storyteller","Medic"];
//-injuries-//
var INJURY_CAUSES = ["fire", "explosion", "fall", "projectile", "animal"];
//================================//
