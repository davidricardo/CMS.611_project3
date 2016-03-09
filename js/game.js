//Game screen dimension variables
const SCREEN_WIDTH = 25*32;
const SCREEN_HEIGHT = 20*32;

var game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.AUTO, '', { preload: preload, create: create, update: update });

//Dimensions for spritesheet's individual sprite
const SPRITE_WIDTH = 128/4;
const SPRITE_HEIGHT = 192/4;
const TILE_DIMENSIONS =32;


const OVERLAP_RADIUS = SPRITE_HEIGHT/32+0.1;
//Movement speed and frame rate
const MOVEMENT_SPEED = 100;
const FRAME_RATE = 5;
//Event variables
var prologueEnded = false;
//Sprite variables
var player;

//List of NPCs
var npcs;
var npcGroup;

var currentFriend;
var killer;
var detective;

//Group of diary
var interactables;

//Control variables
var cursors;
var spacebar;
var enterbar;
var enableButtonInput = true;
const INPUT_DELAY = Phaser.Timer.SECOND*1/2;

// Story variables
var text;
var HUD;

//Mario test
var map;
var layer;

//Preloads graphics onto the game
function preload() {

    var spriteGraphics = [
        {name: "Protagonist_Not_Ghost", url: "Assets/Images/Sprite Sheets/Protagonist.png"},
        {name: "Protagonist_Ghost", url: "Assets/Images/Sprite Sheets/ProtagonistGhost.png"},
        {name: "Current_Friend", url: "Assets/Images/Sprite Sheets/CurrentFriend.png"},
        {name: "Detective", url: "Assets/Images/Sprite Sheets/Detective.png"},
        {name: "Killer", url: "Assets/Images/Sprite Sheets/Killer.png"}
    ]

    for(var i=0; i<spriteGraphics.length; i++){
        game.load.spritesheet(spriteGraphics[i].name,spriteGraphics[i].url,SPRITE_WIDTH,SPRITE_HEIGHT);
    }

    game.load.tilemap('map', 'Assets/Tilesheets/map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'Assets/Images/Tilemap/town_indoor.png');
    game.load.image("diary", "Assets/Images/Objects/Diary.png");

}
//Initial function run after preload
function create() {

    initializeMap();
    initializesSprites();
    initializeControls();
    initializeEvidence();
    var style = {
        font: "16px Arial",
        fill: "#ffff00",
        //wordWrap: true,
        //wordWrapWidth: sprite.width,
        align: "center",
    };

    text = game.add.text(0, 0, "Hold down the return key to make the object float.", style);
    text.anchor.set(0.5);
    text.visible = false;

    // Create a GUI element that can be written to
    // Reference: https://videlais.com/2015/09/04/phaserfriday-phaser-basics-making-a-platformer/
    HUD = game.add.text(
        10, // The x position
        5, // The y position
        "Friend Belief Stat: " + currentFriend.belief +
        "\nDetective Belief Stat: " + detective.belief +
        "\nKiller Belief Stat: " + killer.belief, // The text content
        {
            font: "14px Arial", // Style, font
            fill: "#FF0",             // Style, fill color
        }
    );
}


//Initializes map
function initializeMap(){
    map = game.add.tilemap('map');

    map.addTilesetImage('Test Map', 'tiles');

    layer = map.createLayer('Dorm Layer 1');

    layer.resizeWorld();

    layer.wrap = true;

    map.setCollision(9);
    map.setCollisionBetween(17,23);
    //map.setCollisionBetween(25,31);
}

//Initializes all the characters
function initializesSprites(){

    //Creates group of interactable objects
	interactables = game.add.group();

    player = new Player(player,SCREEN_WIDTH/2,SCREEN_HEIGHT/2,"Protagonist_Ghost");

    //Create all NPCs
    npcs = new Array();
    //ghostOfYou = new NPC(ghostOfYou,SCREEN_WIDTH/3,SCREEN_HEIGHT/2,"Protagonist_Ghost",goGhost);
    currentFriend = new NPC(currentFriend, TILE_DIMENSIONS*(player.point.x+5), TILE_DIMENSIONS*(player.point.y+5), "Current_Friend");
    detective = new NPC(detective, TILE_DIMENSIONS*(player.point.x+5),TILE_DIMENSIONS*(player.point.y-5), "Detective");
    killer = new NPC(killer, TILE_DIMENSIONS*(player.point.x-5), TILE_DIMENSIONS*(player.point.y-5), "Killer");
    npcs.push(currentFriend);
    npcs.push(detective);
    npcs.push(killer);

    npcGroup = game.add.group();
    npcGroup.add(currentFriend.sprite);
    npcGroup.add(detective.sprite);
    npcGroup.add(killer.sprite);
    for (index = 0; index < npcGroup.children.length; index++){
    	npcs[index].sprite.body.immovable = true;
    	npcs[index].updateDirection();
    }
    //Adjust properties of NPCs
    //ghostOfYou.sprite.body.immovable = true;
}

//Initializes controls
function initializeControls(){
    cursors = game.input.keyboard.createCursorKeys();
    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    enterbar = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    game.input.enabled = true;
}

//Initialize evidence
function initializeEvidence(){
    var diary = interactables.create(game.world.centerX+100, game.world.centerY, "diary");
    game.physics.arcade.enable(diary);
    diary.anchor.set(0.5);
    diary.body.immovable = false;

}

//Update function
function update() {
    controls();
    collisionUpdate();
    movementAnimationUpdate();
    // Update the text of 'HUD'
    // Reference: https://gist.github.com/videlais/bb0d7e11dd7967b45ad1
    HUD.text =
        "Friend Belief Stat: " + Math.round(currentFriend.belief) +
        "\nDetective Belief Stat: " + Math.round(detective.belief) +
        "\nKiller Belief Stat: " + Math.round(killer.belief)
}

//Updates collision
function collisionUpdate() {

    game.physics.arcade.collide(player.sprite,layer);
    game.physics.arcade.collide(npcGroup,player.sprite);
    game.physics.arcade.collide(npcGroup,layer);
    game.physics.arcade.collide(npcGroup,npcGroup);
    
    if(game.physics.arcade.overlap(interactables, player.sprite)){
        text.x = game.world.centerX;
        text.y = 50;
        text.visible = true;
    }
    else{
        text.visible = false;
    }
}


//Manages controls for the game
function controls() {
    movementControls();
    for (index = 0; index < npcs.length; index++){
    	if (enableButtonInput && spacebar.isDown){
			npcs[index].interactUpdate();    		
    	}
    }
    //enterbar.onDown.add(function () {
    //    if(game.physics.arcade.overlap(diary, player.sprite)){
    //        text.setText("You are now reading the diary!");
    //        diary.y = game.world.centerY + (8 * Math.cos(game.time.now/200));
    //    }
    //}, this);

    game.physics.arcade.overlap(interactables, player.sprite,raiseObject,null,this);

}

//Raises passed object if conditions met
function raiseObject(player,object){
	if(spacebar.isDown){
        //Reference: https://developer.amazon.com/public/community/post/Tx1B570TUCFXJ66/Intro-To-Phaser-Part-2-Preloading-Sprites-Displaying-Text-and-Game-State
        object.y = game.world.centerY + (8 * Math.cos(game.time.now/200));
        changeBeliefStat(object);
    }
}


/*Defunct
//Test for spacebar events
function goGhost(){
    if (spacebar.isDown && enableButtonInput){
        if (prologueEnded==false){
            player.sprite.loadTexture("Protagonist_Ghost",FRAME_RATE,true);
            prologueEnded = true;
        } else {
            player.sprite.loadTexture("Protagonist_Not_Ghost",FRAME_RATE,true);
            prologueEnded = false;
        }
        disableInput();
    }
}
*/

//Interaction function if

function changeBeliefStat(object){
    for(var i=0; i<npcs.length; i++){
    	npcs[i].influenceCircle(object);
    }
}

//Reenables button input
function reenableInput(){
    enableButtonInput = true;
}

//Disables button input
function disableInput(){
    enableButtonInput=false;
    game.time.events.add(INPUT_DELAY,reenableInput,this);
}

//Manages movement controls
function movementControls(){
    //Resets movement
    player.sprite.body.velocity.x = 0;
    player.sprite.body.velocity.y = 0;
    player.updatePoint();
    if (cursors.right.isDown) {
        player.sprite.body.velocity.x = MOVEMENT_SPEED;
        player.sprite.animations.play("right");
    } else if (cursors.up.isDown) {
        player.sprite.body.velocity.y = -MOVEMENT_SPEED;
        player.sprite.animations.play("up");
    } else if (cursors.down.isDown) {
        player.sprite.body.velocity.y = MOVEMENT_SPEED;
        player.sprite.animations.play("down");
    } else if (cursors.left.isDown) {
        player.sprite.body.velocity.x = -MOVEMENT_SPEED;
        player.sprite.animations.play("left");
    } else {
        player.sprite.animations.stop(null,true);
    }
}

//Manages movement animations for NPCS
function movementAnimationUpdate(){
	//killer.updateMovement();
}

//Checks to see if overlap exist between a reference point to another point
function overlapExist(referencePoint,otherPoint){
	distance = new Phaser.Line(referencePoint.x,referencePoint.y,otherPoint.x,otherPoint.y);
	if (distance.length<OVERLAP_RADIUS){
		return true;
	} else {
		return false;
	}
}

//Checks to see if sphere of spooky influence exist between a reference point to another point
function spookyOverlapExist(referencePoint,otherPoint){
	distance = new Phaser.Line(referencePoint.x,referencePoint.y,otherPoint.x,otherPoint.y);
	if (distance.length<5){
		return true;
	} else {
		return false;
	}
}

//NPC Class
function NPC(sprite,x_position,y_position,name,interactFunction) {
    this.sprite = createSprite(this.sprite,x_position,y_position,name);
    this.interactFunction = interactFunction;
    this.point = new Phaser.Point(this.sprite.body.center.x/TILE_DIMENSIONS,this.sprite.body.center.y/TILE_DIMENSIONS);
    //1 = Down, 2 = Right, 3 = Up, 4 = Left, 0 = Not Moving
    this.direction = 0;
    this.interactUpdate = function(){
    	if (overlapExist(this.point,player.point)){
        	console.log(this.sprite.key+" "+this.point + ", Player" + player.point);
        	disableInput();
        }
    };
    this.influenceCircle = function(sprite){
    	thatPoint = new Phaser.Point(sprite.body.center.x/TILE_DIMENSIONS,sprite.body.center.y/TILE_DIMENSIONS);
    	if (spookyOverlapExist(this.point,thatPoint)){
    		if(this.belief + 0.1 <= 100){
            	this.belief=this.belief+0.1;
	        }
	        else{
	            this.belief = 100;
	        }
    	}
    }
    this.updateDirection = function(){
    	this.direction = Math.floor(Math.random()*5);
    	this.sprite.body.velocity.y = 0;
    	this.sprite.body.velocity.x = 0;
    	if (this.direction==1){
        	this.sprite.body.velocity.y = MOVEMENT_SPEED/2;
        	this.sprite.animations.play("down");
    	} else if (this.direction==2){
        	this.sprite.body.velocity.x = MOVEMENT_SPEED/2;
        	this.sprite.animations.play("right");
    	} else if (this.direction==3){
        	this.sprite.body.velocity.y = -MOVEMENT_SPEED/2;
        	this.sprite.animations.play("up");
    	} else if (this.direction==4){
        	this.sprite.body.velocity.x = -MOVEMENT_SPEED/2;
        	this.sprite.animations.play("left");
    	}
    	game.time.events.add(Phaser.Timer.SECOND, this.updateDirection, this);
    	this.updateMovement();
    }
    this.updateMovement = function(){
    	if ((this.sprite.deltaX && this.sprite.deltaY) || this.direction==0){
    		this.stop();
    	}
    	this.updatePoint();
    }
    this.updatePoint = function(){
        this.point = new Phaser.Point(this.sprite.body.center.x/TILE_DIMENSIONS,this.sprite.body.center.y/TILE_DIMENSIONS);
    }
    this.stop = function(){
    	this.sprite.animations.stop(null,true);
    }
    //Return random number between 1 and 50
    this.belief = Math.floor((Math.random() * 50) + 1);
}

//Player Class
function Player(sprite,x_position,y_position,name){
	this.sprite = createSprite(this.sprite,x_position,y_position,name);
    this.point = new Phaser.Point(this.sprite.body.center.x/TILE_DIMENSIONS,this.sprite.body.center.y/TILE_DIMENSIONS);
    this.updatePoint = function (){
    	this.point = new Phaser.Point(this.sprite.body.center.x/TILE_DIMENSIONS,this.sprite.body.center.y/TILE_DIMENSIONS);
    };
}

/**
 Initializes a sprite
 @param: sprite
 a var to store the sprite
 @param: x_position
 an integer refering to starting x position
 @param: y_position
 an integer refering to starting y position
 @param: name
 a string refering to the sprite sheet in the format of
 [downFrame1 downFrame2 downFrame3 downFrame4]
 [leftFrame1 leftFrame2 leftFrame3 leftFrame4]
 [rightFrame1 rightFrame2 rightFrame3 rightFrame4]
 [upFrame1 upFrame2 upFrame3 upFrame4]
 @return: the initialized sprite
 */
function createSprite(sprite,x_position,y_position,name) {
    //Initializes sprite and adds it to game
    sprite = game.add.sprite(x_position,y_position,name,0);

    //Enables physics
    game.physics.enable(sprite);
    sprite.body.collideWorldBounds = true;
    sprite.body.setSize(SPRITE_WIDTH*3/4,SPRITE_HEIGHT,SPRITE_WIDTH*1/8,0);

    sprite.animations.add("down",[0,1,2,3],FRAME_RATE,true);
    sprite.animations.add("left",[4,5,6,7],FRAME_RATE,true);
    sprite.animations.add("right",[8,9,10,11],FRAME_RATE,true);
    sprite.animations.add("up",[12,13,14,15],FRAME_RATE,true);
    return sprite;
}