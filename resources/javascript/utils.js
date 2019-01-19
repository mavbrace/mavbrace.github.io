//------[ UTILITIES ]------//


//---[ MAIN ]---//

// pass in an int to indicate name origin (a planet)
//female = 0, male = 1
//probably should move this function elsewhere
function nameMaker(originOfName, gender){
  var typesOfNamesAvailable = 5;
  var type = originOfName % typesOfNamesAvailable; //there are only so many types I can make

  //----- 5 types atm -----//
  var options = [[],[],[],[]];
  var pattern = [0,1,2];
  if (type == 0){
    options[0] = ["G","S","War","Wr","Ph","Th","Car","Am","A"];
    options[1] = ["if","am","er","ar","od","um","y","iv","an"];
    options[2] = ["","na","iv","e","ix","mon","tal","imon","it","sid"];
    pattern = [0,1,2]
  } else if (type == 1) {
    options[0] = ["Fl","Mn","St","Sh","E","P","En","Esht","Esh","Ish","T"];
    options[1] = ["ou","o","e","o","u"];
    options[2] = ["m","ll","l","ss","nd","r","dd"];
    options[3] = ["ian","ia","ius"];
    var r = random(2);
    if (r == 0){
      pattern = [0,1,2];
    } else {
      pattern = [0,1,2,3];
    }
  } else if (type == 2) {
    options[0] = ["Wolf","Rain","Hawk","Wren","Ash","Vale",
          "Reed","Bay","Leaf","Sky","Sage","Star",
          "Mirror","Ghost","Cat","Bean","Moon","Sparrow","Spark","Valley","Mist"];
    options[1] = ["Running ","Leaping ","Singing ","Pale ","Bright ","Gentle ","Green ",
                  "Silver ","Lucky ","White ","Black ","Blue "];
    options[2] = ["Val","Clay","Skip","Lucky","Red","Blue","Gray","Silver","Teal","Umber","Indigo"];
    var r = random(3);
    if (r == 0){
      pattern = [0];
    } else if (r == 1){
      pattern = [1,0];
    } else {
      pattern = [2];
    }
  } else if (type == 3) {
    options[0] = ["Minna","Suzy","Sam","Marla","Nora","Sonya","Rosy","Song",
            "Autumn","Dawn","Willow","Glenda","Agatha","Jenny","Laura","Megan",
            "Leah","June","Alissa","Gwen"]; //female
    options[1] = ["Sam","Benedict","Frank","Damon","Jesse","Oliver","Forrest",
            "Leo","Dusty","Jamie","Tobias","Ed","Dan","Danny","Scott","Jack",
            "Zack","Fred","Thomas","Glen"]; //male
    if (gender == FEMALE){
      pattern = [0];
    } else {
      pattern = [1];
    }
  } else {
    options[0] = ["T","J","Sh","Z","H","Ch","Ach"];
    options[1] = ["a","o","i","ai","ii","e"];
    options[2] = ["sh","n","d","f","nr"];
    options[3] = ["O","A","I"];
    var r = random(2);
    if (r == 0){
      pattern = [0,1,2,1];
    } else {
      pattern = [3,2,1,2,1];
    }

  }
  //----//
  var name = "";
  for (var i = 0; i < pattern.length; i++){
    var currentOptions = options[pattern[i]];
    name = name +  currentOptions[random(currentOptions.length)];
  }
  //-----------------------//
  return name;
}

//modulo so it works over negatives as well...
Number.prototype.mod = function(n) {
  return ((this % n) + n) % n;
}

//normal random: return random from 0 -> n-1 (TODO: replace all with this)
function random(n){
  return Math.floor(Math.random() * n);
}

//the chance is 'n out of total' (n normally will be 1) (also, total > n)
//returns true if n
function chance(n, total){
  var r = Math.floor(Math.random() * total);
  if (r < n){
    return true;
  } else {
    return false;
  }
}

//-> input array of 'tickets' -> each element of the tickets array is a certain number of tickets 'purchased'
//-> outputs the index of the winner
function lottery(tickets){
  if (tickets.length <= 0){
    console.log("Something went wrong with the lottery: no tickets.")
    return 0;
  }
  var total = 0;  // probability of 'tickets[i] out of total'  (eg. probability of 2 out of 10)
  for (var i = 0; i < tickets.length; i++){
    total = total + tickets[i];
  }
  var r = Math.floor(Math.random() * total); //the great and powerful 'r'
  var lower_limit = 0;
  var upper_limit = lower_limit + tickets[0];
  for (var i = 0; i < tickets.length; i++){
    if (r >= lower_limit && r < upper_limit){
      //console.log(i + " won, probability: " + tickets[i] + " out of " + total + ".");
      return i;
    }
    lower_limit = upper_limit;
    upper_limit = upper_limit + tickets[i+1];
  }
  console.log("Something went wrong with the lottery.")
  return 0; //something went wrong for this to happen
}

//---[ TASKS ]---//
//-> get a random key (pass in a dictionary, returns the single chosen key)
function randomKey(dict) {
  return Object.keys(dict)[Math.floor(Math.random() * Object.keys(dict).length)];
}
//-> capitalize a string (pass in a string, returns a capitalized string)
function capitalize(string){
  return string.charAt(0).toUpperCase() + string.substr(1);
}

//---[ calculate distance from 2 points ]---//
//---> pt1 and pt2 are arrays like so: [x,y]
function getDistance(pt1, pt2){
  var a = ((pt2[0] - pt1[0])*(pt2[0] - pt1[0])) +
          ((pt2[1] - pt1[1])*(pt2[1] - pt1[1]))
  return Math.sqrt(a);
}

//---[ calculate new point given two points and a velocity ]---//
function nextPoint(pt_current, pt2, v){
  //velocity = distance traveled per day
  //1. find vector
  vx = (pt2[0] - pt_current[0]) / getDistance(pt_current, pt2); //end part = normalization
  vy = (pt2[1] - pt_current[1]) / getDistance(pt_current, pt2);
  //note: the |0 makes it an integer (interestingly)
  return [(pt_current[0] + (vx * v))|0, (pt_current[1] + (vy * v))|0];
}
