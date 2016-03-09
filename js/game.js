//Game screen dimension variables
const SCREEN_WIDTH = 25*32;
const SCREEN_HEIGHT = 20*32;

var game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.AUTO, '', { preload: preload, create: create, update: update });

//Dimensions for spritesheet's individual sprite
const SPRITE_WIDTH = 128/4;
const SPRITE_HEIGHT = 192/4;
const TILE_DIMENSIONS =32;
//Movement speed and frame rate
const MOVEMENT_SPEED = 100;
const FRAME_RATE = 5;
//Event variables
var prologueEnded = false;
//Sprite variables
var player;

var ghostOfYou;
var currentFriend;
var killer;
var detective;
var diary;

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

    //game.add.sprite(0,0,"Background");

    player = new Player(player,SCREEN_WIDTH/2,SCREEN_HEIGHT/2,"Protagonist_Not_Ghost");

    //Create all NPCs
    ghostOfYou = new NPC(ghostOfYou,SCREEN_WIDTH/3,SCREEN_HEIGHT/2,"Protagonist_Ghost",goGhost);
    currentFriend = new NPC(currentFriend, 200, 300, "Current_Friend");
    detective = new NPC(detective, 300, 300, "Detective");
    killer = new NPC(killer, 400, 200, "Killer");
    //Adjust properties of NPCs
    ghostOfYou.sprite.body.immovable = true;
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
    // http://www.html5gamedevs.com/topic/6476-collision-with-gameaddgraphics-and-a-sprite/
    // http://jsfiddle.net/lewster32/4yh8ee1f/
    var diarybmd = game.add.bitmapData(32, 32);
    diarybmd.ctx.rect(0, 0, 32, 32);
    diarybmd.ctx.fillStyle = "black";
    diarybmd.ctx.fill();

    diary = game.add.sprite(game.world.centerX+100, game.world.centerY, diarybmd);
    game.physics.arcade.enable(diary);
    diary.anchor.set(0.5);
    diary.body.immovable = false;

}

//Update function
function update() {
    controls();
    collisionUpdate();
    cameraUpdate();

    // Update the text of 'HUD'
    // Reference: https://gist.github.com/videlais/bb0d7e11dd7967b45ad1
    HUD.text =
        "Friend Belief Stat: " + Math.round(currentFriend.belief) +
        "\nDetective Belief Stat: " + Math.round(detective.belief) +
        "\nKiller Belief Stat: " + Math.round(killer.belief)
}

//Updates collision
function collisionUpdate() {
    game.physics.arcade.collide(ghostOfYou.sprite,player.sprite);
    game.physics.arcade.collide(ghostOfYou.sprite,killer.sprite);
    ghostOfYou.interactUpdate();
    game.physics.arcade.collide(player.sprite,layer);

    if(game.physics.arcade.overlap(diary, player.sprite)){
        text.x = game.world.centerX;
        text.y = 50;
        text.visible = true;
    }
    else{
        text.visible = false;
    }
}

//Updates the camera position
function cameraUpdate() {

}

//Manages controls for the game
function controls() {
    movementControls();

    //enterbar.onDown.add(function () {
    //    if(game.physics.arcade.overlap(diary, player.sprite)){
    //        text.setText("You are now reading the diary!");
    //        diary.y = game.world.centerY + (8 * Math.cos(game.time.now/200));
    //    }
    //}, this);

    if(enterbar.isDown && game.physics.arcade.overlap(diary, player.sprite)){
        //Reference: https://developer.amazon.com/public/community/post/Tx1B570TUCFXJ66/Intro-To-Phaser-Part-2-Preloading-Sprites-Displaying-Text-and-Game-State
        diary.y = game.world.centerY + (8 * Math.cos(game.time.now/200));
        changeBeliefStat();
    }
}


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

function changeBeliefStat(){

    var spriteObjects = [currentFriend,detective,killer];
    var rate = .1

    for(var i=0; i<spriteObjects.length; i++){
        //Increase NPC's belief stat on contact but keep under 100
        if(spriteObjects[i].belief + rate <= 100){
            spriteObjects[i].belief=spriteObjects[i].belief+rate;
        }
        else{
            spriteObjects[i].belief = 100;
        }
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

    if (cursors.right.isDown && enableButtonInput) {
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

//NPC Class
function NPC(sprite,x_position,y_position,name,interactFunction) {
    this.sprite = createSprite(this.sprite,x_position,y_position,name);
    this.interactFunction = interactFunction;
    this.x_grid = Math.floor(x_position/TILE_DIMENSIONS);
	this.y_grid = Math.floor(y_position/TILE_DIMENSIONS);
    this.interactUpdate = function(){
        if (player.sprite.body.touching && this.sprite.body.touching){
            this.interactFunction();
        }
    };
    //Return random number between 1 and 50
    this.belief = Math.floor((Math.random() * 50) + 1);
}

//Player Class
function Player(sprite,x_position,y_position,name){
	this.sprite = createSprite(this.sprite,x_position,y_position,name);
	//0 = Down, 1 = Right, 2 = Up, 3 = Down
	this.direction = 0;
	this.x_grid = Math.floor(this.sprite.body.center.x/TILE_DIMENSIONS);
	this.y_grid = Math.floor(this.sprite.body.center.y/TILE_DIMENSIONS);

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