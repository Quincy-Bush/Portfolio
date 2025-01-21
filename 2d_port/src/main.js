import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png", {     //sprite animations loaded from spritresheet
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 944,
    "walk-down": { from: 944, to: 947, loop: true, speed: 8 },
    "idle-side": 983,
    "walk-side": { from: 983, to: 986, loop: true, speed: 8 },
    "idle-up": 1022,
    "walk-up": { from: 1022, to: 1025, loop: true, speed: 8 },
  },
});

k.loadSprite("mapp", "./mapp.png");

k.setBackground(k.Color.fromHex("#c54b8c"));

k.scene("main", async () => {     //need main to be async for json data to be grabbed with fetch
  const mapData = await (await fetch("./mapp.json")).json();  //using await to keep following commands from executing while fetch operates, 
  const layers = mapData.layers;
//kaboom game objects containing components as arrays with which you can specify behaviors 
//game object generating map and properties
  const map = k.add([k.sprite("mapp"), k.pos(0), k.scale(scaleFactor)]);  //adding array of components directly

  //game object generating player and properties
  const player = k.add([  //must be called later with k.add if using k.make
    k.sprite("spritesheet", { anim: "idle-down" }),// loading with default animation
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),                //creating 2d vector area containting hitbox   passed into obj with shape properties that can be manipulated
    }),//             from origin(0) +3(3) along x axis 
    k.body(),                          //makes  player object tangible with phys interactions
    k.anchor("center"),                //manipulates "anchor" to xy coordinates of objects you want to draw. drawn from center
    k.pos(448,64),                          //pos for position           specified later from data of spawnpoint on map generated by title
    k.scale(scaleFactor),
    {                                //holding properties of game objects in array of comp, accessable by k.speed.
      speed: 100, 
      direction: "down", 
      isInDialogue: false,         //false to not prevent movements 
    },
    "player",                     //player tag for collision check
  ]);
//logic to display boudndaries

  for (const layer of layers) {                  //for each obj in array of layers,check name property for the desired 
    if (layer.name === "Bounds") {
        for (const boundary of layer.objects) {
          map.add([
              k.area({
              shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),                // specify shape based on properties set on json file as for loop progresses to define area of object
            }),
            k.body({ isStatic: true }),                                                 //prevents overlap
            k.pos(boundary.x, boundary.y),                                              //defines position
            boundary.name,                                                               //tag of game object
          ]);
          //writing logic for collisions to allow for interaction with objects  redundant for boundaries 
         /* if (boundary.name) {                                         
            player.onCollide(boundary.name, () => {
              player.isInDialogue = true;                                         //prevents movement during text box 
              displayDialogue(                                                    //import function displaying written text in constanst correlating to game objects.
                dialogueData[boundary.name],                                      //imported data for dialoge
                () => (player.isInDialogue = false)                             //allow player movement
              );
            });
          }*/                     //Note: logic not implement due to boundaries not needing to display content(dialoge) in this program
        }
  
        continue;                                                
      }


    if (layer.name === "objs") {                      
      for (const boundary of layer.objects) {
        map.add([
            k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
            displayDialogue(
              dialogueData[boundary.name],
              () => (player.isInDialogue = false)
            );
          });
        }
      }

      continue;
    }



    if (layer.name === "spwn") {         
      for (const entity of layer.objects) {               //for each entity in spawnpoint layer array of object
        if (entity.name === "player") {
          player.pos = k.vec2(                             //manually set player position basted on attributes
            (map.pos.x + entity.x) * scaleFactor,           //x position of map plus spwn x coordinate with the scale to delive location on x axis
            (map.pos.y + entity.y) * scaleFactor
          );
         // k.add(player);
          continue;
        }
      }
    }
  }
    //calling function at start and resizing of canvas
  setCamScale(k);

  k.onResize(() => {
    setCamScale(k);
  });
  //have camera update consistent within update 
  k.onUpdate(() => {
    k.camPos(player.pos.x , player.pos.y );

   // k.camPos(player.worldPos().x, player.worldPos().y - 100);
  });       //world position to convert postion on the cancas

  k.onMouseDown((mouseBtn) => {        //event in kaboom that allows for button pressed to be read  tap on mobile
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);            //allow movement for player to target == mouse position based on speed set using kaboom library

    const mouseAngle = player.pos.angle(worldMousePos);

    const lowerBound = 50;
    const upperBound = 125;

    //logic for "rotating "(display sprite) character based on direction developed mostly from code snippets and original inspiration accredited in README

    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      return;
    }
  });
//logic to display "idle animation" when without input
  function stopAnims() {
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }
    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }

    player.play("idle-side");
  }

  k.onMouseRelease(stopAnims);

  k.onKeyRelease(() => {
    stopAnims();
  });


// another kaboom object,an array of components containing a key map for late coorespondence  
  k.onKeyDown((key) => {
    const keyMap = [
        k.isKeyDown("right"),
        k.isKeyDown("left"),
        k.isKeyDown("up"),
        k.isKeyDown("down"),
        k.isKeyDown("d"),
        k.isKeyDown("a"),
        k.isKeyDown("w"),
        k.isKeyDown("s"),
    ];

    let nbOfKeyPressed = 0;
    for (const key of keyMap) {
      if (key) {
        nbOfKeyPressed++;
      }
    }

    if (nbOfKeyPressed > 1) return;
//logic defining simple movement and animation of character based on keys recieved and coorelating to the keymap object array.
    if (player.isInDialogue) return;
    if (keyMap[0]||keyMap[4]) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      player.move(player.speed, 0);
      return;
    }

    if (keyMap[1]||keyMap[5]) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      player.move(-player.speed, 0);
      return;
    }

    if (keyMap[2]||keyMap[6]) {
      if (player.curAnim() !== "walk-up") player.play("walk-up");
      player.direction = "up";
      player.move(0, -player.speed);
      return;
    }

    if (keyMap[3]||keyMap[7]) {
      if (player.curAnim() !== "walk-down") player.play("walk-down");
      player.direction = "down";
      player.move(0, player.speed);
    }
  });
});

k.go("main");
