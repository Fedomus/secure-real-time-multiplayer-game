import config from "./config.mjs";

const {
  avatarHeight, 
  avatarWidth, 
  coinHeight, 
  coinWidth,
  headlineHeight,
  containerHeight,
  containerWidth,
  padding
} = config;

class Player {
  
  constructor({x, y, score=0, id}) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
  }

  movePlayer(dir, speed) {
    switch(dir){
      case "up":
        this.y -= 
          this.y - speed < headlineHeight
            ? 0 
            : speed;
        break;
      case "down":
        this.y +=
          this.y + speed > containerHeight - avatarHeight - padding
            ? 0
            : speed;
        break;
      case "right":
        this.x +=
          this.x + speed > containerWidth - avatarWidth - padding
            ? 0
            : speed;
        break;
      case "left":
        this.x -= 
          this.x - speed < padding
            ? 0 
            : speed;
        break;
      default: 
        break;
    }
  }

  collision(item) {
    if(
      this.x <= item.x + coinWidth && 
      this.x + avatarWidth >= item.x && 
      this.y + avatarHeight >= item.y && 
      this.y <= item.y + coinHeight
      ){
        return true
      }
    return false
  }

  calculateRank(arr) {

  }
}

export default Player;
