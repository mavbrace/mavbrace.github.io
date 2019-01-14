//-----[ VISUAL THINGS ]-----//

//debug
var debugText = document.querySelector('#debugText');

//main text elements
var logText_Element = document.querySelector('#log');
var shipHistoryText_Element = document.querySelector('#shipHistory');
var shipStatusText_Element = document.querySelector('#shipInfo');
var warningsText_Element = document.querySelector('#info3');
var journeyText_Element = document.querySelector('#infoJourney');
var rightColumnTitle_Element = document.querySelector('#rightColumnTitle');

//main button elements
var resetButton = document.querySelector('#resetButton');
var goButton = document.querySelector('#goButton');
var toggleButton = document.querySelector('#toggleButton');
var newDestButton = document.querySelector('#newDestButton');
//--User feedback for go, toggle and newDest buttons
var controlPanelNotifs_Element = document.querySelector('#controlPanelNotifs');
var oldControlPanelMessage = "";
function updateControlPanelNotifs(newMsg){
  //can show 2 messages at once: one new, one old'
  var msg = ">> <strong>" + newMsg + "</strong><br><small>" + oldControlPanelMessage + "</small>";
  oldControlPanelMessage = newMsg;
  controlPanelNotifs_Element.innerHTML = msg;

}

//-------------------------------------------------//
//-------------------------------------------------//
//--> CREW MEMBER 'SLIDESHOW' <--// -> note: slideshow function is in game
//....continuing..
var crewCanvas = document.querySelector('#crewMemberCanvas');
var crewContext = crewCanvas.getContext("2d"); //context
var crewMemberDesc = document.querySelector('#crewMemberDesc');
var moreCrewInfoBtn = document.querySelector('#moreCrewInfoButton');
var crtImage = new Image();
crtImage.src = "resources/images/CRTLines.png";
//==========//
//-loading all images-// ...tiringly, doing it one-by-one....
/*
GROUP_A, GROUP_B, GROUP_C:  <- origins are a unique mixture of groups (eg. A&B)
---> hairColour, skin, clothingColour
MASC, FEM, EITHER:
---> hairOutline, upperFace, lowerFace, faceOutline, clothingOutline
*/
var hairLengths = ["_short","_med","_long"];
//-------[ GROUP_A ]------//
//--> init
var groupA_images = { "hairColour": [[new Image(), new Image(), new Image()],
                                      [new Image(), new Image(), new Image()],
                                      [new Image(), new Image(), new Image()],
                                      [new Image(), new Image(), new Image()]],
                      "skin": [new Image(), new Image(), new Image(), new Image(), new Image()],
                      "clothingColour": [new Image(), new Image(), new Image()]  };
//--> add sources
for (var i = 0; i < 4; i++){
  for (var j = 0; j < 3; j++){
    groupA_images["hairColour"][i][j].src = "resources/images/hairColour" +
                              hairLengths[j] + "_0" + i + ".png";
  }
}
for (var i = 0; i < 5; i++){
  groupA_images["skin"][i].src = "resources/images/skin_0" + i + ".png";
}
groupA_images["clothingColour"][0].src = "resources/images/clothingColour_00.png";
groupA_images["clothingColour"][1].src = "resources/images/clothingColour_01.png";
groupA_images["clothingColour"][2].src = "resources/images/clothingColour_02.png";
//-------[ GROUP_B ]------// not done
//-------[ GROUP C ]------// not done

//--------[ MASC ]--------//
//--> init
var masc_images = { "upperFace": [new Image()],
                    "faceOutline": [new Image()]  };
//--> add sources
masc_images["upperFace"][0].src = "resources/images/upperFace_00.png";
masc_images["faceOutline"][0].src = "resources/images/faceOutline_01.png";

//---------[ FEM ]--------//
//--> init
var fem_images = { "upperFace": [new Image()],
                  "faceOutline": [new Image()] };
//--> add sources
fem_images["upperFace"][0].src = "resources/images/upperFace_01.png";
fem_images["faceOutline"][0].src = "resources/images/faceOutline_02.png";

//---[ EITHER / OTHER ]---//
//--> init
var either_images = { "hairOutline": [[new Image(), new Image(), new Image()]],
                      "lowerFace": [new Image(), new Image()],
                      "faceOutline": [new Image()],
                      "clothingOutline": [new Image()]  };
//--> add sources
for (var i = 0; i < 3; i++){
  either_images["hairOutline"][0][i].src = "resources/images/hairOutline" +
                          hairLengths[i] + "_00.png";
}
either_images["lowerFace"][0].src = "resources/images/lowerFace_00.png";
either_images["lowerFace"][1].src = "resources/images/lowerFace_01.png";
either_images["faceOutline"][0].src = "resources/images/faceOutline_00.png";
either_images["clothingOutline"][0].src = "resources/images/clothingOutline_00.png";
//=========//
//crewMemberImg....
var leftSlideshowButton = document.querySelector('#leftSlideshowButton');
var rightSlideshowButton = document.querySelector('#rightSlideshowButton');

//-------------------------------------------------//
//-------------------------------------------------//

//ship image...
var ship_img = new Image();
ship_img.src = "resources/images/ship.png";

//current location, seen as an 'x'
var locText_Element = document.querySelector('#currLocP');

//space station buttons (within modal, ie the galaxy map)
var station0 = document.querySelector('#station0');
var station1 = document.querySelector('#station1');
var station2 = document.querySelector('#station2');

//planets buttons (within modal, ie the galaxy map)
var planet0 = document.querySelector('#planet0');
var planet1 = document.querySelector('#planet1');
var planet2 = document.querySelector('#planet2');
var planet3 = document.querySelector('#planet3');

//evil button (within modal, ie the galaxy map)
var evilButton = document.querySelector('#evil');

//--[ MODAL STUFF ]--//
var modalText_Element = document.querySelector('#modalText');
var modalGoButton = document.querySelector('#modalGo');
var galaxyMap = document.querySelector('#galaxyMapDiv');
//continued....
var modal = document.getElementById("mainmodal");
var modalcontent = document.getElementById("modalcontent");
//this is the span that closes the modal
var span = document.getElementsByClassName("close")[0];

//--[TRADE ITEMS STUFF]--//
var tradeItemButton0 = document.querySelector('#tradeItem0');
var tradeItemButton1 = document.querySelector('#tradeItem1');
var tradeItemButton2 = document.querySelector('#tradeItem2');
var purchaseItemText = document.querySelector('#purchaseItemText');
var purchaseTradeItemButton = document.querySelector('#purchaseTradeItem');
var sellingText = document.querySelector('#sellingText');
var acceptSaleButton = document.querySelector('#acceptSaleButton');
var shipCargoMessage = document.querySelector('#shipCargoText');
var shipCargoCraftedName = document.querySelector('#shipCraftedCargoText');
var shipCargoSymbols = document.querySelector('#cargoText');
var cargoCombineButton = document.querySelector('#cargoCombineButton');
var swapAroundButton = document.querySelector('#swapAroundButton');

//--> hide or reveal SHIP INFO VIEW div
function toggleShipViewVisibility(){
  var shipViewDiv = document.getElementById("shipViewDiv");
  if (shipViewDiv.style.display == "none") {
    shipViewDiv.style.display = "block";
  } else {
    shipViewDiv.style.display = "none";
  }
}

//--> hide or reveal TRADE div
function toggleTradeDivVisibility(){
  var tradeItemsDiv = document.getElementById("tradeDiv");
  var sellingItemsDiv = document.getElementById("sellingDiv");
  if (tradeItemsDiv.style.display == "none") {
    tradeItemsDiv.style.display = "block";
    sellingItemsDiv.style.display = "block";
  } else {
    tradeItemsDiv.style.display = "none";
    sellingItemsDiv.style.display = "none";
  }
}

//--~[STRANGER THINGS]~--//
var strangerButton0 = document.querySelector('#strangerButton0');
var strangerButton1 = document.querySelector('#strangerButton1');
var strangerButton2 = document.querySelector('#strangerButton2');
var strangerButton3 = document.querySelector('#strangerButton3');
var strangerDesc_Element = document.querySelector('#strangerDescText');
var addPersonButton = document.querySelector('#addPersonButton');

//---> hide or reveal strangers
function toggleStrangersVisibility(){
  var strangersDiv = document.getElementById("strangers");
  if (strangersDiv.style.display == "none"){
    strangersDiv.style.display = "block";
  } else {
    strangersDiv.style.display = "none";
  }
}
