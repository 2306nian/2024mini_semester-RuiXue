class OverworldEvent {
    constructor({ map, event}) {
        this.map = map;
        this.event = event;
        console.log(this.event);
    }

    stand(resolve) {
        const who = this.map.gameObjects[this.event.who];
        who.startBehavior({
            map: this.map
        }, {
            type: "stand",
            direction: this.event.direction,
            time: this.event.time
        });

        const completeHandler = e => {
            if (e.detail.whoID === this.event.who) {
                document.removeEventListener("PersonStandComplete", completeHandler);
                resolve();
            }
        }
        document.addEventListener("PersonStandComplete", completeHandler)

    }

    walk(resolve) {
        const who = this.map.gameObjects[this.event.who];
        who.startBehavior({
            map: this.map
        }, {
            type: "walk",
            direction: this.event.direction,
            retry: true,
        });

        const completeHandler = e => {
            if (e.detail.whoID === this.event.who) {
                document.removeEventListener("PersonWalkingComplete", completeHandler);
                resolve();
            }
        }
        document.addEventListener("PersonWalkingComplete", completeHandler);

    }

    textMessage(resolve) {

        if (this.event.facePlayer) {
            const obj = this.map.gameObjects[this.event.facePlayer];
            obj.direction = utils.oppositeDirection(this.map.gameObjects["player"].direction);
        }

        const message = new TextMessage({
            text: this.event.text,
            onComplete: () => resolve(),
            head_img_src: this.event.head_src,
            img_src: this.event.img_src,
        })
        message.init(document.querySelector(".game-container"))
    }

    changeMap(resolve) {
        Object.values(this.map.gameObjects).forEach(obj => {
            obj.isMounted = false;
        })

        const sceneTransition = new SceneTransition();
        sceneTransition.init(document.querySelector(".game-container"), () => {
            this.map.overworld.startMap(window.OverworldMaps[this.event.map], this.event.position);
            resolve();
            sceneTransition.fadeOut();
        })
    }

    pause(resolve) {
        this.map.isPaused = true;
        const menu = new PauseMenu({
            progress: this.map.overworld.progress,
            onComplete: () => {
                resolve();
                this.map.isPaused = false;
                this.map.overworld.startGameLoop();
            }
        });
        menu.init(document.querySelector(".game-container"));
    }

    checkDiary(resolve) {
        const diary = new Diary( () => {
            resolve();
        });
        diary.init(document.querySelector(".game-container"));
    }

    checkRules(resolve) {
        const diary = new Rules( () => {
            resolve();
        });
        diary.init(document.querySelector(".game-container"));
    }

    addStoryFlag(resolve) {
        window.playerState.storyFlags[this.event.flag] = true;
        resolve();
    }

    timeLapse(resolve) {
        this.map.overworld.timer.update(this.event.time);
        resolve();
    }

    surviveFromSan(resolve) {

        const sceneTransition = new SceneTransition();
        sceneTransition.init(document.querySelector(".game-container"), () => {
            delete window.playerState.storyFlags["midnight"];
            this.map.overworld.timer.san.clear();
            this.map.overworld.timer.creatElement();
            this.map.overworld.timer.san = null;
            resolve();
            sceneTransition.fadeOut();
        })
    }

    playGame(resolve) {
        const completeHandler = () => {
            document.removeEventListener("backToGame", completeHandler);
            document.querySelector("canvas").classList.remove("toEmbed-canvas");
            toEmbed.remove();
            btn.remove();

            resolve();
        }
        document.addEventListener("backToGame", completeHandler);
        const container = this.event.container;

        let toEmbed = document.createElement("iframe");
        toEmbed.src = this.event.toEmbed;
        toEmbed.classList.add("toEmbed");
        document.querySelector("canvas").classList.add("toEmved-canvas");
        container.appendChild(toEmbed);

        let btn = document.createElement("button");
        btn.innerText = "back to game";
        btn.classList.add("backToGame-button");
        btn.addEventListener("click", () => { utils.emitEvent("backToGame"), completeHandler });
        document.body.appendChild(btn);
    }

    sleep(resolve) {
        const sceneTransition = new SceneTransition();
        sceneTransition.init(document.querySelector(".game-container"), () => {
            this.map.overworld.timer.time = 6;
            if (this.map.overworld.timer.san) {
                this.map.overworld.timer.san.clear();
                this.map.overworld.timer.san = null;
            }
        
            this.map.overworld.startMap(window.OverworldMaps["day_background"]);
            this.map.overworld.timer.changeday();
            this.map.overworld.timer.update();
            resolve();
            sceneTransition.fadeOut();
        })
    }

    createNPC(resolve){
        Object.keys(this.event.configObjects).forEach(key => {
            let object = this.event.configObjects[key];
            object.id = key;

            let instance;
            if (object.type === "Person"){
                instance = new Person(object);
            }
            console.log(instance);
            this.map.overworld.map.gameObjects[key] = instance;
            this.map.overworld.map.gameObjects[key].id = key;
            instance.mount(this);
        })

        resolve();
    }

    deleteNPC(resolve){
        let who = this.map.gameObjects[this.event.who];
        who.isMounted = false;
        delete this.map.gameObjects[this.event.who];
        resolve();
    }

    //lxy
    deleteStoryFlag(resolve){
        delete window.playerState.storyFlags[this.event.flag];
        resolve();
    }

    choose(resolve) {
        const choosemenu = new ChooseMenu(this.map.overworld, this.event.options, this.event.callbacks, () => {
            resolve();
        });
        choosemenu.init(document.querySelector(".game-container"));
    }

    setAchievement(resolve){

        //检查是否已经有该成就
        let file = window.localStorage.getItem("RuiXue_Achievements");
        if (file){
            file = JSON.parse(file);
            console.log(file);
            window.Achievement = file.achievement;
            console.log(window.Achievement);
        } 
        if (window.Achievement[this.event.achievement]){
            resolve();
            return;
        }

        //文本和图片
        const message = new TextMessage({
            text: this.event.text,
            onComplete: () => resolve(),
            head_img_src: this.event.head_src,
            img_src: this.event.img_src,
        })
        message.init(document.querySelector(".game-container"))

        //在localStorage里添加成就
        console.log("addAchievement");
        window.Achievement[this.event.achievement] = true;
        window.localStorage.setItem("RuiXue_Achievements", JSON.stringify({
            achievement: window.Achievement,
        }))
    }

    jumpToTime(resolve){
        const sceneTransition = new SceneTransition();
        sceneTransition.init(document.querySelector(".game-container"), () => {
            this.map.overworld.timer.time = this.event.time - 1;
            this.map.overworld.timer.update();
            resolve();
            sceneTransition.fadeOut();
        })
    }

    gameover(resolve){
        const gameovermenu = new GameoverMenu(
            this.map.overworld,
            () => {
                resolve();
            }
        )
        gameovermenu.init(document.querySelector(".game-container"));
    }

    gameover2(resolve){
        const sceneTransition = new SceneTransition();
        sceneTransition.init(document.querySelector(".game-container"), async () => {
            resolve();
            this.map.overworld.progress.load();
            let initialHeroState = {
                x: this.map.overworld.progress.startingHeroX,
                y: this.map.overworld.progress.startingHeroY,
                direction: this.map.overworld.progress.startingHeroDirection,
            }
            this.map.overworld.timer.time = this.map.overworld.progress.gametime.time-1;
            this.map.overworld.timer.update();
            this.map.overworld.timer.day = this.map.overworld.progress.gametime.day;
            this.map.overworld.startMap(window.OverworldMaps[this.map.overworld.progress.mapId], initialHeroState );
            sceneTransition.fadeOut();
        })
    }

    pass(resolve){
        const sceneTransition = new SceneTransition();
        sceneTransition.init(document.querySelector(".game-container"), () => {
            localStorage.removeItem("RuiXue_SaveFile1");
            resolve();
            window.location.replace("../main/main.html");
        })
    }


    init() {
        if (!this.map.isCutscenePlaying) {
            this.map.isCutscenePlaying = true;
        }
        console.log(window.playerState.storyFlags);

        return new Promise(resolve => {
            this[this.event.type](resolve);
        })
    }
}