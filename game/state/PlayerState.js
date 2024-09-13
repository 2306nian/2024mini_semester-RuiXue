class PlayerState {
    constructor() {
      this.items = [
        { actionId: "item_recoverHp", instanceId: "item1" },
        { actionId: "item_recoverHp", instanceId: "item2" },
        { actionId: "item_recoverHp", instanceId: "item3" },
      ]
      this.storyFlags = {
        1: true,
      };
    }
  
}
window.playerState = new PlayerState();
window.Achievement = {};