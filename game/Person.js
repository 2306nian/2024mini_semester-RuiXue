class Person extends GameObject{
    constructor(config){
        super(config);
        this.movingProgressRemaining = 0;
        this.isStanding = false;
        this.speed = config.speed || 1;

        this.intentPosition = null; //[x,y]

        this.isPlayerControlled = config.isPlayerControlled || false;

        this.directionUpdate = {
            "up": ["y", -this.speed],
            "down": ["y", this.speed],
            "left": ["x", -this.speed],
            "right": ["x", this.speed],
        }

        this.standBehaviorTimeout;
    }

    update(state){
        if (this.movingProgressRemaining > 0){
            this.updatePosition(state);
        } else {

            if (this.isPlayerControlled && (!state.map.isCutscenePlaying) && state.arrow){
                this.startBehavior(state, {
                    type: "walk",
                    direction: state.arrow,
                })
            }
            this.updateSprite(state);

        }
        
    }

    startBehavior(state, behavior) {

        if (!this.isMounted) {
          return;
        }
    
        //Set character direction to whatever behavior has
        this.direction = behavior.direction;
        
        if (behavior.type === "walk") {
          //Stop here if space is not free
          if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
    
            
              behavior.retry && setTimeout(() => {
                this.startBehavior(state, behavior)
              }, 10);
              return;
            
          }
    
          //Ready to walk!
          this.movingProgressRemaining = 16;
    
          //Add next position
          const intentPosition = utils.nextPosition(this.x,this.y, this.direction)
          this.intentPosition = [
            intentPosition.x,
            intentPosition.y,
          ]
    
          this.updateSprite(state);
        }
    
        if (behavior.type === "stand") {
          this.isStanding = true;
          this.standBehaviorTimeout = setTimeout(() => {
            utils.emitEvent("PersonStandComplete", {
              whoID: this.id
            })
            this.isStanding = false;
          }, behavior.time)
        }
    
      }

    updatePosition() {
        const [property, change] = this.directionUpdate[this.direction];
        this[property] += change;
        this.movingProgressRemaining -= 1;
        
        if (this.movingProgressRemaining === 0) {
          this.intentPosition = null;
          //We finished the walk!
          utils.emitEvent("PersonWalkingComplete", {
            whoID: this.id
          })
  
        }
    }

    updateSprite() {
        if (this.movingProgressRemaining > 0) {
            this.sprite.setAnimation("walk-"+this.direction);
            return;
        }
        this.sprite.setAnimation("idle-"+this.direction);    
    }
}