class Sprite{
    constructor(config){

        this.image = new Image();
        this.image.src = config.src;
        this.image.onload = () => {
          this.isLoaded = true;
        }

        this.shadow = new Image();
        this.useShadow = config.useShadow || true;
        if (this.useShadow) {
            this.shadow.src = "./asset/shadow.png";
        }
        this.shadow.onload = () => {
            this.isShadowLoaded = true;
        }

        this.animations = config.animations || {
            "idle-down": [ [1,0] ],
            "idle-left": [ [1,1] ],
            "idle-right": [ [1,2] ],
            "idle-up": [ [1,3] ],
            "walk-down": [ [0,0],[1,0],[2,0],[1,0], ],
            "walk-left": [ [0,1],[1,1],[2,1],[1,1], ],
            "walk-right": [ [0,2],[1,2],[2,2],[1,2], ],
            "walk-up": [ [0,3],[1,3],[2,3],[1,3], ]
          }

        this.currentAnimation = config.currentAnimation || "idle-down";
        this.currentAnimationFrame = 0;

        this.animationFrameLimit = config.animationFrameLimit || 8;
        this.animationFrameProgress = this.animationFrameLimit;

        this.gameObject = config.gameObject;
    }

    get frame() {
      // if (this.image.src === "./asset/npcA.png")
        return this.animations[this.currentAnimation][this.currentAnimationFrame]
    }
    setAnimation(key) {
        if (this.currentAnimation !== key) {
          this.currentAnimation = key;
          this.currentAnimationFrame = 0;
          this.animationFrameProgress = this.animationFrameLimit;
        }
    }

    updateAnimationProgress() {
        if (this.animationFrameProgress > 0) {
          this.animationFrameProgress -= 1;
          return;
        }
    
        this.animationFrameProgress = this.animationFrameLimit;
        this.currentAnimationFrame += 1;
    
        if (this.frame === undefined) {
          this.currentAnimationFrame = 0
        }
      }

    draw(ctx, cameraPerson){
        const x = this.gameObject.x - 16 + utils.withGrid(10.5) - cameraPerson.x;
        const y = this.gameObject.y - 18 + utils.withGrid(6) - cameraPerson.y;

        this.isShadowLoaded && ctx.drawImage(this.shadow, x-8, y-14);

        const [frameX, frameY] = this.frame;
        
        this.isLoaded && ctx.drawImage(
            this.image,
            frameX * 48, frameY * 48,
            48, 48,
            x, y,
            16, 16
        )

        this.updateAnimationProgress();
        
    }
}