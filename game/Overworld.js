class Overworld {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.map = null;
        this.fps = 120;
        this.timer = null;
    }

    startGameLoop() {
        const step = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const cameraPerson = this.map.gameObjects.player;
            //白天黑夜切换
            if (this.timer.time >= 19) {
                if (window.playerState.storyFlags["day"]) delete window.playerState.storyFlags["day"];
                window.playerState.storyFlags["night"] = true;
            } else {
                if (window.playerState.storyFlags["night"]) delete window.playerState.storyFlags["night"];
                window.playerState.storyFlags["day"] = true;
            }

            Object.values(this.map.gameObjects).forEach(object => {
                object.update({
                    arrow: this.directionInput.direction,
                    map: this.map,
                })
            })

            this.map.drawLowerImage(this.ctx, cameraPerson);

            Object.values(this.map.gameObjects).sort((a, b) => {
                return a.y - b.y;
            }).forEach(object => {
                object.sprite.draw(this.ctx, cameraPerson);
            })

            this.useUpper && this.map.drawUpperImage(this.ctx, cameraPerson);
            this.map.checkForForcedCutscene();

            if (!this.map.isPaused) {
                setTimeout(() => {
                    step();
                }, 1000 / this.fps);
            }

            // requestAnimationFrame(() =>{
            //     step();
            // })
        }
        step();
    }

    bindActionInput() {
        new KeyPressListener("Space", () => {
            //Is there a person here to talk to?
            this.map.checkForActionCutscene()
        })
        new KeyPressListener("Escape", () => {
            if (!this.map.isCutscenePlaying) {
                this.map.startCutscene([
                    { type: "pause" }
                ])
            }
        })
        new KeyPressListener("KeyR", () => {
            if (!this.map.isCutscenePlaying) {
                this.map.startCutscene([
                    { type: "checkDiary" },
                ])
            }
        })
        new KeyPressListener("KeyB", () => {
            if (!this.map.isCutscenePlaying) {
                this.map.startCutscene([
                    { type: "checkRules" },
                ])
            }
        })
    }

    bindPlayerPositionCheck() {
        document.addEventListener("PersonWalkingComplete", e => {
            if (e.detail.whoID === "player") {
                //Player's position has changed
                this.map.checkForFootstepCutscene();
            }
        })
    }

    startMap(mapConfig, playerInitialState = null) {
        this.map = null;
        this.map = new OverworldMap(mapConfig);
        this.map.overworld = this;
        this.map.mountObjects();
        if (playerInitialState) {
            this.map.gameObjects.player.x = playerInitialState.x;
            this.map.gameObjects.player.y = playerInitialState.y;
            this.map.gameObjects.player.direction = playerInitialState.direction;
        }

        // this.progress.mapId = mapConfig.id;
        // this.progress.startingHeroX = this.map.gameObjects.hero.x;
        // this.progress.startingHeroY = this.map.gameObjects.hero.y;
        // this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;

    }
    init() {

        this.timer = new Timer(document.querySelector(".game-container"), this);

        //Create a new Progress tracker
        this.progress = new Progress(this);

        //Show the title screen

        //const useSaveFile = await this.titleScreen.init(container);
        var useSaveFile = true;
        if (sessionStorage.getItem('RuiXue_useSaveFile') === "false"){
            useSaveFile = false;
        }

        //Potentially load saved data
        let initialHeroState = null;
        if (useSaveFile && window.localStorage.getItem("RuiXue_SaveFile1") != null) {
            this.progress.load();
            console.log(this.progress);
            initialHeroState = {
                x: this.progress.startingHeroX,
                y: this.progress.startingHeroY,
                direction: this.progress.startingHeroDirection,
            }
            this.timer.time = this.progress.gametime.time;
            this.timer.day = this.progress.gametime.day;
            console.log(this.progress.gametime.time);
        }
        // const gameover = () => {
        //     this.map.isPaused = true;
        //     const gameovermenu = new GameoverMenu(
        //         this.overworld,
        //         () => {
        //             this.map.isPaused = false;
        //             this.map.overworld.startGameLoop();
        //         }
        //     )
        // }
        // this.startMap(window.OverworldMaps.Classroom_special);
        this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState || null);
        this.timer.init();


        this.bindActionInput();
        this.bindPlayerPositionCheck();

        this.directionInput = new DirectionInput();
        this.directionInput.init();

        // document.addEventListener("PlayerKilled", gameover);

        this.startGameLoop();

        if (this.timer.time === 6 && this.timer.day === 1) {
            this.map.startCutscene(
                [
                    { type: "textMessage", text: "(你从家中醒来，休学一年，今天是你转到XX中学上学的第一天)", head_src: "./asset/女主（尖叫）.png" },
                    { type: "textMessage", text: "妈妈：瑞雪，快收拾收拾出门了，上学第一天可别迟到了。”", head_src: "./asset/女主（尖叫）.png" },
                    { type: "textMessage", text: "我：好，妈妈，就来了。", head_src: "./asset/player_head.png" },
                    { type: "textMessage", text: "(听说这个寄宿学校有很多奇怪的传闻，到处是奇奇怪怪的规则，不知道真的假的)", head_src: "./asset/player_head.png" },
                    { type: "textMessage", text: "(算了，反正发小也要去这个学校，跟着发小一起总能有个照应)", head_src: "./asset/player_head.png" },
                    { type: "textMessage", text: "(不会出什么问题，学校能有什么奇怪的呢)", head_src: "./asset/player_head.png" },
                    { type: "textMessage", text: "操作提示：WASD键控制行走，空格键进行交互,ESC键唤出菜单栏" },
                ],
                "./asset/背景/早晨起床卧室背景.jpg",
            )
        }

    }

}