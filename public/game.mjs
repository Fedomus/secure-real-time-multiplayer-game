import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import config from "./config.mjs";

const {
    containerHeight, 
    containerWidth, 
    avatarHeight, 
    avatarWidth, 
    playFieldHeight, 
    playFieldWidth,
    padding,
    headlineHeight,
    speed,
    coinWidth, 
    coinHeight
} = config;
    
let player = {};
let opponents = [];

const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

const loadSprite = (src, width, height) => {
    const sprite = new Image(width, height);
    sprite.src = src;
    return sprite;
};

const randomIntFromInterval = (max, min) => { 
   return Math.floor(Math.random() * (max - min) + min)
}

const playerAvatar = loadSprite("../assets/player.png", avatarWidth, avatarHeight);
const opponentAvatar = loadSprite("../assets/opponent.png", avatarWidth, avatarHeight);
const coinImage = loadSprite("../assets/coin.png", coinWidth, coinHeight);

let coin, rankPosition;

const game = {

    clearCanvas: () => {
        context.clearRect(0, 0, containerWidth, containerHeight);
    },

    drawFraming: () => {
        // background
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        canvas.style.background = "#20200A";
        // play field
        context.beginPath();
        context.rect(padding, headlineHeight, playFieldWidth, playFieldHeight);
        context.strokeStyle = "#Eaeae4";
        context.closePath();
        context.stroke();
        // title
        context.fillStyle = "white";
        context.textAlign = "center";
        context.font = `bold 25px Courier New`;
        context.fillText("Coin Race", containerWidth / 2, 32);
        // controls
        context.font = `bold 20px Courier New`;
        context.fillText("Controls: WASD", 90, 32);
        // rank
        context.fillStyle = "white";
        context.font = `bold 20px Courier New`;
        context.fillText(`Rank: ${rankPosition} / ${opponents.length+1}`, containerWidth - 75, 32);
    },

    drawCharacters: () => {

        context.drawImage(playerAvatar, player.x, player.y, avatarWidth, avatarHeight);

        if(opponents){
            opponents.forEach(opp => {

                context.drawImage(opponentAvatar, opp.x, opp.y, avatarWidth, avatarHeight);
            })
        }

     
    },

    setCoin: () => {
        coin = new Collectible({
            x: randomIntFromInterval(containerWidth - padding - coinWidth, padding),
            y: randomIntFromInterval(containerHeight - padding - coinHeight, headlineHeight),
            value: 1,
            id: 1
        })
    },

    drawCoin: () => {
        context.drawImage(coinImage, coin.x, coin.y, coinWidth, coinHeight)
    },

    setRank: () => {
        opponents.push(player)
        let players = opponents
        opponents = opponents.filter(opp => opp.id != player.id)
        rankPosition = player.calculateRank(players, player)
        
    }
}

let keysPressed = {};
const socket = io();

function keyEvent(){
    for(const [key, val] of Object.entries(keysPressed)){
        switch (key) {
            case "w":
            case "ArrowUp":
                player.movePlayer("up", speed)
                if((keysPressed.d || keysPressed.ArrowRight)){
                    player.movePlayer("right", speed)
                }
                else if(keysPressed.a || keysPressed.ArrowLeft){
                    player.movePlayer("left", speed)
                } else {
                    player.movePlayer("up", speed)
                }
                break;
            case "s":
            case "ArrowDown":
                player.movePlayer("down", speed)
                if((keysPressed.d || keysPressed.ArrowRight)){
                    player.movePlayer("right", speed)
                }
                else if(keysPressed.a || keysPressed.ArrowLeft){
                    player.movePlayer("left", speed)
                } else {
                    player.movePlayer("down", speed)
                }
                break;
            case "a":
            case "ArrowLeft":
                player.movePlayer("left", speed)
                if(keysPressed.s || keysPressed.ArrowDown){
                    player.movePlayer("down", speed)
                }
                else if(keysPressed.w || keysPressed.ArrowUp){
                    player.movePlayer("up", speed)
                } else {
                    player.movePlayer("left", speed)
                }
                break;
            case "d":
            case "ArrowRight":
                player.movePlayer("right", speed)
                if(keysPressed.s || keysPressed.ArrowDown){
                    player.movePlayer("down", speed)
                }
                else if(keysPressed.w || keysPressed.ArrowUp){
                    player.movePlayer("up", speed)
                } else {
                    player.movePlayer("right", speed)
                }
                break;
            default:
                break;
        }
    
    }

    socket.emit("movePlayer", player)

    setTimeout(keyEvent, 10)
}

const renderGame = () => {

    game.clearCanvas()
    game.drawFraming()
    game.drawCoin()
    game.drawCharacters()

    if(!Object.keys(player).length == 0){

        if(player.collision(coin)){

            player.score++;
            console.log(player.score);
            socket.emit("updateRank", player)

            game.setCoin()
            game.drawCoin()
            game.setRank()
        }
    }
}

document.addEventListener('keyup', (event) => {
    delete keysPressed[event.key];
});

document.addEventListener("keydown", (event) => {
    keysPressed[event.key] = true;
});

socket.on("connect", () => {
    player = new Player({ 
        x: randomIntFromInterval(containerWidth - padding - avatarWidth, padding), 
        y: randomIntFromInterval(containerHeight - padding - avatarHeight, headlineHeight), 
        score: 0, 
        id: socket.id 
    });
    socket.emit("joinGame", player);
});

socket.on("updatePlayers", (players) => {
    opponents = players
        .filter(p => p.id != player.id)
        .map(p => {
            return new Player(p)
        })
    game.setRank()    
    requestAnimationFrame(renderGame)
});


keyEvent()
game.setCoin()

requestAnimationFrame(renderGame);

