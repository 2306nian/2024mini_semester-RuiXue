class GameObject{
    constructor(config){
        this.id = config.id;
        this.isMounted = false;
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.direction = config.direction || "down";
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || "./asset/player.png",
        });
        
        this.behaviorLoop = config.behaviorLoop || [];
        this.behaviorLoopIndex = 0;

        this.talking = config.talking || [];
        this.retryTimeout = null;//一个用于重试行为的计时器
    }

    mount(map){
        this.isMounted = true;
        setTimeout(() => {
            this.doBehaviorEvent(map);
        }, 10)
    }

    update(){

    }

    async doBehaviorEvent(map){

        //I don't have config to do anything
        if (this.behaviorLoop.length === 0 ) {
            return;
        }
  
      //Retry later if a cutscene is playing
        if (map.isCutscenePlaying) {
            //避免设置多个定时器
            if (this.retryTimeout) {
                clearTimeout(this.retryTimeout);
            }
            this.retryTimeout = setTimeout(() => {
                this.doBehaviorEvent(map)
            }, 1000)
            return;
        }

        let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
        eventConfig.who = this.id;

        //
        const eventHandler = new OverworldEvent({
            map,
            event: eventConfig,
        });
        await eventHandler.init();

        //
        this.behaviorLoopIndex += 1;
        if (this.behaviorLoopIndex === this.behaviorLoop.length){
            this.behaviorLoopIndex = 0;
        }

        //
        this.doBehaviorEvent(map);

    }
}