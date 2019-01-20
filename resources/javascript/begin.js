//==== BEGINNING OF A GAME, BEFORE THE GAME ====//

class Begin{
  constructor(){
    var div = document.querySelector('#beginGameDiv');
    div.style.display = "block";

    var upperTitle = document.querySelector("#upperTitle");
    upperTitle.innerHTML = "[ GAME ]";

    this.c1 = document.getElementsByClassName("shipcolumn")[0];
    this.c2 = document.getElementsByClassName("centercolumn")[0];
    this.c3 = document.getElementsByClassName("logcolumn")[0];

    this.c1.style.display = "none";
    this.c2.style.display = "none";
    this.c3.style.display = "none";

    this.msg = document.querySelector("#beginText");

    //-----[ FIRST ]-----//
    this.txt0 = "Blinking red lights and a tinny voice wake you from your sleep.";
    this.txt0 += "<br><i>'You have reached your destination... You have reached your destination...'</i>";
    this.btn0 = "HUH?";
    //-----[ 2ND ]-----//
    this.txt1 = "You blink and sit up. <br>"
    this.txt1 += "<br><i>Where... am I?</i>";
    this.txt1 += "<br>You look around, seeing that you sit in the bridge of a spaceship.";
    this.txt1 += "<br><i>Your</i> spaceship, you suddenly recall.";
    this.txt1 += "<br>What was its name, again?";
    this.btn1 = "CONTINUE";
    //-----[ 3RD ]-----//
    this.txt2 = "You are the captain of this ship. This... very empty ship."
    this.txt2 += "<br>You remember now why you came here, to this galaxy.";
    this.btn2 = "CONTINUE";
    //-----[ 4TH ]-----//
    this.txt3 = "You came to save it.";
    this.btn3 = "BEGIN";
    //====================//

    this.shipNameInput = document.querySelector("#shipNameInput");
    this.shipNameInput.maxLength = 20;
    this.shipNameInput.style.display = "none";

    this.msg.innerHTML = this.txt0;
    beginButton.innerHTML = this.btn0;

    this.counter = 1; //end is 3
    this.stupidCounter = 0;

    this.ship_name;
  }

  done(){
    if (this.counter == 1){
      //-prompt for ship name-//
      this.msg.innerHTML = this.txt1;
      beginButton.innerHTML = this.btn1;
      this.shipNameInput.style.display = "block";
      this.counter++;
      return false;
    } else if (this.counter == 2){
      if (this.shipNameInput.value != ""){
        this.shipNameInput.style.display = "none";
        this.ship_name = this.shipNameInput.value;
        var earlyTxt2 = "<i>That's right!</i> The " + this.shipNameInput.value + ".<br>";
        this.txt2 = earlyTxt2 + this.txt2;
        this.msg.innerHTML = this.txt2;
        beginButton.innerHTML = this.btn2;
        this.counter++;
      } else {
        //didn't write anything.
        this.msg.innerHTML += "<br>You feel compelled to type out the name in the text box below.";
        this.counter = 2;
        this.stupidCounter++;
        if (this.stupidCounter == 10){
          this.msg.innerHTML = "Just... please write <i>something</i> in the text box.";
        }
      }
      return false;
    } else if (this.counter == 3){
      this.msg.innerHTML = this.txt3;
      beginButton.innerHTML = this.btn3;
      this.counter++;
    } else {
      //----DONE INTRO----//
      this.finishUp();
      return true;
    }

  }

  finishUp(){
    var div = document.querySelector('#beginGameDiv');
    div.style.display = "none";
    this.c1.style.display = "block";
    this.c2.style.display = "block";
    this.c3.style.display = "block";
  }

}
