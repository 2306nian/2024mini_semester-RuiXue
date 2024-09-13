class Progress {
  constructor(overworld) {
    this.mapId = "Home";
    this.startingHeroX = 14;
    this.startingHeroY = 6;
    this.startingHeroDirection = "down";
    this.saveFileKey = "RuiXue_SaveFile1";
    this.gametime = { day: 1, time: 7 };
    this.overworld = overworld;

  }

  updateGame() {
      const currentTime =  globalTimer.getTime();;
      this.gametime = { day: currentTime.day, time: currentTime.time };
      this.startingHeroX = this.overworld.map.gameObjects.player.x;
      this.startingHeroY = this.overworld.map.gameObjects.player.y;
      this.startingHeroDirection = this.overworld.map.gameObjects.player.direction;
      this.mapId = this.overworld.map.id;
  }
  save() {
   //更新游戏时间
    this.updateGame();

    window.localStorage.setItem(this.saveFileKey, JSON.stringify({
      mapId: this.mapId,
      startingHeroX: this.startingHeroX,
      startingHeroY: this.startingHeroY,
      startingHeroDirection: this.startingHeroDirection,
      playerState: {
        storyFlags: window.playerState.storyFlags,
        gametime:this.gametime ,
      }
    }))
  }

  getSaveFile() {

    if (!window.localStorage) {
      return null;
    }
    const file = window.localStorage.getItem(this.saveFileKey);
    return file ? JSON.parse(file) : null
  }

  load() {
    const file = this.getSaveFile();
    
    
    if (file) {
      this.mapId = file.mapId;
      this.startingHeroX = file.startingHeroX;
      this.startingHeroY = file.startingHeroY;
      this.startingHeroDirection = file.startingHeroDirection;
      Object.keys(file.playerState).forEach(key => {
        playerState[key] = file.playerState[key];
      });
      if (window.playerState.storyFlags["midnight"]) delete window.playerState.storyFlags["midnight"];

      if (file.playerState.gametime) {
        this.gametime.day = file.playerState.gametime.day;
        this.gametime.time = file.playerState.gametime.time; 
      }
      
    }
  }

}