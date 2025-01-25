export function displayDialogue(text, onDisplayEnd) {
    const dialogueUI = document.getElementById("textbox-container");             //set textbox UI based on html tag
    const dialogue = document.getElementById("dialogue");                       //set from tag set in index.html
  
    dialogueUI.style.display = "block";    //changing styledisplay tag in html prev set to none/block is appear.


  // text scrolling logic found by original inspiration
    let index = 0;
    let currentText = "";
    const intervalRef = setInterval(() => {
      if (index < text.length) {
        currentText += text[index];
        dialogue.innerHTML = currentText;         //would allow cross-site scripting if accecpting user input with innerhtml/innertxt wouldnt allow for hyperlink property 
        index++;
        return;
      }
  
      clearInterval(intervalRef);
    }, 1);
    

    //logic for "close button" with getelementby ID 
    const closeBtn = document.getElementById("close");
  
    function onCloseBtnClick() {  //calls onDisplayEDnd to return control/ manipulation of player object via coupling 
      onDisplayEnd();
      dialogueUI.style.display = "none";
      dialogue.innerHTML = "";
      clearInterval(intervalRef);
      closeBtn.removeEventListener("click", onCloseBtnClick);   //recursive call to return and exit with eventlistener
    }
  
    closeBtn.addEventListener("click", onCloseBtnClick);
  
    addEventListener("keypress", (key) => {
      if (key.code === "Enter") {
        closeBtn.click();
      }
    });
  }
  
  export function setCamScale(k) {                         //Compute scaling factor for camera based on ratio of width to height
    const resizeFactor = k.width() / k.height();
    if (resizeFactor < 1) {
      k.camScale(k.vec2(1));
    } else {
      k.camScale(k.vec2(1.5));
    }
  }