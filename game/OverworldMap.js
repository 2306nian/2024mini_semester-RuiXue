class OverworldMap {
    constructor(config) {
        this.overworld = null;
        this.id = config.id || "DemoRoom";
        this.gameObjects = {};
        this.configObjects = config.configObjects;

        this.cutsceneSpaces = config.cutSceneSpaces || {};
        this.walls = config.walls || {};

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        this.forcedCutscene = config.forcedCutscene || [];

        this.useUpper = config.useUpper || false;
        this.upperImage = new Image();
        if (this.useUpper) {
            this.upperImage.src = config.upperSrc;
        }
        this.upperImage.onload = () => {
            this.isupperLoaded = true;
        }

        this.isCutscenePlaying = false;
        this.isPaused = false;

        this.drawWalls();
    }

    drawLowerImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.lowerImage,
            utils.withGrid(10.5) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y,
            this.lowerImage.width * 1 / 3,
            this.lowerImage.height * 1 / 3,
        )
    }

    drawUpperImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.upperImage,
            utils.withGrid(10.5) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y,
        )
    }

    isSpaceTaken(currentX, currentY, direction) {
        const { x, y } = utils.nextPosition(currentX, currentY, direction);
        if (this.walls[`${x},${y}`]) {
            return true;
        }
        // Check for objects that match
        return Object.values(this.gameObjects).find(obj => {
            if (obj.x === x && obj.y === y) { return true; }
            if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[1] === y) {
                return true;
            }
            return false;
        })
    }

    mountObjects() {
        Object.keys(this.configObjects).forEach(key => {
            let object = this.configObjects[key];
            object.id = key;

            let instance;
            if (object.type === "Person") {
                instance = new Person(object);
            }

            this.gameObjects[key] = instance;
            this.gameObjects[key].id = key;
            instance.mount(this);

        })
    }

    async startCutscene(events, img) {
        this.isCutscenePlaying = true;

        if (img) {
            this.isPaused = true;
            await utils.wait(100);
            this.overworld.ctx.clearRect(0, 0, this.overworld.canvas.width, this.overworld.canvas.height);
            const Back_img = new Image();
            Back_img.src = img;
            Back_img.onload = () => {
                console.log(this.overworld.ctx);
                this.overworld.ctx.drawImage(Back_img, 0, 0, this.overworld.canvas.width, this.overworld.canvas.height);
            };
        }

        for (let i = 0; i < events.length; i++) {
            const eventHandler = new OverworldEvent({
                event: events[i],
                map: this.overworld.map,
                img: img,
            })
            await eventHandler.init();
        }
        if (img) {
            this.isPaused = false;
            this.overworld.startGameLoop();
        }
        this.overworld.map.isCutscenePlaying = false;
    }

    checkForActionCutscene() {
        const player = this.gameObjects["player"];
        const nextCoords = utils.nextPosition(player.x, player.y, player.direction);
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
        });
        if (!this.isCutscenePlaying && match && match.talking.length) {

            const relevantScenario = match.talking.find(scenario => {
                return (scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf]
                })
            })
            relevantScenario && this.startCutscene(relevantScenario.events, relevantScenario.img)
        }
    }

    checkForFootstepCutscene() {
        const player = this.gameObjects["player"];
        const match = this.cutsceneSpaces[`${player.x},${player.y}`];
        if (!this.isCutscenePlaying && match) {
            // this.startCutscene( match[0].events )
            const relevantScenario = match.find(scenario => {
                return ((scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf]
                }) && (scenario.excepts || []).every(sf => {
                    return !playerState.storyFlags[sf]
                }))
            })
            relevantScenario && this.startCutscene(relevantScenario.events, relevantScenario.img)
        }
    }

    checkForForcedCutscene() {
        if (!this.isCutscenePlaying) {
            const relevantScenario = this.forcedCutscene.find(scenario => {
                return ((scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf]
                }) && (scenario.excepts || []).every(sf => {
                    return !playerState.storyFlags[sf]
                }))
            })
            relevantScenario && this.startCutscene(relevantScenario.events, relevantScenario.img)
        }
    }




    drawWalls() {
        if (this.id === "StudyRoom") {
            for (let x = 3; x <= 15; x++) {
                this.walls[utils.asGridCoord(x, 4)] = true;
                this.walls[utils.asGridCoord(x, 21)] = true;
            }
            for (let y = 4; y <= 21; y++) {
                this.walls[utils.asGridCoord(3, y)] = true;
                this.walls[utils.asGridCoord(15, y)] = true;
            }

            for (let x = 4; x <= 14; x++) {
                if (x >= 8 && x <= 10) continue;
                this.walls[utils.asGridCoord(x, 6)] = true;
                this.walls[utils.asGridCoord(x, 8)] = true;
                this.walls[utils.asGridCoord(x, 12)] = true;
                this.walls[utils.asGridCoord(x, 14)] = true;
            }
            this.walls[utils.asGridCoord(7, 5)] = true;
            this.walls[utils.asGridCoord(7, 7)] = true;
            this.walls[utils.asGridCoord(11, 7)] = true;
            this.walls[utils.asGridCoord(12, 7)] = true;
            this.walls[utils.asGridCoord(11, 11)] = true;
            this.walls[utils.asGridCoord(5, 13)] = true;
            this.walls[utils.asGridCoord(6, 13)] = true;
            this.walls[utils.asGridCoord(11, 13)] = true;
            this.walls[utils.asGridCoord(14, 15)] = true;
            this.walls[utils.asGridCoord(14, 17)] = true;
            this.walls[utils.asGridCoord(14, 18)] = true;
            this.walls[utils.asGridCoord(9, 20)] = true;
            this.walls[utils.asGridCoord(13, 20)] = true;

            this.walls[utils.asGridCoord(16, 19)] = true;
            delete this.walls[utils.asGridCoord(15, 19)];
        }
        else if (this.id === "Gallery_1st" || this.id === "Gallery_2nd") {
            for (let x = 2; x < 54; x++) {
                this.walls[utils.asGridCoord(x, 5)] = true;
            }
            for (let x = 5; x < 57; x++) {
                this.walls[utils.asGridCoord(x, 8)] = true;
            }
            for (let y = 3; y < 9; y++) {
                this.walls[utils.asGridCoord(56, y)] = true;
            }
            for (let y = 3; y < 11; y++) {
                this.walls[utils.asGridCoord(2, y)] = true;
            }

            this.walls[utils.asGridCoord(3, 11)] = true;
            this.walls[utils.asGridCoord(4, 11)] = true;
            this.walls[utils.asGridCoord(5, 9)] = true;
            this.walls[utils.asGridCoord(5, 10)] = true;
            this.walls[utils.asGridCoord(53, 3)] = true;
            this.walls[utils.asGridCoord(53, 4)] = true;
            this.walls[utils.asGridCoord(54, 2)] = true;
            this.walls[utils.asGridCoord(55, 2)] = true;

            this.walls[utils.asGridCoord(25, 5)] = false;
            this.walls[utils.asGridCoord(25, 4)] = true;
            this.walls[utils.asGridCoord(28, 5)] = false;
            this.walls[utils.asGridCoord(28, 4)] = true;
            this.walls[utils.asGridCoord(30, 5)] = false;
            this.walls[utils.asGridCoord(30, 4)] = true;
            this.walls[utils.asGridCoord(52, 5)] = false;
            this.walls[utils.asGridCoord(52, 4)] = true;
        }
        else if (this.id === "Classroom_normal_102" || this.id === "Classroom_normal_201" || this.id === "Classroom_normal_101" || this.id === "Classroom_normal_202") {
            for (let y = 2; y < 22; y++) {
                this.walls[utils.asGridCoord(3, y)] = true;
            }
            for (let y = 2; y < 22; y++) {
                if (y === 6) this.walls[utils.asGridCoord(16, y)] = true;
                else this.walls[utils.asGridCoord(15, y)] = true;
            }
            for (let x = 4; x < 15; x++) {
                this.walls[utils.asGridCoord(x, 4)] = true;
            }
            for (let x = 4; x < 15; x++) {
                this.walls[utils.asGridCoord(x, 21)] = true;
            }
            for (let x = 5; x < 14; x += 2) {
                for (let y = 8; y < 19; y += 2) {
                    this.walls[utils.asGridCoord(x, y)] = true;
                }
            }
            //书架
            this.walls[utils.asGridCoord(4, 5)] = true;
            //盆栽
            this.walls[utils.asGridCoord(14, 5)] = true;
            //三张桌子（讲台）
            this.walls[utils.asGridCoord(8, 6)] = true;
            this.walls[utils.asGridCoord(9, 6)] = true;
            this.walls[utils.asGridCoord(10, 6)] = true;
        }
        else if (this.id === "Classroom_special") {
            for (let y = 2; y < 22; y++) {
                this.walls[utils.asGridCoord(3, y)] = true;
            }
            for (let y = 2; y < 22; y++) {
                if (y === 6) this.walls[utils.asGridCoord(16, y)] = true;
                else this.walls[utils.asGridCoord(15, y)] = true;
            }
            for (let x = 4; x < 15; x++) {
                this.walls[utils.asGridCoord(x, 4)] = true;
            }
            for (let x = 4; x < 15; x++) {
                this.walls[utils.asGridCoord(x, 21)] = true;
            }
            for (let x = 5; x < 14; x += 2) {
                for (let y = 8; y < 19; y += 2) {
                    this.walls[utils.asGridCoord(x, y)] = true;
                }
            }
            //书架
            this.walls[utils.asGridCoord(4, 5)] = true;
            //盆栽
            this.walls[utils.asGridCoord(14, 5)] = true;
            //讲台
            this.walls[utils.asGridCoord(8, 6)] = true;
            this.walls[utils.asGridCoord(9, 6)] = true;
            this.walls[utils.asGridCoord(10, 6)] = true;
            //柜子
            this.walls[utils.asGridCoord(6, 5)] = true;
        }
        else if (this.id === "DiningHall_normal") {
            for (let y = 2; y < 19; y++) {
                this.walls[utils.asGridCoord(3, y)] = true;
            }
            for (let y = 2; y < 19; y++) {
                this.walls[utils.asGridCoord(21, y)] = true;
            }
            for (let x = 4; x < 21; x++) {
                this.walls[utils.asGridCoord(x, 2)] = true;
            }
            for (let x = 4; x < 21; x++) {
                this.walls[utils.asGridCoord(x, 9)] = true;
            }
            for (let x = 4; x < 8; x++) {
                this.walls[utils.asGridCoord(x, 18)] = true;
            }
            for (let x = 11; x < 21; x++) {
                this.walls[utils.asGridCoord(x, 18)] = true;
            }
            for (let y = 19; y < 22; y++) {
                this.walls[utils.asGridCoord(7, y)] = true;
            }
            for (let y = 19; y < 22; y++) {
                this.walls[utils.asGridCoord(11, y)] = true;
            }
            for (let x = 8; x < 11; x++) {
                this.walls[utils.asGridCoord(x, 22)] = true;
            }
            //饮料机？也许
            this.walls[utils.asGridCoord(20, 10)] = true;
            //盆栽
            this.walls[utils.asGridCoord(20, 11)] = true;
            //泰迪熊
            this.walls[utils.asGridCoord(11, 16)] = true;
            //六张桌子
            this.walls[utils.asGridCoord(5, 13)] = true;
            this.walls[utils.asGridCoord(6, 13)] = true;
            this.walls[utils.asGridCoord(12, 13)] = true;
            this.walls[utils.asGridCoord(13, 13)] = true;
            this.walls[utils.asGridCoord(17, 13)] = true;
            this.walls[utils.asGridCoord(18, 13)] = true;
            this.walls[utils.asGridCoord(5, 16)] = true;
            this.walls[utils.asGridCoord(6, 16)] = true;
            this.walls[utils.asGridCoord(12, 16)] = true;
            this.walls[utils.asGridCoord(13, 16)] = true;
            this.walls[utils.asGridCoord(17, 16)] = true;
            this.walls[utils.asGridCoord(18, 16)] = true;
            //有人的座位
            this.walls[utils.asGridCoord(6, 12)] = true;
            this.walls[utils.asGridCoord(13, 12)] = true;
            this.walls[utils.asGridCoord(18, 12)] = true;
            this.walls[utils.asGridCoord(5, 15)] = true;
            this.walls[utils.asGridCoord(6, 15)] = true;
            this.walls[utils.asGridCoord(18, 15)] = true;
        }
        else if (this.id === "Library") {
            for (let x = 3; x <= 15; x++) {
                this.walls[utils.asGridCoord(x, 5)] = true;
                this.walls[utils.asGridCoord(x, 21)] = true;
            }
            for (let y = 5; y <= 21; y++) {
                this.walls[utils.asGridCoord(3, y)] = true;
                this.walls[utils.asGridCoord(15, y)] = true;
            }

            //桌子
            this.walls[utils.asGridCoord(6, 7)] = true;
            this.walls[utils.asGridCoord(7, 7)] = true;
            this.walls[utils.asGridCoord(6, 8)] = true;
            this.walls[utils.asGridCoord(7, 8)] = true;

            this.walls[utils.asGridCoord(11, 7)] = true;
            this.walls[utils.asGridCoord(12, 7)] = true;
            this.walls[utils.asGridCoord(11, 8)] = true;
            this.walls[utils.asGridCoord(12, 8)] = true;

            this.walls[utils.asGridCoord(6, 11)] = true;
            this.walls[utils.asGridCoord(7, 11)] = true;
            this.walls[utils.asGridCoord(6, 12)] = true;
            this.walls[utils.asGridCoord(7, 12)] = true;

            //人和办公桌
            this.walls[utils.asGridCoord(12, 11)] = true;
            this.walls[utils.asGridCoord(13, 11)] = true;
            this.walls[utils.asGridCoord(14, 11)] = true;
            this.walls[utils.asGridCoord(13, 12)] = true;
            this.walls[utils.asGridCoord(14, 12)] = true;

            //书架
            this.walls[utils.asGridCoord(4, 14)] = true;
            this.walls[utils.asGridCoord(5, 14)] = true;
            this.walls[utils.asGridCoord(6, 14)] = true;
            this.walls[utils.asGridCoord(7, 14)] = true;
            this.walls[utils.asGridCoord(8, 14)] = true;
            this.walls[utils.asGridCoord(9, 14)] = true;
            this.walls[utils.asGridCoord(10, 14)] = true;
            this.walls[utils.asGridCoord(4, 15)] = true;
            this.walls[utils.asGridCoord(5, 15)] = true;
            this.walls[utils.asGridCoord(6, 15)] = true;
            this.walls[utils.asGridCoord(7, 15)] = true;
            this.walls[utils.asGridCoord(8, 15)] = true;
            this.walls[utils.asGridCoord(9, 15)] = true;
            this.walls[utils.asGridCoord(10, 15)] = true;

            this.walls[utils.asGridCoord(8, 17)] = true;
            this.walls[utils.asGridCoord(9, 17)] = true;
            this.walls[utils.asGridCoord(10, 17)] = true;
            this.walls[utils.asGridCoord(11, 17)] = true;
            this.walls[utils.asGridCoord(12, 17)] = true;
            this.walls[utils.asGridCoord(13, 17)] = true;
            this.walls[utils.asGridCoord(14, 17)] = true;
            this.walls[utils.asGridCoord(8, 18)] = true;
            this.walls[utils.asGridCoord(9, 18)] = true;
            this.walls[utils.asGridCoord(10, 18)] = true;
            this.walls[utils.asGridCoord(11, 18)] = true;
            this.walls[utils.asGridCoord(12, 18)] = true;
            this.walls[utils.asGridCoord(13, 18)] = true;
            this.walls[utils.asGridCoord(14, 18)] = true;

            //杂项
            this.walls[utils.asGridCoord(6, 19)] = true;
            this.walls[utils.asGridCoord(4, 20)] = true;
            this.walls[utils.asGridCoord(13, 20)] = true;
            this.walls[utils.asGridCoord(14, 20)] = true;

            delete this.walls[utils.asGridCoord(15, 9)];
            delete this.walls[utils.asGridCoord(3, 19)];
            this.walls[utils.asGridCoord(2, 19)] = true;
            this.walls[utils.asGridCoord(16, 9)] = true;
        }
        if (this.id === "Equipmentroom1") {
            this.walls[utils.asGridCoord(16, 6)] = true;//门口另一侧
            this.walls[utils.asGridCoord(15, 8)] = true;
            this.walls[utils.asGridCoord(15, 7)] = true;
            this.walls[utils.asGridCoord(15, 5)] = true;
            this.walls[utils.asGridCoord(15, 5)] = true;
            this.walls[utils.asGridCoord(15, 4)] = true;
            this.walls[utils.asGridCoord(13, 8)] = true;//羽毛球拍
            this.walls[utils.asGridCoord(14, 8)] = true;
            this.walls[utils.asGridCoord(5, 8)] = true;//乒乓球拍
            this.walls[utils.asGridCoord(4, 8)] = true;
            this.walls[utils.asGridCoord(4, 6)] = true;//坤球
            this.walls[utils.asGridCoord(5, 5)] = true;//铁柜子
            this.walls[utils.asGridCoord(6, 5)] = true;//小柜子
            this.walls[utils.asGridCoord(7, 5)] = true;//足球
            for (let x = 14; x >= 4; x--) { this.walls[utils.asGridCoord(x, 9)] = true; }
            for (let y = 8; y >= 5; y--) { this.walls[utils.asGridCoord(3, y)] = true; }
            for (let x = 4; x <= 15; x++) { this.walls[utils.asGridCoord(x, 4)] = true; }
        }
        if (this.id === "Equipmentroom2") {
            this.walls[utils.asGridCoord(15, 6)] = true;//门口另一侧
            this.walls[utils.asGridCoord(14, 5)] = true;
            this.walls[utils.asGridCoord(14, 7)] = true;
            this.walls[utils.asGridCoord(14, 8)] = true;
            for (let x = 13; x >= 3; x--) { this.walls[utils.asGridCoord(x, 9)] = true; }
            for (let y = 8; y >= 5; y--) { this.walls[utils.asGridCoord(2, y)] = true; }
            for (let x = 3; x <= 15; x++) { this.walls[utils.asGridCoord(x, 4)] = true; }
            this.walls[utils.asGridCoord(12, 5)] = true;//沙发
            this.walls[utils.asGridCoord(11, 5)] = true;
            this.walls[utils.asGridCoord(6, 6)] = true;//裸男
            this.walls[utils.asGridCoord(6, 7)] = true;//办公桌
            this.walls[utils.asGridCoord(6, 8)] = true;
            this.walls[utils.asGridCoord(5, 5)] = true;//后面区域过不去就不做碰撞了
        }
        if (this.id === "Testroom") {
            this.walls[utils.asGridCoord(16, 6)] = true;//门口另一侧
            this.walls[utils.asGridCoord(15, 5)] = true;
            this.walls[utils.asGridCoord(14, 5)] = true;//门口盆栽
            for (let x = 14; x >= 4; x--) { this.walls[utils.asGridCoord(x, 4)] = true; }
            this.walls[utils.asGridCoord(4, 5)] = true;//书柜
            for (let y = 5; y <= 20; y++) { this.walls[utils.asGridCoord(3, y)] = true; }
            this.walls[utils.asGridCoord(4, 20)] = true;//左下盆栽
            for (let x = 4; x <= 14; x++) { this.walls[utils.asGridCoord(x, 21)] = true; }
            this.walls[utils.asGridCoord(14, 20)] = true;//右下盆栽
            for (let y = 20; y >= 5; y--) { this.walls[utils.asGridCoord(15, y)] = true; }
            this.walls[utils.asGridCoord(9, 19)] = true;
            this.walls[utils.asGridCoord(9, 18)] = true;
            for (let y = 7; y <= 14; y++) { this.walls[utils.asGridCoord(13, y)] = true; }//右一
            for (let y = 7; y <= 14; y++) { this.walls[utils.asGridCoord(11, y)] = true; }//右二
            for (let y = 8; y <= 14; y++) { this.walls[utils.asGridCoord(9, y)] = true; }//自己这排
            for (let y = 7; y <= 14; y++) { this.walls[utils.asGridCoord(7, y)] = true; }//左二
            for (let y = 7; y <= 14; y++) { this.walls[utils.asGridCoord(5, y)] = true; }//左一
        }
        if (this.id === "Gate") {
            this.walls[utils.asGridCoord(10, 15)] = true;
            this.walls[utils.asGridCoord(14, 15)] = true;
            for (let x = 10; x >= 4; x--) { this.walls[utils.asGridCoord(x, 14)] = true; }
            for (let x = 14; x <= 20; x++) { this.walls[utils.asGridCoord(x, 14)] = true; }
            this.walls[utils.asGridCoord(12, 13)] = true;
            this.walls[utils.asGridCoord(11, 13)] = true;
            this.walls[utils.asGridCoord(13, 13)] = true;
            this.walls[utils.asGridCoord(7, 15)] = true;
            this.walls[utils.asGridCoord(6, 15)] = true;
            this.walls[utils.asGridCoord(17, 15)] = true;
            this.walls[utils.asGridCoord(18, 15)] = true;
            this.walls[utils.asGridCoord(18, 20)] = true;
            this.walls[utils.asGridCoord(19, 20)] = true;
            for (let y = 13; y >= 10; y--) { this.walls[utils.asGridCoord(3, y)] = true; }
            this.walls[utils.asGridCoord(2, 9)] = true;//树
            this.walls[utils.asGridCoord(1, 10)] = true;
            this.walls[utils.asGridCoord(1, 11)] = true;
            this.walls[utils.asGridCoord(1, 12)] = true;
            for (let y = 13; y <= 21; y++) { this.walls[utils.asGridCoord(0, y)] = true; }
            this.walls[utils.asGridCoord(1, 22)] = true;
            this.walls[utils.asGridCoord(1, 23)] = true;
            this.walls[utils.asGridCoord(1, 24)] = true;
            this.walls[utils.asGridCoord(1, 25)] = true;
            this.walls[utils.asGridCoord(2, 26)] = true;
            this.walls[utils.asGridCoord(2, 24)] = true;
            this.walls[utils.asGridCoord(3, 26)] = true;
            this.walls[utils.asGridCoord(3, 24)] = true;
            this.walls[utils.asGridCoord(4, 26)] = true;
            this.walls[utils.asGridCoord(5, 26)] = true;
            this.walls[utils.asGridCoord(6, 24)] = true;
            this.walls[utils.asGridCoord(6, 26)] = true;
            this.walls[utils.asGridCoord(6, 22)] = true;
            this.walls[utils.asGridCoord(7, 24)] = true;
            this.walls[utils.asGridCoord(7, 26)] = true;
            this.walls[utils.asGridCoord(7, 22)] = true;
            this.walls[utils.asGridCoord(8, 25)] = true;
            this.walls[utils.asGridCoord(8, 24)] = true;
            this.walls[utils.asGridCoord(8, 23)] = true;
            this.walls[utils.asGridCoord(8, 22)] = true;
            this.walls[utils.asGridCoord(9, 21)] = true;
            this.walls[utils.asGridCoord(9, 22)] = true;
            this.walls[utils.asGridCoord(9, 23)] = true;
            this.walls[utils.asGridCoord(9, 24)] = true;
            this.walls[utils.asGridCoord(10, 24)] = true;
            this.walls[utils.asGridCoord(11, 24)] = true;
            this.walls[utils.asGridCoord(12, 24)] = true;
            this.walls[utils.asGridCoord(13, 24)] = true;
            this.walls[utils.asGridCoord(14, 24)] = true;
            this.walls[utils.asGridCoord(15, 24)] = true;
            for (let y = 13; y >= 10; y--) { this.walls[utils.asGridCoord(21, y)] = true; }
            this.walls[utils.asGridCoord(22, 9)] = true;//树
            this.walls[utils.asGridCoord(23, 10)] = true;
            this.walls[utils.asGridCoord(23, 11)] = true;
            this.walls[utils.asGridCoord(23, 12)] = true;
            this.walls[utils.asGridCoord(2, 22)] = true;
            this.walls[utils.asGridCoord(3, 22)] = true;
            this.walls[utils.asGridCoord(2, 24)] = true;
            this.walls[utils.asGridCoord(3, 24)] = true;
            this.walls[utils.asGridCoord(15, 21)] = true;
            this.walls[utils.asGridCoord(15, 22)] = true;
            this.walls[utils.asGridCoord(15, 23)] = true;
            this.walls[utils.asGridCoord(16, 24)] = true;
            this.walls[utils.asGridCoord(23, 26)] = true;
            for (let x = 17; x < 23; x++) {
                this.walls[utils.asGridCoord(x, 24)] = true;
                this.walls[utils.asGridCoord(x, 25)] = true;
            }
            for (let y = 13; y < 27; y++) {
                this.walls[utils.asGridCoord(24, y)] = true;
            }
        }
        if (this.id === "Gate_night") {
            this.walls[utils.asGridCoord(10, 15)] = true;
            this.walls[utils.asGridCoord(14, 15)] = true;
            for (let x = 10; x >= 4; x--) { this.walls[utils.asGridCoord(x, 14)] = true; }
            for (let x = 14; x <= 20; x++) { this.walls[utils.asGridCoord(x, 14)] = true; }
            this.walls[utils.asGridCoord(12, 13)] = true;
            this.walls[utils.asGridCoord(11, 13)] = true;
            this.walls[utils.asGridCoord(13, 13)] = true;
            this.walls[utils.asGridCoord(7, 15)] = true;
            this.walls[utils.asGridCoord(6, 15)] = true;
            this.walls[utils.asGridCoord(17, 15)] = true;
            this.walls[utils.asGridCoord(18, 15)] = true;
            this.walls[utils.asGridCoord(18, 20)] = true;
            this.walls[utils.asGridCoord(19, 20)] = true;
            for (let y = 13; y >= 10; y--) { this.walls[utils.asGridCoord(3, y)] = true; }
            this.walls[utils.asGridCoord(2, 9)] = true;//树
            this.walls[utils.asGridCoord(1, 10)] = true;
            this.walls[utils.asGridCoord(1, 11)] = true;
            this.walls[utils.asGridCoord(1, 12)] = true;
            for (let y = 13; y <= 21; y++) { this.walls[utils.asGridCoord(0, y)] = true; }
            this.walls[utils.asGridCoord(1, 22)] = true;
            this.walls[utils.asGridCoord(1, 23)] = true;
            this.walls[utils.asGridCoord(1, 24)] = true;
            this.walls[utils.asGridCoord(1, 25)] = true;
            this.walls[utils.asGridCoord(2, 26)] = true;
            this.walls[utils.asGridCoord(2, 24)] = true;
            this.walls[utils.asGridCoord(3, 26)] = true;
            this.walls[utils.asGridCoord(3, 24)] = true;
            this.walls[utils.asGridCoord(4, 26)] = true;
            this.walls[utils.asGridCoord(5, 26)] = true;
            this.walls[utils.asGridCoord(6, 24)] = true;
            this.walls[utils.asGridCoord(6, 26)] = true;
            this.walls[utils.asGridCoord(6, 22)] = true;
            this.walls[utils.asGridCoord(7, 24)] = true;
            this.walls[utils.asGridCoord(7, 26)] = true;
            this.walls[utils.asGridCoord(7, 22)] = true;
            this.walls[utils.asGridCoord(8, 25)] = true;
            this.walls[utils.asGridCoord(8, 24)] = true;
            this.walls[utils.asGridCoord(8, 23)] = true;
            this.walls[utils.asGridCoord(8, 22)] = true;
            this.walls[utils.asGridCoord(9, 21)] = true;
            this.walls[utils.asGridCoord(9, 22)] = true;
            this.walls[utils.asGridCoord(9, 23)] = true;
            this.walls[utils.asGridCoord(9, 24)] = true;
            this.walls[utils.asGridCoord(10, 24)] = true;
            this.walls[utils.asGridCoord(11, 24)] = true;
            this.walls[utils.asGridCoord(12, 24)] = true;
            this.walls[utils.asGridCoord(13, 24)] = true;
            this.walls[utils.asGridCoord(14, 24)] = true;
            this.walls[utils.asGridCoord(15, 24)] = true;
            for (let y = 13; y >= 10; y--) { this.walls[utils.asGridCoord(21, y)] = true; }
            this.walls[utils.asGridCoord(22, 9)] = true;//树
            this.walls[utils.asGridCoord(23, 10)] = true;
            this.walls[utils.asGridCoord(23, 11)] = true;
            this.walls[utils.asGridCoord(23, 12)] = true;
            this.walls[utils.asGridCoord(2, 22)] = true;
            this.walls[utils.asGridCoord(3, 22)] = true;
            this.walls[utils.asGridCoord(2, 24)] = true;
            this.walls[utils.asGridCoord(3, 24)] = true;
            this.walls[utils.asGridCoord(15, 21)] = true;
            this.walls[utils.asGridCoord(15, 22)] = true;
            this.walls[utils.asGridCoord(15, 23)] = true;
            this.walls[utils.asGridCoord(16, 24)] = true;
            this.walls[utils.asGridCoord(23, 26)] = true;
            for (let x = 17; x < 23; x++) {
                this.walls[utils.asGridCoord(x, 24)] = true;
                this.walls[utils.asGridCoord(x, 25)] = true;
            }
            for (let y = 13; y < 27; y++) {
                this.walls[utils.asGridCoord(24, y)] = true;
            }
        }
        if (this.id === "third_Gallery") {
            this.walls[utils.asGridCoord(5, 10)] = true;
            this.walls[utils.asGridCoord(5, 9)] = true;
            this.walls[utils.asGridCoord(5, 8)] = true;
            for (let y = 10; y >= 6; y--) { this.walls[utils.asGridCoord(2, y)] = true; }
            for (let x = 3; x <= 24; x++) { this.walls[utils.asGridCoord(x, 5)] = true; }
            for (let y = 5; y <= 7; y++) { this.walls[utils.asGridCoord(26, y)] = true; }
            for (let x = 25; x >= 5; x--) { this.walls[utils.asGridCoord(x, 8)] = true; }
            this.walls[utils.asGridCoord(25, 4)] = true;
        }
        if (this.id === "WomenRoom") {
            this.walls[utils.asGridCoord(5, 12)] = true;
            this.walls[utils.asGridCoord(5, 11)] = true;
            this.walls[utils.asGridCoord(5, 10)] = true;
            this.walls[utils.asGridCoord(5, 9)] = true;
            this.walls[utils.asGridCoord(4, 9)] = true;
            this.walls[utils.asGridCoord(3, 9)] = true;
            this.walls[utils.asGridCoord(2, 9)] = true;
            this.walls[utils.asGridCoord(2, 8)] = true;
            this.walls[utils.asGridCoord(2, 7)] = true;
            this.walls[utils.asGridCoord(2, 6)] = true;
            this.walls[utils.asGridCoord(2, 5)] = true;
            this.walls[utils.asGridCoord(2, 4)] = true;
            this.walls[utils.asGridCoord(2, 3)] = true;
            this.walls[utils.asGridCoord(3, 5)] = true;
            this.walls[utils.asGridCoord(4, 5)] = true;
            this.walls[utils.asGridCoord(5, 5)] = true;
            this.walls[utils.asGridCoord(6, 5)] = true;
            this.walls[utils.asGridCoord(7, 5)] = true;
            this.walls[utils.asGridCoord(8, 5)] = true;
            this.walls[utils.asGridCoord(9, 5)] = true;
            this.walls[utils.asGridCoord(10, 5)] = true;
            this.walls[utils.asGridCoord(10, 6)] = true;
            this.walls[utils.asGridCoord(10, 7)] = true;
            this.walls[utils.asGridCoord(10, 8)] = true;
            this.walls[utils.asGridCoord(10, 9)] = true;
            this.walls[utils.asGridCoord(9, 8)] = true;
            this.walls[utils.asGridCoord(8, 8)] = true;
            this.walls[utils.asGridCoord(7, 9)] = true;
            this.walls[utils.asGridCoord(7, 10)] = true;
            this.walls[utils.asGridCoord(7, 11)] = true;
            this.walls[utils.asGridCoord(7, 12)] = true;
            this.walls[utils.asGridCoord(6, 13)] = true;

        }
        if (this.id === "ER_hallway") {
            this.walls[utils.asGridCoord(2, 4)] = true;
            this.walls[utils.asGridCoord(2, 5)] = true;
            this.walls[utils.asGridCoord(2, 6)] = true;
            this.walls[utils.asGridCoord(2, 7)] = true;
            this.walls[utils.asGridCoord(2, 8)] = true;
            this.walls[utils.asGridCoord(2, 9)] = true;
            this.walls[utils.asGridCoord(2, 10)] = true;
            this.walls[utils.asGridCoord(3, 11)] = true;
            this.walls[utils.asGridCoord(4, 11)] = true;
            this.walls[utils.asGridCoord(5, 8)] = true;
            this.walls[utils.asGridCoord(5, 9)] = true;
            this.walls[utils.asGridCoord(5, 10)] = true;
            this.walls[utils.asGridCoord(6, 8)] = true;
            for (let x = 6; x < 27; x++) {
                this.walls[utils.asGridCoord(x, 8)] = true;
            }
            for (let y = 7; y > 2; y--) {
                this.walls[utils.asGridCoord(26, y)] = true;
            }
            for (let x = 4; x < 26; x++) {
                if (x == 15) {
                    continue;
                }
                this.walls[utils.asGridCoord(x, 5)] = true;
            }
            this.walls[utils.asGridCoord(3, 3)] = true;
            this.walls[utils.asGridCoord(3, 4)] = true;
            this.walls[utils.asGridCoord(15, 4)] = true;
        }
        if (this.id === "Home") {
            this.walls[utils.asGridCoord(10, 16)] = true;
            for (let y = 15; y > 8; y--) {
                this.walls[utils.asGridCoord(9, y)] = true;
            }
            this.walls[utils.asGridCoord(8, 9)] = true;
            this.walls[utils.asGridCoord(8, 10)] = true;
            this.walls[utils.asGridCoord(7, 10)] = true;
            this.walls[utils.asGridCoord(6, 10)] = true;
            this.walls[utils.asGridCoord(5, 10)] = true;
            this.walls[utils.asGridCoord(5, 9)] = true;
            this.walls[utils.asGridCoord(4, 9)] = true;
            this.walls[utils.asGridCoord(4, 8)] = true;
            this.walls[utils.asGridCoord(4, 7)] = true;
            this.walls[utils.asGridCoord(4, 6)] = true;
            this.walls[utils.asGridCoord(5, 6)] = true;
            this.walls[utils.asGridCoord(6, 6)] = true;
            this.walls[utils.asGridCoord(6, 5)] = true;
            this.walls[utils.asGridCoord(7, 4)] = true;
            this.walls[utils.asGridCoord(8, 5)] = true;
            this.walls[utils.asGridCoord(8, 6)] = true;
            this.walls[utils.asGridCoord(8, 7)] = true;
            this.walls[utils.asGridCoord(9, 5)] = true;
            this.walls[utils.asGridCoord(10, 5)] = true;
            this.walls[utils.asGridCoord(10, 6)] = true;
            this.walls[utils.asGridCoord(11, 5)] = true;
            this.walls[utils.asGridCoord(12, 5)] = true;
            this.walls[utils.asGridCoord(12, 6)] = true;
            this.walls[utils.asGridCoord(12, 7)] = true;
            this.walls[utils.asGridCoord(13, 4)] = true;
            this.walls[utils.asGridCoord(14, 4)] = true;
            this.walls[utils.asGridCoord(14, 5)] = true;
            this.walls[utils.asGridCoord(15, 5)] = true;
            this.walls[utils.asGridCoord(15, 6)] = true;
            this.walls[utils.asGridCoord(16, 7)] = true;
            this.walls[utils.asGridCoord(16, 8)] = true;
            this.walls[utils.asGridCoord(16, 9)] = true;
            this.walls[utils.asGridCoord(16, 10)] = true;
            this.walls[utils.asGridCoord(15, 9)] = true;
            this.walls[utils.asGridCoord(14, 9)] = true;
            this.walls[utils.asGridCoord(14, 10)] = true;
            this.walls[utils.asGridCoord(13, 11)] = true;
            this.walls[utils.asGridCoord(12, 10)] = true;
            this.walls[utils.asGridCoord(12, 9)] = true;
            this.walls[utils.asGridCoord(11, 9)] = true;
            for (let y = 10; y < 16; y++) {
                this.walls[utils.asGridCoord(11, y)] = true;
            }
        }
        if (this.id === "WomenRoom_black") {
            this.walls[utils.asGridCoord(5, 12)] = true;
            this.walls[utils.asGridCoord(5, 11)] = true;
            this.walls[utils.asGridCoord(5, 10)] = true;
            this.walls[utils.asGridCoord(5, 9)] = true;
            this.walls[utils.asGridCoord(4, 9)] = true;
            this.walls[utils.asGridCoord(3, 9)] = true;
            this.walls[utils.asGridCoord(2, 9)] = true;
            this.walls[utils.asGridCoord(2, 8)] = true;
            this.walls[utils.asGridCoord(2, 7)] = true;
            this.walls[utils.asGridCoord(2, 6)] = true;
            this.walls[utils.asGridCoord(2, 5)] = true;
            this.walls[utils.asGridCoord(2, 4)] = true;
            this.walls[utils.asGridCoord(2, 3)] = true;
            this.walls[utils.asGridCoord(3, 4)] = true;
            this.walls[utils.asGridCoord(4, 5)] = true;
            this.walls[utils.asGridCoord(5, 5)] = true;
            this.walls[utils.asGridCoord(6, 5)] = true;
            this.walls[utils.asGridCoord(7, 5)] = true;
            this.walls[utils.asGridCoord(8, 4)] = true;
            this.walls[utils.asGridCoord(9, 5)] = true;
            this.walls[utils.asGridCoord(10, 5)] = true;
            this.walls[utils.asGridCoord(10, 6)] = true;
            this.walls[utils.asGridCoord(10, 7)] = true;
            this.walls[utils.asGridCoord(10, 8)] = true;
            this.walls[utils.asGridCoord(10, 9)] = true;
            this.walls[utils.asGridCoord(9, 8)] = true;
            this.walls[utils.asGridCoord(8, 8)] = true;
            this.walls[utils.asGridCoord(7, 9)] = true;
            this.walls[utils.asGridCoord(7, 10)] = true;
            this.walls[utils.asGridCoord(7, 11)] = true;
            this.walls[utils.asGridCoord(7, 12)] = true;
            this.walls[utils.asGridCoord(6, 13)] = true;
        }
        if (this.id === "day_background") {
            for (let y = 24; y < 36; y++) {
                this.walls[utils.asGridCoord(2, y)] = true;
            }
            for (let x = 3; x < 5; x++) {
                this.walls[utils.asGridCoord(x, 35)] = true;
            }
            this.walls[utils.asGridCoord(6, 36)] = true;
            this.walls[utils.asGridCoord(7, 35)] = true;
            this.walls[utils.asGridCoord(7, 34)] = true;
            this.walls[utils.asGridCoord(8, 34)] = true;
            this.walls[utils.asGridCoord(9, 34)] = true;
            this.walls[utils.asGridCoord(10, 34)] = true;
            this.walls[utils.asGridCoord(11, 34)] = true;
            for (let x = 11; x < 34; x++) {
                this.walls[utils.asGridCoord(x, 36)] = true;
            }
            for (let i = 0; i < 3; i++) {
                this.walls[utils.asGridCoord(14 + i, 35)] = true;
            }
            for (let i = 0; i < 3; i++) {
                this.walls[utils.asGridCoord(21 + i, 35)] = true;
            }
            for (let i = 0; i < 3; i++) {
                this.walls[utils.asGridCoord(28 + i, 35)] = true;
            }
            for (let y = 35; y > 22; y--) {
                this.walls[utils.asGridCoord(33, y)] = true;
            }
            for (let x = 2; x < 33; x++) {
                if (x >= 10 && x <= 12) {
                    continue;
                }
                if (x == 18 || x == 20 || x == 23 || x == 25 || x == 28 || x == 30) {
                    continue;
                }
                this.walls[utils.asGridCoord(x, 24)] = true;
            }
            this.walls[utils.asGridCoord(9, 25)] = true;
            this.walls[utils.asGridCoord(13, 25)] = true;
            this.walls[utils.asGridCoord(13, 25)] = true;
            this.walls[utils.asGridCoord(6, 26)] = true;
            this.walls[utils.asGridCoord(10, 32)] = true;
            this.walls[utils.asGridCoord(20, 28)] = true;
            this.walls[utils.asGridCoord(25, 33)] = true;
            this.walls[utils.asGridCoord(6, 35)] = true;
            this.walls[utils.asGridCoord(5, 35)] = true;
            this.walls[utils.asGridCoord(11, 35)] = true;
            for (let x = 27; x < 33; x++) {
                this.walls[utils.asGridCoord(x, 32)] = true;
            }
            for (let x = 27; x < 33; x++) {
                this.walls[utils.asGridCoord(x, 26)] = true;
            }
            for (let y = 31; y > 25; y--) {
                this.walls[utils.asGridCoord(27, y)] = true;
            }
            for (let x = 10; x < 13; x++) {
                this.walls[utils.asGridCoord(x, 23)] = true;
            }
            for (let x = 2; x < 33; x++) {
                this.walls[utils.asGridCoord(x, 23)] = true;
            }
        }
        if (this.id === "night_background") {
            for (let y = 24; y < 36; y++) {
                this.walls[utils.asGridCoord(2, y)] = true;
            }
            for (let x = 3; x < 5; x++) {
                this.walls[utils.asGridCoord(x, 35)] = true;
            }
            this.walls[utils.asGridCoord(6, 36)] = true;
            this.walls[utils.asGridCoord(7, 35)] = true;
            this.walls[utils.asGridCoord(7, 34)] = true;
            this.walls[utils.asGridCoord(8, 34)] = true;
            this.walls[utils.asGridCoord(9, 34)] = true;
            this.walls[utils.asGridCoord(10, 34)] = true;
            this.walls[utils.asGridCoord(11, 34)] = true;
            for (let x = 11; x < 34; x++) {
                this.walls[utils.asGridCoord(x, 36)] = true;
            }
            for (let i = 0; i < 3; i++) {
                this.walls[utils.asGridCoord(14 + i, 35)] = true;
            }
            for (let i = 0; i < 3; i++) {
                this.walls[utils.asGridCoord(21 + i, 35)] = true;
            }
            for (let i = 0; i < 3; i++) {
                this.walls[utils.asGridCoord(28 + i, 35)] = true;
            }
            for (let y = 35; y > 22; y--) {
                this.walls[utils.asGridCoord(33, y)] = true;
            }
            for (let x = 2; x < 33; x++) {
                if (x >= 10 && x <= 12) {
                    continue;
                }
                if (x == 18 || x == 20 || x == 23 || x == 25 || x == 28 || x == 30) {
                    continue;
                }
                this.walls[utils.asGridCoord(x, 24)] = true;
            }
            this.walls[utils.asGridCoord(9, 25)] = true;
            this.walls[utils.asGridCoord(13, 25)] = true;
            this.walls[utils.asGridCoord(13, 25)] = true;
            // this.walls[utils.asGridCoord(6, 26)] = true;
            // this.walls[utils.asGridCoord(10, 32)] = true;
            // this.walls[utils.asGridCoord(20, 28)] = true;
            // this.walls[utils.asGridCoord(25, 33)] = true;
            this.walls[utils.asGridCoord(6, 35)] = true;
            this.walls[utils.asGridCoord(5, 35)] = true;
            this.walls[utils.asGridCoord(11, 35)] = true;
            for (let x = 27; x < 33; x++) {
                this.walls[utils.asGridCoord(x, 32)] = true;
            }
            for (let x = 27; x < 33; x++) {
                this.walls[utils.asGridCoord(x, 26)] = true;
            }
            for (let y = 31; y > 25; y--) {
                this.walls[utils.asGridCoord(27, y)] = true;
            }
            for (let x = 10; x < 13; x++) {
                this.walls[utils.asGridCoord(x, 23)] = true;
            }
            for (let x = 2; x < 33; x++) {
                this.walls[utils.asGridCoord(x, 23)] = true;
            }
        }
        if (this.id === "maze") {
            1
            this.walls[utils.asGridCoord(2, 5)] = true;
            this.walls[utils.asGridCoord(32, 5)] = true;
            for (let x = 2; x < 31; x++) {
                this.walls[utils.asGridCoord(x, 4)] = true;
            }
            for (let y = 6; y < 22; y++) {
                this.walls[utils.asGridCoord(3, y)] = true;
            }
            for (let x = 4; x < 32; x++) {
                this.walls[utils.asGridCoord(x, 22)] = true;
            }
            for (let y = 20; y > 4; y--) {
                this.walls[utils.asGridCoord(31, y)] = true;
            }
            for (let y = 6; y < 22; y++) {
                this.walls[utils.asGridCoord(3, y)] = true;
            }
            this.walls[utils.asGridCoord(4, 6)] = true;
            this.walls[utils.asGridCoord(4, 7)] = true;
            this.walls[utils.asGridCoord(4, 9)] = true;
            this.walls[utils.asGridCoord(4, 10)] = true;
            this.walls[utils.asGridCoord(4, 15)] = true;
            this.walls[utils.asGridCoord(4, 16)] = true;
            this.walls[utils.asGridCoord(4, 18)] = true;
            this.walls[utils.asGridCoord(4, 19)] = true;
            this.walls[utils.asGridCoord(5, 6)] = true;
            this.walls[utils.asGridCoord(5, 7)] = true;
            this.walls[utils.asGridCoord(5, 9)] = true;
            this.walls[utils.asGridCoord(5, 10)] = true;
            this.walls[utils.asGridCoord(5, 11)] = true;
            this.walls[utils.asGridCoord(5, 12)] = true;
            this.walls[utils.asGridCoord(5, 13)] = true;
            this.walls[utils.asGridCoord(5, 15)] = true;
            this.walls[utils.asGridCoord(5, 16)] = true;
            this.walls[utils.asGridCoord(5, 18)] = true;
            this.walls[utils.asGridCoord(5, 19)] = true;
            this.walls[utils.asGridCoord(5, 20)] = true;
            this.walls[utils.asGridCoord(6, 12)] = true;
            this.walls[utils.asGridCoord(6, 13)] = true;
            this.walls[utils.asGridCoord(6, 15)] = true;
            this.walls[utils.asGridCoord(6, 16)] = true;
            this.walls[utils.asGridCoord(6, 18)] = true;
            this.walls[utils.asGridCoord(6, 19)] = true;
            this.walls[utils.asGridCoord(6, 20)] = true;
            this.walls[utils.asGridCoord(7, 5)] = true;
            this.walls[utils.asGridCoord(7, 6)] = true;
            this.walls[utils.asGridCoord(7, 7)] = true;
            this.walls[utils.asGridCoord(7, 9)] = true;
            this.walls[utils.asGridCoord(7, 10)] = true;
            this.walls[utils.asGridCoord(7, 12)] = true;
            this.walls[utils.asGridCoord(7, 13)] = true;
            this.walls[utils.asGridCoord(7, 15)] = true;
            this.walls[utils.asGridCoord(7, 16)] = true;
            this.walls[utils.asGridCoord(8, 6)] = true;
            this.walls[utils.asGridCoord(8, 7)] = true;
            this.walls[utils.asGridCoord(8, 9)] = true;
            this.walls[utils.asGridCoord(8, 10)] = true;
            this.walls[utils.asGridCoord(8, 12)] = true;
            this.walls[utils.asGridCoord(8, 13)] = true;
            this.walls[utils.asGridCoord(8, 15)] = true;
            this.walls[utils.asGridCoord(8, 16)] = true;
            this.walls[utils.asGridCoord(8, 18)] = true;
            this.walls[utils.asGridCoord(8, 19)] = true;
            this.walls[utils.asGridCoord(8, 20)] = true;
            this.walls[utils.asGridCoord(8, 21)] = true;
            this.walls[utils.asGridCoord(9, 6)] = true;
            this.walls[utils.asGridCoord(9, 7)] = true;
            this.walls[utils.asGridCoord(9, 8)] = true;
            this.walls[utils.asGridCoord(9, 9)] = true;
            this.walls[utils.asGridCoord(9, 10)] = true;
            this.walls[utils.asGridCoord(9, 12)] = true;
            this.walls[utils.asGridCoord(9, 13)] = true;
            this.walls[utils.asGridCoord(9, 15)] = true;
            this.walls[utils.asGridCoord(9, 16)] = true;
            this.walls[utils.asGridCoord(9, 18)] = true;
            this.walls[utils.asGridCoord(9, 19)] = true;
            this.walls[utils.asGridCoord(10, 12)] = true;
            this.walls[utils.asGridCoord(10, 13)] = true;
            this.walls[utils.asGridCoord(10, 18)] = true;
            this.walls[utils.asGridCoord(10, 19)] = true;
            this.walls[utils.asGridCoord(10, 20)] = true;
            this.walls[utils.asGridCoord(11, 6)] = true;
            this.walls[utils.asGridCoord(11, 7)] = true;
            this.walls[utils.asGridCoord(11, 8)] = true;
            this.walls[utils.asGridCoord(11, 10)] = true;
            this.walls[utils.asGridCoord(11, 11)] = true;
            this.walls[utils.asGridCoord(11, 12)] = true;
            this.walls[utils.asGridCoord(11, 13)] = true;
            this.walls[utils.asGridCoord(11, 14)] = true;
            this.walls[utils.asGridCoord(11, 15)] = true;
            this.walls[utils.asGridCoord(11, 16)] = true;
            this.walls[utils.asGridCoord(11, 18)] = true;
            this.walls[utils.asGridCoord(11, 19)] = true;
            this.walls[utils.asGridCoord(11, 20)] = true;
            this.walls[utils.asGridCoord(12, 6)] = true;
            this.walls[utils.asGridCoord(12, 7)] = true;
            this.walls[utils.asGridCoord(12, 12)] = true;
            this.walls[utils.asGridCoord(12, 13)] = true;
            this.walls[utils.asGridCoord(13, 6)] = true;
            this.walls[utils.asGridCoord(13, 7)] = true;
            this.walls[utils.asGridCoord(13, 8)] = true;
            this.walls[utils.asGridCoord(13, 9)] = true;
            this.walls[utils.asGridCoord(13, 10)] = true;
            this.walls[utils.asGridCoord(13, 21)] = true;
            this.walls[utils.asGridCoord(13, 12)] = true;
            this.walls[utils.asGridCoord(13, 13)] = true;
            this.walls[utils.asGridCoord(13, 15)] = true;
            this.walls[utils.asGridCoord(13, 16)] = true;
            this.walls[utils.asGridCoord(13, 17)] = true;
            this.walls[utils.asGridCoord(13, 18)] = true;
            this.walls[utils.asGridCoord(13, 19)] = true;
            this.walls[utils.asGridCoord(13, 20)] = true;
            this.walls[utils.asGridCoord(14, 6)] = true;
            this.walls[utils.asGridCoord(14, 7)] = true;
            this.walls[utils.asGridCoord(14, 15)] = true;
            this.walls[utils.asGridCoord(14, 16)] = true;
            this.walls[utils.asGridCoord(15, 6)] = true;
            this.walls[utils.asGridCoord(15, 7)] = true;
            this.walls[utils.asGridCoord(15, 9)] = true;
            this.walls[utils.asGridCoord(15, 10)] = true;
            this.walls[utils.asGridCoord(15, 11)] = true;
            this.walls[utils.asGridCoord(15, 12)] = true;
            this.walls[utils.asGridCoord(15, 13)] = true;
            this.walls[utils.asGridCoord(15, 15)] = true;
            this.walls[utils.asGridCoord(15, 16)] = true;
            this.walls[utils.asGridCoord(15, 18)] = true;
            this.walls[utils.asGridCoord(15, 19)] = true;
            this.walls[utils.asGridCoord(15, 20)] = true;
            this.walls[utils.asGridCoord(16, 6)] = true;
            this.walls[utils.asGridCoord(16, 7)] = true;
            this.walls[utils.asGridCoord(16, 12)] = true;
            this.walls[utils.asGridCoord(16, 13)] = true;
            this.walls[utils.asGridCoord(16, 15)] = true;
            this.walls[utils.asGridCoord(16, 16)] = true;
            this.walls[utils.asGridCoord(16, 19)] = true;
            this.walls[utils.asGridCoord(16, 20)] = true;
            this.walls[utils.asGridCoord(17, 6)] = true;
            this.walls[utils.asGridCoord(17, 7)] = true;
            this.walls[utils.asGridCoord(17, 9)] = true;
            this.walls[utils.asGridCoord(17, 10)] = true;
            this.walls[utils.asGridCoord(17, 11)] = true;
            this.walls[utils.asGridCoord(17, 12)] = true;
            this.walls[utils.asGridCoord(17, 13)] = true;
            this.walls[utils.asGridCoord(17, 15)] = true;
            this.walls[utils.asGridCoord(17, 16)] = true;
            this.walls[utils.asGridCoord(17, 17)] = true;
            this.walls[utils.asGridCoord(17, 19)] = true;
            this.walls[utils.asGridCoord(17, 20)] = true;
            this.walls[utils.asGridCoord(18, 6)] = true;
            this.walls[utils.asGridCoord(18, 7)] = true;
            this.walls[utils.asGridCoord(18, 12)] = true;
            this.walls[utils.asGridCoord(18, 13)] = true;
            this.walls[utils.asGridCoord(18, 16)] = true;
            this.walls[utils.asGridCoord(18, 17)] = true;
            this.walls[utils.asGridCoord(18, 19)] = true;
            this.walls[utils.asGridCoord(18, 20)] = true;
            this.walls[utils.asGridCoord(19, 6)] = true;
            this.walls[utils.asGridCoord(19, 7)] = true;
            this.walls[utils.asGridCoord(19, 9)] = true;
            this.walls[utils.asGridCoord(19, 10)] = true;
            this.walls[utils.asGridCoord(19, 12)] = true;
            this.walls[utils.asGridCoord(19, 13)] = true;
            this.walls[utils.asGridCoord(19, 14)] = true;
            this.walls[utils.asGridCoord(19, 16)] = true;
            this.walls[utils.asGridCoord(19, 17)] = true;
            this.walls[utils.asGridCoord(19, 19)] = true;
            this.walls[utils.asGridCoord(19, 20)] = true;
            this.walls[utils.asGridCoord(20, 5)] = true;
            this.walls[utils.asGridCoord(20, 6)] = true;
            this.walls[utils.asGridCoord(20, 7)] = true;
            this.walls[utils.asGridCoord(20, 9)] = true;
            this.walls[utils.asGridCoord(20, 10)] = true;
            this.walls[utils.asGridCoord(20, 12)] = true;
            this.walls[utils.asGridCoord(20, 13)] = true;
            this.walls[utils.asGridCoord(20, 16)] = true;
            this.walls[utils.asGridCoord(20, 17)] = true;
            this.walls[utils.asGridCoord(20, 19)] = true;
            this.walls[utils.asGridCoord(20, 20)] = true;
            this.walls[utils.asGridCoord(21, 6)] = true;
            this.walls[utils.asGridCoord(21, 7)] = true;
            this.walls[utils.asGridCoord(21, 9)] = true;
            this.walls[utils.asGridCoord(21, 10)] = true;
            this.walls[utils.asGridCoord(21, 12)] = true;
            this.walls[utils.asGridCoord(21, 13)] = true;
            this.walls[utils.asGridCoord(21, 15)] = true;
            this.walls[utils.asGridCoord(21, 16)] = true;
            this.walls[utils.asGridCoord(21, 17)] = true;
            this.walls[utils.asGridCoord(21, 19)] = true;
            this.walls[utils.asGridCoord(21, 20)] = true;
            this.walls[utils.asGridCoord(22, 9)] = true;
            this.walls[utils.asGridCoord(22, 12)] = true;
            this.walls[utils.asGridCoord(22, 13)] = true;
            this.walls[utils.asGridCoord(22, 15)] = true;
            this.walls[utils.asGridCoord(22, 16)] = true;
            this.walls[utils.asGridCoord(22, 17)] = true;
            this.walls[utils.asGridCoord(22, 19)] = true;
            this.walls[utils.asGridCoord(23, 5)] = true;
            this.walls[utils.asGridCoord(23, 6)] = true;
            this.walls[utils.asGridCoord(23, 7)] = true;
            this.walls[utils.asGridCoord(23, 8)] = true;
            this.walls[utils.asGridCoord(23, 9)] = true;
            this.walls[utils.asGridCoord(23, 10)] = true;
            this.walls[utils.asGridCoord(23, 19)] = true;
            this.walls[utils.asGridCoord(23, 20)] = true;
            this.walls[utils.asGridCoord(24, 12)] = true;
            this.walls[utils.asGridCoord(24, 13)] = true;
            this.walls[utils.asGridCoord(24, 14)] = true;
            this.walls[utils.asGridCoord(24, 16)] = true;
            this.walls[utils.asGridCoord(24, 17)] = true;
            this.walls[utils.asGridCoord(24, 19)] = true;
            this.walls[utils.asGridCoord(24, 20)] = true;
            this.walls[utils.asGridCoord(25, 5)] = true;
            this.walls[utils.asGridCoord(25, 7)] = true;
            this.walls[utils.asGridCoord(25, 8)] = true;
            this.walls[utils.asGridCoord(25, 9)] = true;
            this.walls[utils.asGridCoord(25, 10)] = true;
            this.walls[utils.asGridCoord(25, 11)] = true;
            this.walls[utils.asGridCoord(25, 12)] = true;
            this.walls[utils.asGridCoord(25, 13)] = true;
            this.walls[utils.asGridCoord(25, 14)] = true;
            this.walls[utils.asGridCoord(25, 16)] = true;
            this.walls[utils.asGridCoord(25, 17)] = true;
            this.walls[utils.asGridCoord(25, 19)] = true;
            this.walls[utils.asGridCoord(25, 20)] = true;
            this.walls[utils.asGridCoord(26, 9)] = true;
            this.walls[utils.asGridCoord(26, 10)] = true;
            this.walls[utils.asGridCoord(26, 12)] = true;
            this.walls[utils.asGridCoord(26, 13)] = true;
            this.walls[utils.asGridCoord(26, 15)] = true;
            this.walls[utils.asGridCoord(26, 14)] = true;
            this.walls[utils.asGridCoord(26, 16)] = true;
            this.walls[utils.asGridCoord(26, 17)] = true;
            this.walls[utils.asGridCoord(26, 19)] = true;
            this.walls[utils.asGridCoord(26, 20)] = true;
            this.walls[utils.asGridCoord(27, 6)] = true;
            this.walls[utils.asGridCoord(27, 7)] = true;
            this.walls[utils.asGridCoord(27, 9)] = true;
            this.walls[utils.asGridCoord(27, 10)] = true;
            this.walls[utils.asGridCoord(27, 19)] = true;
            this.walls[utils.asGridCoord(27, 20)] = true;
            this.walls[utils.asGridCoord(28, 6)] = true;
            this.walls[utils.asGridCoord(28, 7)] = true;
            this.walls[utils.asGridCoord(28, 8)] = true;
            this.walls[utils.asGridCoord(28, 9)] = true;
            this.walls[utils.asGridCoord(28, 10)] = true;
            this.walls[utils.asGridCoord(28, 11)] = true;
            this.walls[utils.asGridCoord(28, 12)] = true;
            this.walls[utils.asGridCoord(28, 13)] = true;
            this.walls[utils.asGridCoord(28, 15)] = true;
            this.walls[utils.asGridCoord(28, 16)] = true;
            this.walls[utils.asGridCoord(28, 19)] = true;
            this.walls[utils.asGridCoord(28, 20)] = true;
            this.walls[utils.asGridCoord(29, 6)] = true;
            this.walls[utils.asGridCoord(29, 7)] = true;
            this.walls[utils.asGridCoord(29, 12)] = true;
            this.walls[utils.asGridCoord(29, 13)] = true;
            this.walls[utils.asGridCoord(29, 15)] = true;
            this.walls[utils.asGridCoord(29, 16)] = true;
            this.walls[utils.asGridCoord(29, 17)] = true;
            this.walls[utils.asGridCoord(29, 19)] = true;
            this.walls[utils.asGridCoord(29, 20)] = true;
            this.walls[utils.asGridCoord(30, 9)] = true;
            this.walls[utils.asGridCoord(30, 10)] = true;
            this.walls[utils.asGridCoord(30, 12)] = true;
            this.walls[utils.asGridCoord(30, 13)] = true;
            this.walls[utils.asGridCoord(30, 15)] = true;
            this.walls[utils.asGridCoord(30, 16)] = true;
            this.walls[utils.asGridCoord(30, 19)] = true;
            this.walls[utils.asGridCoord(30, 20)] = true;
        }
    }
}

window.OverworldMaps = {
    ending: {
        id: "ending",
        lowerSrc: "./asset/map/ending.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(10),
                y: utils.withGrid(6),
                isPlayerControlled: true,
            }),
        },
    },
    StudyRoom: {
        id: "StudyRoom",
        lowerSrc: "./asset/map/自习室.png",
        // lowerSrc: "./asset/DiningRoomLower.png",
        // useUpper: true,
        // upperSrc: "./asset/DiningRoomUpper.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(14),
                y: utils.withGrid(19),
                isPlayerControlled: true,
            }),
        },
        cutSceneSpaces: {
            [utils.asGridCoord(15, 19)]: [
                {
                    required: ["survived"],
                    events: [
                        { type: "textMessage", text: "夜深了，找个没人的位置自习吧" },
                        { type: "walk", who: "player", direction: "left" }
                    ]
                },
                {
                    events: [
                        { type: "changeMap", map: "Library", position: { x: utils.withGrid(3), y: utils.withGrid(19), direction: "right" } },
                    ]
                },

            ],
            [utils.asGridCoord(13, 5)]: [
                {
                    required: ["survived", "检测"],
                    events: [
                        { type: "changeMap", map: "day_background", position: { x: utils.withGrid(11), y: utils.withGrid(24), direction: "down" } },
                        { type: "deleteStoryFlag", flag: "检测" },
                        { type: "addStoryFlag", flag: "sb" },
                        { type: "deleteStoryFlag", flag: "survived" },
                        { type: "sleep" },
                        { type: "textMessage", text: "我：在自习室睡得真不舒服。", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：还得是回宿舍补个觉", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：爽！", head_src: "asset/player_head.png" },
                    ]
                },
                {
                    required: ["survived"],
                    events: [
                        { type: "changeMap", map: "day_background", position: { x: utils.withGrid(11), y: utils.withGrid(24), direction: "down" } },
                        { type: "deleteStoryFlag", flag: "检测" },
                        { type: "addStoryFlag", flag: "sb" },
                        { type: "deleteStoryFlag", flag: "survived" },
                        { type: "gameover2" },
                        { type: "textMessage", text: "我：在自习室睡得真不舒服。", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：还得是回宿舍补个觉", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：爽！", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：诶，怎么今天日期没有变化呢？", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：我是忘记了什么重要的事情了吗？", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意" },
                    ]
                }
            ],
            [utils.asGridCoord(4, 11)]: [
                {
                    required: ["survived", "检测"],
                    events: [
                        { type: "changeMap", map: "day_background", position: { x: utils.withGrid(11), y: utils.withGrid(24), direction: "down" } },
                        { type: "deleteStoryFlag", flag: "检测" },
                        { type: "addStoryFlag", flag: "sb" },
                        { type: "deleteStoryFlag", flag: "survived" },
                        { type: "sleep" },
                        { type: "textMessage", text: "我：在自习室睡得真不舒服。", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：还得是回宿舍补个觉", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：爽！", head_src: "asset/player_head.png" },
                    ]
                },
                {
                    required: ["survived"],
                    events: [
                        { type: "changeMap", map: "day_background", position: { x: utils.withGrid(11), y: utils.withGrid(24), direction: "down" } },
                        { type: "deleteStoryFlag", flag: "检测" },
                        { type: "addStoryFlag", flag: "sb" },
                        { type: "deleteStoryFlag", flag: "survived" },
                        { type: "gameover2" },
                        { type: "textMessage", text: "我：在自习室睡得真不舒服。", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：还得是回宿舍补个觉", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：爽！", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：诶，怎么今天日期没有变化呢？", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：我是忘记了什么重要的事情了吗？", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意" },
                    ]
                }
            ],
            [utils.asGridCoord(6, 11)]: [
                {
                    required: ["survived", "检测"],
                    events: [
                        { type: "changeMap", map: "day_background", position: { x: utils.withGrid(11), y: utils.withGrid(24), direction: "down" } },
                        { type: "deleteStoryFlag", flag: "检测" },
                        { type: "addStoryFlag", flag: "sb" },
                        { type: "deleteStoryFlag", flag: "survived" },
                        { type: "sleep" },
                        { type: "textMessage", text: "我：在自习室睡得真不舒服。", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：还得是回宿舍补个觉", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：爽！", head_src: "asset/player_head.png" },
                    ]
                },
                {
                    required: ["survived"],
                    events: [
                        { type: "changeMap", map: "day_background", position: { x: utils.withGrid(11), y: utils.withGrid(24), direction: "down" } },
                        { type: "deleteStoryFlag", flag: "检测" },
                        { type: "addStoryFlag", flag: "sb" },
                        { type: "deleteStoryFlag", flag: "survived" },
                        { type: "gameover2" },
                        { type: "textMessage", text: "我：在自习室睡得真不舒服。", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：还得是回宿舍补个觉", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：爽！", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：诶，怎么今天日期没有变化呢？", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：我是忘记了什么重要的事情了吗？", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意" },
                    ]
                }
            ],
            [utils.asGridCoord(12, 11)]: [
                {
                    required: ["survived", "检测"],
                    events: [
                        { type: "changeMap", map: "day_background", position: { x: utils.withGrid(11), y: utils.withGrid(24), direction: "down" } },
                        { type: "deleteStoryFlag", flag: "检测" },
                        { type: "addStoryFlag", flag: "sb" },
                        { type: "deleteStoryFlag", flag: "survived" },
                        { type: "sleep" },
                        { type: "textMessage", text: "我：在自习室睡得真不舒服。", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：还得是回宿舍补个觉", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：爽！", head_src: "asset/player_head.png" },
                    ]
                },
                {
                    required: ["survived"],
                    events: [
                        { type: "changeMap", map: "day_background", position: { x: utils.withGrid(11), y: utils.withGrid(24), direction: "down" } },
                        { type: "deleteStoryFlag", flag: "检测" },
                        { type: "addStoryFlag", flag: "sb" },
                        { type: "deleteStoryFlag", flag: "survived" },
                        { type: "gameover2" },
                        { type: "textMessage", text: "我：在自习室睡得真不舒服。", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：还得是回宿舍补个觉", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：爽！", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：诶，怎么今天日期没有变化呢？", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：我是忘记了什么重要的事情了吗？", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意" },
                    ]
                }
            ],
            [utils.asGridCoord(14, 11)]: [
                {
                    required: ["survived", "检测"],
                    events: [
                        { type: "changeMap", map: "day_background", position: { x: utils.withGrid(11), y: utils.withGrid(24), direction: "down" } },
                        { type: "deleteStoryFlag", flag: "检测" },
                        { type: "addStoryFlag", flag: "sb" },
                        { type: "deleteStoryFlag", flag: "survived" },
                        { type: "sleep" },
                        { type: "textMessage", text: "我：在自习室睡得真不舒服。", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：还得是回宿舍补个觉", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：爽！", head_src: "asset/player_head.png" },
                    ]
                },
                {
                    required: ["survived"],
                    events: [
                        { type: "changeMap", map: "day_background", position: { x: utils.withGrid(11), y: utils.withGrid(24), direction: "down" } },
                        { type: "deleteStoryFlag", flag: "检测" },
                        { type: "addStoryFlag", flag: "sb" },
                        { type: "deleteStoryFlag", flag: "survived" },
                        { type: "gameover2" },
                        { type: "textMessage", text: "我：在自习室睡得真不舒服。", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：还得是回宿舍补个觉", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：爽！", head_src: "asset/player_head.png" },
                        { type: "textMessage", text: "我：诶，怎么今天日期没有变化呢？", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：我是忘记了什么重要的事情了吗？", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意" },
                    ]
                }
            ],
        },
    },
    Library: {
        id: "Library",
        lowerSrc: "./asset/map/图书馆.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(15),
                y: utils.withGrid(9),
                isPlayerControlled: true,
            }),
            图书管理员: ({
                id: "图书管理员",
                type: "Person",
                x: utils.withGrid(12),
                y: utils.withGrid(11),
                src: "./asset/图书管理员行走图.png",
                direction: "up",
                talking: [
                    {
                        required: ["day5"],
                        events: [
                            { type: "textMessage", text: "图书管理员：同学你好,有什么可以帮助你的吗？", facePlayer: "图书管理员", head_src: "./asset/图书管理员.png" },
                            {
                                type: "choose",
                                options: ["请问C柜在哪里呢？", "办理借阅"],
                                callbacks: [
                                    [{ type: "textMessage", text: "图书管理员：最前面的一排是A柜，往后依次是B柜和C柜。", head_src: "./asset/图书管理员.png" },
                                    { type: "textMessage", text: "图书管理员：请注意一次只允许借阅一本书。", head_src: "./asset/图书管理员.png" },
                                    { type: "textMessage", text: "图书管理员：别忘了只有拥有对应书柜的借书证才能借书哦！", head_src: "./asset/图书管理员.png" },
                                    ],
                                    [
                                        { type: "textMessage", text: "图书管理员：已经为你办理了借阅，现在你可以去借阅新的书籍了！", head_src: "./asset/图书管理员.png" },
                                        { type: "deleteStoryFlag", flag: "借书" },
                                    ]
                                ],
                            },
                        ],
                    },
                ]
            }),
            A: ({
                id: "A",
                type: "Person",
                x: utils.withGrid(4),
                y: utils.withGrid(5),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["借书", "day5"],
                        events: [
                            { type: "textMessage", text: "我：还有书没办理借阅，先去找图书管理员办借阅吧！", head_src: "./asset/player_head.png" },
                        ]
                    },
                    {
                        required: ["借A", "day5"],
                        events: [
                            { type: "textMessage", text: "我：已经在A书架借过书了，再去别的书架看看吧。", head_src: "./asset/player_head.png" },
                        ]
                    },
                    {
                        required: ["day5"],
                        events: [
                            { type: "textMessage", text: "这里是A书柜" },
                            { type: "textMessage", text: "我：那个人要的书好像是在C柜来着，先在A柜看看吧。", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "我：《网页设计与制作》？这本书看起来不错，借走看看吧。", head_src: "./asset/player_head.png", img_src: "./asset/网页设计与制作.jpg" },
                            { type: "textMessage", text: "我：诶，书里好像掉出来了什么东西。", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "获得要紧物事：B柜借书证", img_src: "./asset/借书证.png" },
                            { type: "addStoryFlag", flag: "B柜借书证" },
                            { type: "textMessage", text: "我：得先去找图书管理员办理借书，不然会被赶出去的。", head_src: "./asset/player_head.png" },
                            { type: "addStoryFlag", flag: "借书" },
                            { type: "addStoryFlag", flag: "借A" },
                        ],

                    },
                ]
            }),
            B: ({
                id: "B",
                type: "Person",
                x: utils.withGrid(10),
                y: utils.withGrid(15),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["借书", "day5"],
                        events: [
                            { type: "textMessage", text: "我：还有书没办理借阅，先去找图书管理员办借阅吧！", head_src: "./asset/player_head.png" },
                        ]
                    },
                    {
                        required: ["借B", "day5"],
                        events: [
                            { type: "textMessage", text: "我：已经在B书架借过书了，再去别的书架看看吧。", head_src: "./asset/player_head.png" },
                        ]
                    },
                    {
                        required: ["B柜借书证", "day5"],
                        events: [
                            { type: "textMessage", text: "这里是B书柜" },
                            { type: "textMessage", text: "我：嘶————B书柜好像都是一些我看不懂的专业书。", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "我：诶，《JS从入门到入坟》，刚好想学JS来着，就借这本吧！", head_src: "./asset/player_head.png", img_src: "./asset/JS.png" },
                            { type: "textMessage", text: "我：诶，书里好像掉出来了什么东西。", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "我：不会还是......", head_src: "./asset/女主（思考）.png" },
                            { type: "textMessage", text: "获得要紧物事：C柜借书证", img_src: "./asset/借书证.png" },
                            { type: "addStoryFlag", flag: "C柜借书证" },
                            { type: "addStoryFlag", flag: "借书" },
                            { type: "addStoryFlag", flag: "借B" },
                            { type: "textMessage", text: "我：果然还是一样吗😓", head_src: "./asset/player_head.png" },

                        ]
                    },
                    {
                        required: ["day5"],
                        events: [
                            { type: "textMessage", text: "图书管理员：你在做什么？你不知道没有对应的借书证不能借书吗？", head_src: "./asset/图书管理员.png" },
                            { type: "textMessage", text: "你被图书管理员赶了出去。" },
                            { type: "changeMap", map: "third_Gallery", position: { x: utils.withGrid(25), y: utils.withGrid(5), direction: "down" } },
                            { type: "walk", who: "player", direction: "down" },
                            { type: "walk", who: "player", direction: "left" },
                            {
                                type: "createNPC",
                                configObjects: {
                                    小丑: ({
                                        id: "小丑",
                                        type: "Person",
                                        x: utils.withGrid(15),
                                        y: utils.withGrid(6),
                                        src: "./asset/小丑行走图.png",
                                    })
                                }
                            },
                            { type: "walk", who: "小丑", direction: "right" },
                            { type: "walk", who: "小丑", direction: "right" },
                            { type: "walk", who: "小丑", direction: "right" },
                            { type: "walk", who: "小丑", direction: "right" },
                            { type: "walk", who: "小丑", direction: "right" },
                            { type: "walk", who: "小丑", direction: "right" },
                            { type: "walk", who: "小丑", direction: "right" },
                            { type: "walk", who: "小丑", direction: "right" },
                            { type: "textMessage", text: "神秘奇男子(做出悲伤的表情）：我还以为你会帮我呢，原来是一样的自私！", head_src: "./asset/小丑.png" },
                            { type: "textMessage", text: "神秘奇男子：既然不给我书，那就留下你的命吧！", img_src: "./asset/突脸小丑.png" },
                            { type: "setAchievement", text: "获得成就：图书馆的小丑", img_src: "../achv/image/image/06.jpg", achievement: "图书馆的小丑" },
                            { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                            { type: "gameover" },
                        ]
                    },
                ]
            }),
            C: ({
                id: "C",
                type: "Person",
                x: utils.withGrid(8),
                y: utils.withGrid(18),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["借书", "day5"],
                        events: [
                            { type: "textMessage", text: "我：还有书没办理借阅，先去找图书管理员办借阅吧！", head_src: "./asset/player_head.png" },
                        ]
                    },
                    {
                        required: ["借C", "day5"],
                        events: [
                            { type: "textMessage", text: "我：已经找到那个人要的书了，快去走廊找他吧。", head_src: "./asset/player_head.png" },
                        ]
                    },
                    {
                        required: ["C柜借书证", "day5"],
                        events: [
                            { type: "textMessage", text: "这里是C书柜" },
                            { type: "textMessage", text: "我：嗯，那个人要的书应该就在这里了。", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "我：让我找一找", head_src: "./asset/player_head.png" },
                            {
                                type: "choose",
                                options: ["黑色封皮的书", "黑色神话的书"],
                                callbacks: [
                                    [{ type: "textMessage", text: "我：应该是这本黑色封皮的书没错了。", head_src: "./asset/player_head.png" },
                                    { type: "textMessage", text: "你打开了这本黑色封皮的书", img_src: "./asset/黑色封皮的书.png" },
                                    { type: "textMessage", text: "你的心一惊，发现书上写满了“菜”字", img_src: "./asset/黑色封皮的书.png" },
                                    { type: "textMessage", text: "你连忙将书合上，可是为时已晚", img_src: "./asset/黑色封皮的书.png" },
                                    { type: "textMessage", text: "你昏倒在地上，再也醒不来了" },
                                    { type: "setAchievement", text: "获得成就：为什么不玩黑神话 是因为菜吗？", img_src: "../achv/image/07.jpg", achievement: "为什么不玩黑神话 是因为菜吗？" },
                                    { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                    { type: "gameover" },
                                    ],
                                    [
                                        { type: "textMessage", text: "我：应该是这本讲黑神话的书没错了。", head_src: "./asset/player_head.png" },
                                        { type: "textMessage", text: "获得要紧物事：《黑神话——悟空设定集》", img_src: "./asset/黑神话.jpg" },
                                        { type: "textMessage", text: "你打开了这本书，惊讶的发现里面居然夹着一张小纸条", img_src: "./asset/黑色封皮的书.png" },
                                        { type: "textMessage", text: "黑神话Steam兑换CDK：gca018T1kyiElrQ", img_src: "./asset/黑色封皮的书.png" },
                                        { type: "textMessage", text: "我：这是什么东西？不管了，先收起来吧。", head_src: "./asset/player_head.png" },
                                        { type: "textMessage", text: "我：快去把书交给那个人吧。", head_src: "./asset/player_head.png" },
                                        { type: "addStoryFlag", flag: "借书" },
                                        { type: "addStoryFlag", flag: "黑神话" },
                                        { type: "addStoryFlag", flag: "借C" },
                                    ]
                                ],
                            },
                        ]
                    },
                    {
                        required: ["day5"],
                        events: [
                            { type: "textMessage", text: "图书管理员：你在做什么？你不知道没有对应的借书证不能借书吗？", head_src: "./asset/图书管理员.png" },
                            { type: "textMessage", text: "你被图书管理员赶了出去。" },
                            { type: "changeMap", map: "third_Gallery", position: { x: utils.withGrid(25), y: utils.withGrid(5), direction: "down" } },
                            { type: "walk", who: "player", direction: "down" },
                            { type: "walk", who: "player", direction: "left" },
                            {
                                type: "createNPC",
                                configObjects: {
                                    小丑: ({
                                        id: "小丑",
                                        type: "Person",
                                        x: utils.withGrid(15),
                                        y: utils.withGrid(6),
                                        src: "./asset/小丑行走图.png",
                                    })
                                }
                            },
                            { type: "walk", who: "小丑", direction: "right" },
                            { type: "walk", who: "小丑", direction: "right" },
                            { type: "walk", who: "小丑", direction: "right" },
                            { type: "walk", who: "小丑", direction: "right" },
                            { type: "walk", who: "小丑", direction: "right" },
                            { type: "walk", who: "小丑", direction: "right" },
                            { type: "walk", who: "小丑", direction: "right" },
                            { type: "walk", who: "小丑", direction: "right" },
                            { type: "textMessage", text: "神秘奇男子(做出悲伤的表情）：我还以为你会帮我呢，原来是一样的自私！", head_src: "./asset/小丑.png" },
                            { type: "textMessage", text: "神秘奇男子：既然不给我书，那就留下你的命吧！", img_src: "./asset/突脸小丑.png" },
                            { type: "setAchievement", text: "获得成就：图书馆的小丑", img_src: "../achv/image/06.jpg", achievement: "图书馆的小丑" },
                            { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                            { type: "gameover" },
                        ]
                    },
                ]
            }),
        },
        cutSceneSpaces: {
            [utils.asGridCoord(14, 9)]: [
                {
                    required: ["day5"],
                    excepts: ["生成小丑"],
                    events: [
                        { type: "addStoryFlag", flag: "生成小丑" },
                        {
                            type: "createNPC",
                            configObjects: {
                                小丑: ({
                                    id: "小丑",
                                    type: "Person",
                                    x: utils.withGrid(3),
                                    y: utils.withGrid(9),
                                    src: "./asset/小丑行走图.png",
                                })
                            }
                        },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "textMessage", text: "神秘奇男子：喂，同学！帮我借本《黑神话—悟空设定集》呗。", head_src: "./asset/小丑.png" },
                        { type: "textMessage", text: "神秘奇男子：应该是在C柜上，你去找找看吧，我的借书证也顺便交给你吧。", head_src: "./asset/小丑.png" },
                        { type: "textMessage", text: "获得要紧物事：神秘奇男子的A柜借书证", img_src: "./asset/借书证.png" },
                        { type: "textMessage", text: "神秘奇男子：书柜的具体位置你可以问问那边的图书管理员。", head_src: "./asset/小丑.png" },
                        { type: "textMessage", text: "神秘奇男子：就这样，我在走廊等你。", head_src: "./asset/小丑.png" },
                        { type: "textMessage", text: "我：真是个奇怪的人，还是不要惹到他的好，老老实实帮他借书吧。", head_src: "./asset/player_head.png" },
                        { type: "deleteNPC", who: "小丑" },
                    ]
                }
            ],
            [utils.asGridCoord(3, 19)]: [
                {
                    required: ["day6", "midnight"],
                    excepts: ["be in study"],
                    events: [
                        { type: "addStoryFlag", flag: "be in study" },
                        { type: "addStoryFlag", flag: "survived" },
                        { type: "changeMap", map: "StudyRoom", position: { x: utils.withGrid(15), y: utils.withGrid(19), direction: "left" } },
                        {
                            type: "createNPC",
                            configObjects: {
                                npcE: ({
                                    id: "npcE",
                                    type: "Person",
                                    x: utils.withGrid(14),
                                    y: utils.withGrid(20),
                                    src: "./asset/4行走图.png",
                                })
                            }
                        },
                        { type: "surviveFromSan" },//原{type: "sleep"}
                        { type: "stand", who: "npcE", direction: "up" },
                        { type: "textMessage", text: "路过的同学：你刚刚去哪了？我找了几圈没看到你，就回自习室等你了。", head_src: "./asset/4.png" },
                        { type: "textMessage", text: "路过的同学：对了，给你这个（递给我一张纸条）。", head_src: "./asset/4.png" },
                        { type: "textMessage", text: "我：*？，又是一个奇怪的数字。", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "（还想追问什么，但都不理我，她找了个位子就睡觉了）" },
                        { type: "deleteNPC", who: "npcE" },
                        { type: "textMessage", text: "获得要紧物事：纸条", img_src: "asset/密码.png" },
                        { type: "addStoryFlag", flag: "检测" },
                    ]
                },
                {
                    required: ["midnight"],
                    events: [
                        { type: "changeMap", map: "StudyRoom", position: { x: utils.withGrid(15), y: utils.withGrid(19), direction: "left" } },
                        { type: "surviveFromSan" },
                        { type: "addStoryFlag", flag: "survived" }
                    ]
                },
                {
                    required: ["be in study"],
                    events: [
                        { type: "changeMap", map: "StudyRoom", position: { x: utils.withGrid(15), y: utils.withGrid(19), direction: "left" } },
                        { type: "addStoryFlag", flag: "survived" }
                    ]
                },
                {
                    events: [
                        { type: "changeMap", map: "StudyRoom", position: { x: utils.withGrid(15), y: utils.withGrid(19), direction: "left" } },
                    ]
                },

            ],
            [utils.asGridCoord(15, 9)]: [
                {
                    required: ["借书"],
                    events: [{ type: "textMessage", text: "我：还有书没办理借阅，先去找图书管理员办理借阅吧。", head_src: "./asset/player_head.png" },
                    { type: "walk", who: "player", direction: "left" },
                    ],
                },
                {
                    required: ["黑神话"],
                    events: [
                        { type: "changeMap", map: "third_Gallery", position: { x: utils.withGrid(25), y: utils.withGrid(5), direction: "down" } },
                        { type: "deleteStoryFlag", flag: "黑神话" },
                        { type: "walk", who: "player", direction: "down" },
                        { type: "walk", who: "player", direction: "left" },
                        {
                            type: "createNPC",
                            configObjects: {
                                小丑: ({
                                    id: "小丑",
                                    type: "Person",
                                    x: utils.withGrid(15),
                                    y: utils.withGrid(6),
                                    src: "./asset/小丑行走图.png",
                                })
                            }
                        },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "walk", who: "小丑", direction: "right" },
                        { type: "textMessage", text: "神秘奇男子：对对对，就是这本书，我找这本书好几天了，怎么都找不到。", head_src: "./asset/小丑.png" },
                        { type: "textMessage", text: "神秘奇男子：同学谢谢你，这是给你的报酬。", head_src: "./asset/小丑.png" },
                        { type: "textMessage", text: "获得要紧物事：写有不明数字的小纸条", head_src: "./asset/小丑.png", img_src: "./asset/密码.png" },
                        { type: "addStoryFlag", flag: "检测" },
                        { type: "deleteNPC", who: "小丑" },
                    ],
                },
                {
                    events: [
                        { type: "changeMap", map: "third_Gallery", position: { x: utils.withGrid(25), y: utils.withGrid(5), direction: "down" } },
                        { type: "timeLapse" }
                    ]
                }
            ]
        }
    },

    Gallery_1st: {
        id: "Gallery_1st",
        lowerSrc: "./asset/map/走廊.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(4),
                y: utils.withGrid(8),
                isPlayerControlled: true,
            }),
        },
        wall: {

        },
        cutSceneSpaces: {
            [utils.asGridCoord(28, 5)]: [
                {
                    events: [
                        { type: "textMessage", text: "不能进男厕所哦~" },
                        { who: "player", type: "walk", direction: "down" },
                    ]
                }
            ],
            [utils.asGridCoord(30, 5)]: [
                {
                    events: [
                        { type: "changeMap", map: "WomenRoom_black", position: { x: utils.withGrid(6), y: utils.withGrid(11), direction: "up" } },
                    ]
                }
            ],
            [utils.asGridCoord(25, 5)]: [
                {
                    required: ["day1"],
                    events: [
                        { type: "textMessage", text: "先去收拾宿舍吧！" },
                        { type: "walk", who: "player", direction: "down" },
                    ]
                },
                {

                    events: [
                        { type: "changeMap", map: "Classroom_normal_101" },
                    ]
                },
            ],
            [utils.asGridCoord(4, 10)]: [
                {
                    required: ["day"],
                    events: [
                        { type: "changeMap", map: "Gate" },
                        { type: "timeLapse" },
                    ]
                },
                {
                    required: ["night"],
                    events: [
                        { type: "changeMap", map: "Gate_night" },
                        { type: "timeLapse" },
                    ]
                }
            ],
            [utils.asGridCoord(3, 10)]: [
                {
                    required: ["day"],
                    events: [
                        { type: "changeMap", map: "Gate" },
                        { type: "timeLapse" },
                    ]
                },
                {
                    required: ["night"],
                    events: [
                        { type: "changeMap", map: "Gate_night" },
                        { type: "timeLapse" },
                    ]
                }
            ],
            [utils.asGridCoord(52, 5)]: [
                {
                    required: ["day1"],
                    events: [
                        { type: "textMessage", text: "先去收拾宿舍吧！" },
                        { type: "walk", who: "player", direction: "down" },
                    ]
                },
                {
                    events: [
                        { type: "changeMap", map: "Classroom_normal_102" },
                    ]
                }
            ],
            [utils.asGridCoord(54, 3)]: [
                {
                    required: ["day1"],
                    events: [
                        { type: "textMessage", text: "先去收拾宿舍吧！" },
                        { type: "walk", who: "player", direction: "down" },
                    ]
                },
                {
                    events: [
                        { type: "changeMap", map: "Gallery_2nd", position: { x: utils.withGrid(4), y: utils.withGrid(8), direction: "up" } },
                    ]
                }
            ],
            [utils.asGridCoord(55, 3)]: [
                {
                    required: ["day1"],
                    events: [
                        { type: "textMessage", text: "先去收拾宿舍吧！" },
                        { type: "walk", who: "player", direction: "down" },
                    ]
                },
                {
                    events: [
                        { type: "changeMap", map: "Gallery_2nd", position: { x: utils.withGrid(4), y: utils.withGrid(8), direction: "up" } },
                    ]
                }
            ],
        },
    },
    Gallery_2nd: {
        id: "Gallery_2nd",
        lowerSrc: "./asset/map/走廊.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(4),
                y: utils.withGrid(8),
                isPlayerControlled: true,
            }),
        },
        wall: {

        },
        cutSceneSpaces: {
            [utils.asGridCoord(28, 5)]: [
                {
                    events: [
                        { type: "textMessage", text: "不能进男厕所哦~" },
                        { who: "player", type: "walk", direction: "down" },
                    ]
                }
            ],
            [utils.asGridCoord(30, 5)]: [
                {
                    events: [
                        { type: "changeMap", map: "WomenRoom" },
                    ]
                }
            ],
            [utils.asGridCoord(25, 5)]: [
                {
                    events: [
                        { type: "changeMap", map: "Classroom_normal_201" },
                    ]
                }
            ],
            [utils.asGridCoord(4, 10)]: [
                {
                    events: [
                        { type: "changeMap", map: "Gallery_1st", position: { x: utils.withGrid(54), y: utils.withGrid(5), direction: "down" } },
                    ]
                }
            ],
            [utils.asGridCoord(3, 10)]: [
                {
                    events: [
                        { type: "changeMap", map: "Gallery_1st", position: { x: utils.withGrid(54), y: utils.withGrid(5), direction: "down" } },
                    ]
                }
            ],
            [utils.asGridCoord(52, 5)]: [
                {
                    events: [
                        { type: "changeMap", map: "Classroom_normal_202" },
                    ]
                }
            ],
            [utils.asGridCoord(54, 3)]: [
                {
                    events: [
                        { type: "changeMap", map: "third_Gallery", position: { x: utils.withGrid(4), y: utils.withGrid(8), direction: "up" } },
                    ]
                }
            ],
            [utils.asGridCoord(55, 3)]: [
                {
                    events: [
                        { type: "changeMap", map: "third_Gallery", position: { x: utils.withGrid(4), y: utils.withGrid(8), direction: "up" } },
                    ]
                }
            ],
        },
    },

    Classroom_normal_102:
    {
        id: "Classroom_normal_102",
        lowerSrc: "./asset/map/教室.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(14),
                y: utils.withGrid(6),
                isPlayerControlled: true,
            }),
        },
        cutSceneSpaces: {
            [utils.asGridCoord(15, 6)]: [
                {
                    events: [
                        { type: "changeMap", map: "Gallery_1st", position: { x: utils.withGrid(52), y: utils.withGrid(6), direction: "down" } },
                        { type: "timeLapse" },
                    ]
                }
            ],

        },
    },
    Classroom_normal_101:
    {
        id: "Classroom_normal_101",
        lowerSrc: "./asset/map/教室.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(14),
                y: utils.withGrid(6),
                isPlayerControlled: true,
            }),
        },
        cutSceneSpaces: {
            [utils.asGridCoord(15, 6)]: [
                {
                    events: [
                        { type: "changeMap", map: "Gallery_1st", position: { x: utils.withGrid(25), y: utils.withGrid(6), direction: "down" } },
                        { type: "timeLapse" },
                    ]
                }
            ],

        },
    },
    Classroom_normal_201:
    {
        id: "Classroom_normal_201",
        lowerSrc: "./asset/map/教室.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(14),
                y: utils.withGrid(6),
                isPlayerControlled: true,
            }),
        },
        cutSceneSpaces: {
            [utils.asGridCoord(15, 6)]: [
                {
                    events: [
                        { type: "changeMap", map: "Gallery_2nd", position: { x: utils.withGrid(25), y: utils.withGrid(6), direction: "down" } },
                        { type: "timeLapse" },
                    ]
                }
            ],

        },
    },
    Classroom_normal_202:
    {
        id: "Classroom_normal_202",
        lowerSrc: "./asset/map/教室.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(14),
                y: utils.withGrid(6),
                isPlayerControlled: true,
            }),
        },
        cutSceneSpaces: {
            [utils.asGridCoord(15, 6)]: [
                {
                    events: [
                        { type: "changeMap", map: "Gallery_2nd", position: { x: utils.withGrid(52), y: utils.withGrid(6), direction: "down" } },
                        { type: "timeLapse" },
                    ]
                }
            ],

        },
    },
    Classroom_special:
    {
        id: "Classroom_special",
        lowerSrc: "./asset/map/教室1.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(14),
                y: utils.withGrid(6),
                isPlayerControlled: true,
            }),
            paper1: ({
                id: "paper1",
                type: "Person",
                x: utils.withGrid(8),
                y: utils.withGrid(6),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["pp1", "day2"],
                        events: [
                            { type: "textMessage", text: "我：这里刚刚看过了。", head_src: "./asset/player_head.png" },
                        ]
                    },
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: " 你获得了纸条1" },
                            {
                                type: "createNPC",
                                configObjects: {
                                    teacher: ({
                                        id: "teacher",
                                        type: "Person",
                                        x: utils.withGrid(15),
                                        y: utils.withGrid(6),
                                        src: "./asset/图书管理员行走图.png",
                                    })
                                }
                            },
                            { type: "walk", who: "teacher", direction: "left" },
                            { type: "walk", who: "teacher", direction: "left" },
                            { type: "walk", who: "teacher", direction: "left" },
                            { type: "walk", who: "teacher", direction: "left" },
                            { type: "textMessage", text: "老师：同学，你有看见我的教尺吗？", head_src: "./asset/图书管理员.png" },
                            {
                                type: "choose",
                                options: ["不好意思老师，我没看到您的教尺。", "（沉默......）"],
                                callbacks: [
                                    [
                                        { type: "textMessage", text: "老师：噢，是吗？那你的口袋里是什么？", head_src: "./asset/图书管理员.png" },
                                        { type: "textMessage", text: "（你低头看向自己的口袋，发现里面露出了教尺的一部分）" },
                                        { type: "textMessage", text: "我：啊？…什么…我…我…我不知道，什么时候！！！！", head_src: "./asset/女主（悲伤）.png" },
                                        { type: "textMessage", text: "（美女老师的面目突然开始扭曲，狰狞起来，犹如恶鬼一般扑向了你）" },
                                        { type: "textMessage", text: "我：啊——————！", head_src: "./asset/女主（悲伤）.png" },
                                        { type: "textMessage", text: "（你被“老师”杀死了）" },
                                        { type: "deleteNPC", who: "teacher" },
                                        { type: "setAchievement", text: "尊师重长", img_src: "../achv/image/01.jpg", achievement: "尊师重长" },
                                        { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                        { type: "gameover" },
                                    ],
                                    [
                                        { type: "textMessage", text: "（“老师”盯着你看了许久，然后转身走了。）", head_src: "./asset/图书管理员.png" },
                                        { type: "walk", who: "teacher", direction: "right" },
                                        { type: "walk", who: "teacher", direction: "right" },
                                        { type: "walk", who: "teacher", direction: "right" },
                                        { type: "walk", who: "teacher", direction: "right" },
                                        { type: "deleteNPC", who: "teacher" },
                                        { type: "textMessage", text: "我：呼——终于走了，这老师也太诡异了。", head_src: "./asset/player_head.png" },
                                        { type: "addStoryFlag", flag: "pp1" },
                                    ],
                                ],
                            },

                        ],
                    },
                ],
            }),
            paper3: ({
                id: "paper3",
                type: "Person",
                x: utils.withGrid(13),
                y: utils.withGrid(8),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["pp3", "day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（你找到了一个纸团）" },
                            { type: "textMessage", text: "我：怎么还有人往我的桌子里乱丢垃圾啊。", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "（将纸团张开）我：残缺的纸片？上面似乎写着什么东西，先收着吧。", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "（你获得了纸条3）" },
                            {
                                type: "createNPC",
                                configObjects: {
                                    black_worker: ({
                                        id: "black_worker",
                                        type: "Person",
                                        x: utils.withGrid(15),
                                        y: utils.withGrid(6),
                                        src: "./asset/5行走图.png"
                                    })
                                },
                            },
                            { type: "walk", who: "black_worker", direction: "left" },
                            { type: "stand", who: "black_worker", direction: "down" },
                            { type: "stand", who: "player", direction: "up" },
                            { type: "textMessage", text: "（黑衣）工作人员：同学，这么晚了，你还在教室里做什么呢？", head_src: "./asset/5.png" },
                            {
                                type: "choose",
                                options: ["我…我有东西落在这里，不知道掉到哪个地方了，正…正在找。", "（沉默，伺机离开）"],
                                callbacks: [
                                    [
                                        { type: "textMessage", text: "工作人员：哦这样子啊，那你动作快些，教室这个点已经不允许进人了，找到东西后尽快离开，不要为难我的工作。（离去）", head_src: "./asset/5.png" },
                                        { type: "walk", who: "black_worker", direction: "right" },
                                        { type: "deleteNPC", who: "black_worker" },
                                        { type: "addStoryFlag", flag: "pp3" },
                                    ],
                                    [
                                        { type: "textMessage", text: "工作人员：你跑什么！你 ，不是属于“这儿”的吧。", head_src: "./asset/5.png" },
                                        { type: "textMessage", text: "（说罢，他一把掐住你的脖子（顷刻炼化），你逐渐缺氧，眼神模糊，最后看到的是癫狂的笑容）" },
                                        { type: "textMessage", text: "（你死了）" },
                                        { type: "deleteNPC", who: "black_worker" },
                                        { type: "setAchievement", text: "获得成就：沉默有时并不那么好使", img_src: "../achv/image/02.jpg", achievement: "沉默有时并不那么好使" },
                                        { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                        { type: "gameover" },
                                    ],
                                ],
                            },

                        ],
                    },
                ],
            }),
            paper4: ({
                id: "paper4",
                type: "Person",
                x: utils.withGrid(4),
                y: utils.withGrid(5),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["pp4", "day2"],
                        events: [
                            { type: "textMessage", text: "我：这里已经找遍了。", head_src: "./asset/player_head.png" },
                        ]
                    },
                    {
                        required: ["day2"],
                        img: ["./asset/书架.png"],
                        events: [
                            { type: "textMessage", text: "（一个书架）" },
                            { type: "textMessage", text: "我：咦？这两本书里面夹着什么？", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "（你找到了纸片4）" },
                            { type: "textMessage", text: "我：这是一个残缺的纸片，上面好像写着什么东西。拿走拿走，等会儿研究研究。", head_src: "./asset/player_head.png" },
                            { type: "addStoryFlag", flag: "pp4" },
                        ],
                    },
                ],
            }),
            desk1: ({
                id: "desk1",
                type: "Person",
                x: utils.withGrid(11),
                y: utils.withGrid(8),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk2: ({
                id: "desk2",
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(8),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk3: ({
                id: "desk3",
                type: "Person",
                x: utils.withGrid(7),
                y: utils.withGrid(8),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk4: ({
                id: "desk4",
                type: "Person",
                x: utils.withGrid(5),
                y: utils.withGrid(8),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk5: ({
                id: "desk5",
                type: "Person",
                x: utils.withGrid(13),
                y: utils.withGrid(10),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk6: ({
                id: "desk6",
                type: "Person",
                x: utils.withGrid(11),
                y: utils.withGrid(10),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk7: ({
                id: "desk7",
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(10),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk8: ({
                id: "desk8",
                type: "Person",
                x: utils.withGrid(7),
                y: utils.withGrid(10),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk9: ({
                id: "desk9",
                type: "Person",
                x: utils.withGrid(5),
                y: utils.withGrid(10),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk10: ({
                id: "desk10",
                type: "Person",
                x: utils.withGrid(13),
                y: utils.withGrid(12),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk11: ({
                id: "desk11",
                type: "Person",
                x: utils.withGrid(11),
                y: utils.withGrid(12),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk12: ({
                id: "desk12",
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(12),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk13: ({
                id: "desk13",
                type: "Person",
                x: utils.withGrid(7),
                y: utils.withGrid(12),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk14: ({
                id: "desk14",
                type: "Person",
                x: utils.withGrid(5),
                y: utils.withGrid(12),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk15: ({
                id: "desk15",
                type: "Person",
                x: utils.withGrid(13),
                y: utils.withGrid(14),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk16: ({
                id: "desk16",
                type: "Person",
                x: utils.withGrid(11),
                y: utils.withGrid(14),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk17: ({
                id: "desk17",
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(14),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk18: ({
                id: "desk18",
                type: "Person",
                x: utils.withGrid(7),
                y: utils.withGrid(14),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk19: ({
                id: "desk19",
                type: "Person",
                x: utils.withGrid(5),
                y: utils.withGrid(14),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk20: ({
                id: "desk20",
                type: "Person",
                x: utils.withGrid(13),
                y: utils.withGrid(16),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk21: ({
                id: "desk21",
                type: "Person",
                x: utils.withGrid(11),
                y: utils.withGrid(16),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk22: ({
                id: "desk22",
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(16),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk23: ({
                id: "desk23",
                type: "Person",
                x: utils.withGrid(7),
                y: utils.withGrid(16),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk24: ({
                id: "desk24",
                type: "Person",
                x: utils.withGrid(5),
                y: utils.withGrid(16),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk25: ({
                id: "desk25",
                type: "Person",
                x: utils.withGrid(13),
                y: utils.withGrid(18),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk26: ({
                id: "desk26",
                type: "Person",
                x: utils.withGrid(11),
                y: utils.withGrid(18),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk27: ({
                id: "desk27",
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(18),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk28: ({
                id: "desk28",
                type: "Person",
                x: utils.withGrid(7),
                y: utils.withGrid(18),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
            desk29: ({
                id: "desk29",
                type: "Person",
                x: utils.withGrid(5),
                y: utils.withGrid(18),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["day2"],
                        events: [
                            { type: "textMessage", text: "（这里什么都没有）" },
                        ]
                    },
                ]
            }),
        },
        cutSceneSpaces: {
            [utils.asGridCoord(15, 6)]: [
                {
                    required: ["day2", "检测"],
                    events: [
                        { type: "changeMap", map: "Gallery_1st", position: { x: utils.withGrid(25), y: utils.withGrid(5), direction: "down" } },
                        { type: "timeLapse" },
                    ],
                },
                {
                    required: ["day2"],
                    events: [
                        { type: "textMessage", text: "再找找这里还有什么线索吧", head_src: "./asset/player_head.png" },
                    ],
                },
                {
                    events: [
                        { type: "changeMap", map: "Gallery_1st", position: { x: utils.withGrid(25), y: utils.withGrid(5), direction: "down" } },
                        { type: "timeLapse" },
                    ],
                },
            ],
            [utils.asGridCoord(4, 18)]: [
                {
                    required: ["pp2", "day2"],
                    events: [
                        { type: "textMessage", text: "我：地上已经没有任何东西了", head_src: "./asset/player_head.png" },
                    ]
                },
                {
                    required: ["day2"],
                    events: [
                        { type: "textMessage", text: "我：谁这么没素质乱扔纸飞机啊", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：咦？里面写了东西，不过这纸片是不完整的，会不会是重要的线索？", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：再去看看其他地方吧", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "（你获得了纸条2）" },
                        {
                            type: "createNPC",
                            configObjects: {
                                red_worker: ({
                                    id: "red_worker",
                                    type: "Person",
                                    x: utils.withGrid(14),
                                    y: utils.withGrid(17),
                                    src: "./asset/4行走图.png",
                                })
                            },
                        },
                        { type: "walk", who: "red_worker", direction: "left" },
                        { type: "walk", who: "red_worker", direction: "left" },
                        { type: "walk", who: "red_worker", direction: "left" },
                        { type: "walk", who: "red_worker", direction: "left" },
                        { type: "walk", who: "red_worker", direction: "left" },
                        { type: "walk", who: "red_worker", direction: "left" },
                        { type: "walk", who: "red_worker", direction: "left" },
                        { type: "walk", who: "red_worker", direction: "left" },
                        { type: "walk", who: "red_worker", direction: "left" },
                        { type: "walk", who: "red_worker", direction: "left" },
                        { type: "stand", who: "red_worker", direction: "down" },
                        { type: "stand", who: "player", direction: "up" },
                        { type: "textMessage", text: "（红色衣服）工作人员：同学，这么晚了，你还在教室里做什么呢？", head_src: "./asset/4.png" },
                        {
                            type: "choose",
                            options: ["哦，我有东西落在教室，不知道掉在哪里了，正在找。", "（沉默，伺机离开教室）"],
                            callbacks: [
                                [
                                    { type: "textMessage", text: "工作人员：噢，那你找的是这个吗？", head_src: "./asset/4.png" },
                                    { type: "textMessage", text: "（说罢，掏出一把斧头劈脸砍将过来，你被杀死了）" },
                                    { type: "setAchievement", text: "获得成就：厉鬼等级精进——红衣", img_src: "../achv/image/03.jpg", achievement: "厉鬼等级精进——红衣" },
                                    { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                    { type: "gameover" },
                                ],
                                [
                                    { type: "textMessage", text: "工作人员：唉，又是一个哑巴吗？算了，放过你", head_src: "./asset/4.png" },
                                    { type: "stand", who: "red_worker", direction: "down", time: 1000 },
                                    { type: "deleteNPC", who: "red_worker" },
                                    { type: "stand", who: "player", direction: "up", time: 500 },
                                    { type: "textMessage", text: "我：！！！！", head_src: "./asset/女主（悲伤）.png" },
                                    { type: "textMessage", text: "我：人呢？！突...突然消失了？！太诡异了！！找完线索赶紧离开吧", head_src: "./asset/女主（悲伤）.png" },
                                    { type: "addStoryFlag", flag: "pp2" },
                                ],
                            ],
                        },
                    ],
                },
            ],
        },
        forcedCutscene: [{
            required: ["pp1", "pp2", "pp3", "pp4", "day2"],
            excepts: ["检测"],
            events: [
                { type: "textMessage", text: "我:斯，这四张纸片好像能拼成一个完整的纸张。", head_src: "./asset/player_head.png" },
                { type: "textMessage", text: "(你小心翼翼的将四张残缺纸片拼接起来)" },
                { type: "textMessage", text: "我:上面写的是--日月之差--，唔什么意思到底。", head_src: "./asset/player_head.png" },
                { type: "textMessage", text: "我:算了，已经很晚了，回去之后再想吧", head_src: "./asset/player_head.png" },
                { type: "textMessage", text: "获得要紧事物：记载奇怪谜语的纸张", img_src: "./asset/密码.png" },
                { type: "addStoryFlag", flag: "检测" },
            ],
        }
        ],
    },
    DiningHall_normal:
    {
        id: "DiningHall_normal",
        lowerSrc: "./asset/map/食堂.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(17),
                isPlayerControlled: true,
            }),
            window1: ({
                id: "window1",
                type: "Person",
                x: utils.withGrid(5),
                y: utils.withGrid(9),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["food1", "day3"],
                        events: [
                            { type: "textMessage", text: "我：已经打过这类食物了。", head_src: "./asset/player_head.png" },
                        ]
                    },
                    {
                        required: ["day3"],
                        events: [
                            {
                                type: "choose",
                                options: ["打饭", "看看别的"],
                                callbacks: [
                                    [
                                        { type: "textMessage", text: "我：叔！给我来份这个。", head_src: "./asset/player_head.png" },
                                        { type: "textMessage", text: "打饭师傅：好嘞！" },
                                        { type: "addStoryFlag", flag: "food1" },
                                    ],
                                    [
                                        { type: "textMessage", text: "我：看看别的地方有啥吃的吧。", head_src: "./asset/player_head.png" }
                                    ],
                                ]
                            }
                        ]
                    }
                ]
            }),
            window2: ({
                id: "window2",
                type: "Person",
                x: utils.withGrid(7),
                y: utils.withGrid(9),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["food1", "day3"],
                        events: [
                            { type: "textMessage", text: "我：已经打过这类食物了。", head_src: "./asset/player_head.png" },
                        ]
                    },
                    {
                        required: ["day3"],
                        events: [
                            {
                                type: "choose",
                                options: ["打饭", "看看别的"],
                                callbacks: [
                                    [
                                        { type: "textMessage", text: "我：叔！给我来份这个。", head_src: "./asset/player_head.png" },
                                        { type: "textMessage", text: "打饭师傅：好嘞！" },
                                        { type: "addStoryFlag", flag: "food1" },
                                    ],
                                    [
                                        { type: "textMessage", text: "我：看看别的地方有啥吃的吧。", head_src: "./asset/player_head.png" }
                                    ],
                                ]
                            }
                        ]
                    }
                ]
            }),
            window3: ({
                id: "window3",
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(9),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["food2", "day3"],
                        events: [
                            { type: "textMessage", text: "我：已经打过这类食物了。", head_src: "./asset/player_head.png" },
                        ]
                    },
                    {
                        required: ["day3"],
                        events: [
                            {
                                type: "choose",
                                options: ["打饭", "看看别的"],
                                callbacks: [
                                    [
                                        { type: "textMessage", text: "我：叔！给我来份这个。", head_src: "./asset/player_head.png" },
                                        { type: "textMessage", text: "打饭师傅：好嘞！" },
                                        { type: "addStoryFlag", flag: "food2" },
                                    ],
                                    [
                                        { type: "textMessage", text: "我：看看别的地方有啥吃的吧。", head_src: "./asset/player_head.png" }
                                    ],
                                ]
                            }
                        ]
                    }
                ]
            }),
            window4: ({
                id: "window4",
                type: "Person",
                x: utils.withGrid(11),
                y: utils.withGrid(9),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["food2", "day3"],
                        events: [
                            { type: "textMessage", text: "我：已经打过这类食物了。", head_src: "./asset/player_head.png" },
                        ]
                    },
                    {
                        required: ["day3"],
                        events: [
                            {
                                type: "choose",
                                options: ["打饭", "看看别的"],
                                callbacks: [
                                    [
                                        { type: "textMessage", text: "我：叔！给我来份这个。", head_src: "./asset/player_head.png" },
                                        { type: "textMessage", text: "打饭师傅：好嘞！" },
                                        { type: "addStoryFlag", flag: "food2" },
                                    ],
                                    [
                                        { type: "textMessage", text: "我：看看别的地方有啥吃的吧。", head_src: "./asset/player_head.png" }
                                    ],
                                ]
                            }
                        ]
                    }
                ]
            }),
            window5: ({
                id: "window5",
                type: "Person",
                x: utils.withGrid(13),
                y: utils.withGrid(9),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["food3", "day3"],
                        events: [
                            { type: "textMessage", text: "我：已经打过这类食物了。", head_src: "./asset/player_head.png" },
                        ]
                    },
                    {
                        required: ["day3"],
                        events: [
                            {
                                type: "choose",
                                options: ["打饭", "看看别的"],
                                callbacks: [
                                    [
                                        { type: "textMessage", text: "我：叔！给我来份这个。", head_src: "./asset/player_head.png" },
                                        { type: "textMessage", text: "打饭师傅：好嘞！" },
                                        { type: "addStoryFlag", flag: "food3" },
                                    ],
                                    [
                                        { type: "textMessage", text: "我：看看别的地方有啥吃的吧。", head_src: "./asset/player_head.png" }
                                    ],
                                ]
                            }
                        ]
                    }
                ]
            }),
            window6: ({
                id: "window6",
                type: "Person",
                x: utils.withGrid(15),
                y: utils.withGrid(9),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["food3", "day3"],
                        events: [
                            { type: "textMessage", text: "我：已经打过这类食物了。", head_src: "./asset/player_head.png" },
                        ]
                    },
                    {
                        required: ["day3"],
                        events: [
                            {
                                type: "choose",
                                options: ["打饭", "看看别的"],
                                callbacks: [
                                    [
                                        { type: "textMessage", text: "我：叔！给我来份这个。", head_src: "./asset/player_head.png" },
                                        { type: "textMessage", text: "打饭师傅：好嘞！" },
                                        { type: "addStoryFlag", flag: "food3" },
                                    ],
                                    [
                                        { type: "textMessage", text: "我：看看别的地方有啥吃的吧。", head_src: "./asset/player_head.png" }
                                    ],
                                ]
                            }
                        ]
                    }
                ]
            }),
            window7: ({
                id: "window7",
                type: "Person",
                x: utils.withGrid(17),
                y: utils.withGrid(9),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["food4", "day3"],
                        events: [
                            { type: "textMessage", text: "我：已经打过这类食物了。", head_src: "./asset/player_head.png" },
                        ]
                    },
                    {
                        required: ["day3"],
                        events: [
                            {
                                type: "choose",
                                options: ["打饭", "看看别的"],
                                callbacks: [
                                    [
                                        { type: "textMessage", text: "我：叔！给我来份这个。", head_src: "./asset/player_head.png" },
                                        { type: "textMessage", text: "打饭师傅：好嘞！" },
                                        { type: "addStoryFlag", flag: "food4" },
                                    ],
                                    [
                                        { type: "textMessage", text: "我：看看别的地方有啥吃的吧。", head_src: "./asset/player_head.png" }
                                    ],
                                ]
                            }
                        ]
                    }
                ]
            }),
            window8: ({
                id: "window8",
                type: "Person",
                x: utils.withGrid(19),
                y: utils.withGrid(9),
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["food4", "day3"],
                        events: [
                            { type: "textMessage", text: "我：已经打过这类食物了。", head_src: "./asset/player_head.png" },
                        ]
                    },
                    {
                        required: ["day3"],
                        events: [
                            {
                                type: "choose",
                                options: ["打饭", "看看别的"],
                                callbacks: [
                                    [
                                        { type: "textMessage", text: "我：叔！给我来份这个。", head_src: "./asset/player_head.png" },
                                        { type: "textMessage", text: "打饭师傅：好嘞！" },
                                        { type: "addStoryFlag", flag: "food4" },
                                    ],
                                    [
                                        { type: "textMessage", text: "我：看看别的地方有啥吃的吧。", head_src: "./asset/player_head.png" }
                                    ],
                                ]
                            }
                        ]
                    }
                ]
            }),
            menu1: ({
                id: "menu1",
                type: "Person",
                x: utils.withGrid(4),
                y: utils.withGrid(9),
                src: "./asset/obj.png",
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "窗口1：鱼", img_src: "" },
                        ]
                    },
                ]
            }),
            menu2: ({
                id: "menu2",
                type: "Person",
                x: utils.withGrid(6),
                y: utils.withGrid(9),
                src: "./asset/obj.png",
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "窗口2：虾", img_src: "" },
                        ]
                    },
                ]
            }),
            menu3: ({
                id: "menu3",
                type: "Person",
                x: utils.withGrid(8),
                y: utils.withGrid(9),
                src: "./asset/obj.png",
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "窗口3：牛肉", img_src: "" },
                        ]
                    },
                ]
            }),
            menu4: ({
                id: "menu4",
                type: "Person",
                x: utils.withGrid(10),
                y: utils.withGrid(9),
                src: "./asset/obj.png",
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "窗口4：羊肉", img_src: "" },
                        ]
                    },
                ]
            }),
            menu5: ({
                id: "menu5",
                type: "Person",
                x: utils.withGrid(12),
                y: utils.withGrid(9),
                src: "./asset/obj.png",
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "窗口5：花菜", img_src: "" },
                        ]
                    },
                ]
            }),
            menu6: ({
                id: "menu6",
                type: "Person",
                x: utils.withGrid(14),
                y: utils.withGrid(9),
                src: "./asset/obj.png",
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "窗口6：白菜", img_src: "" },
                        ]
                    },
                ]
            }),
            menu7: ({
                id: "menu7",
                type: "Person",
                x: utils.withGrid(16),
                y: utils.withGrid(9),
                src: "./asset/obj.png",
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "窗口7：米饭", img_src: "" },
                        ]
                    },
                ]
            }),
            menu8: ({
                id: "menu8",
                type: "Person",
                x: utils.withGrid(18),
                y: utils.withGrid(9),
                src: "./asset/obj.png",
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "窗口8：捞面", img_src: "" },
                        ]
                    },
                ]
            }),
        },
        cutSceneSpaces: {
            [utils.asGridCoord(9, 21)]: [
                {
                    required: ["检测", "day3"],
                    events: [
                        { type: "changeMap", map: "Gate_night", position: { x: utils.withGrid(2), y: utils.withGrid(16), direction: "right" } },
                        { type: "timeLapse" },
                    ]
                },
                {
                    required: ["day3"],
                    events: [
                        { type: "textMessage", text: "肚子好饿啊，先吃点东西吧", head_src: "./asset/player_head.png" },
                    ]
                },
                {
                    required: ["day"],
                    events: [
                        { type: "changeMap", map: "Gate", position: { x: utils.withGrid(2), y: utils.withGrid(16), direction: "right" } },
                        { type: "timeLapse" },
                    ]
                },
                {
                    required: ["night"],
                    events: [
                        { type: "changeMap", map: "Gate_night", position: { x: utils.withGrid(2), y: utils.withGrid(16), direction: "right" } },
                        { type: "timeLapse" },
                    ]
                }
            ],
            [utils.asGridCoord(12, 15)]: [
                {
                    required: ["food1", "food2", "food3", "food4", "day3"],
                    excepts: ["检测"],
                    events: [

                        { type: "stand", who: "player", direction: "down" },
                        { type: "textMessage", text: "我：饿死啦饿死啦！终于能吃饭啦！", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "（吃着吃着，你突然感觉吃到了一个十分坚硬的东西）" },
                        { type: "textMessage", text: "（你赶忙从嘴里拿出来一看，发现是个小小的金属硬币，上面只有一个数字：*）" },
                        { type: "textMessage", text: "我：呸呸呸！饭里怎么还会有硬币啊，学校食堂也不咋样>_<", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "获得要紧物事：与众不同的硬币", img_src: "asset/硬币.png" },
                        { type: "textMessage", text: "...", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "...", head_src: "./asset/player_head.png" },
                        { type: "addStoryFlag", flag: "检测" },
                        { type: "textMessage", text: "我：吃完啦，改回宿舍写作业睡觉了。", head_src: "./asset/player_head.png" },
                        {
                            type: "createNPC",
                            configObjects: {
                                classmate0: ({
                                    id: "classmate0",
                                    type: "Person",
                                    x: utils.withGrid(9),
                                    y: utils.withGrid(21),
                                    src: "./asset/8行走图.png",
                                }),
                            },
                        },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "right" },
                        { type: "textMessage", text: "一年级同学：同学您好，这里是西食堂吗？", head_src: "./asset/8.png" },
                        {
                            type: "choose",
                            options: ["是啊，这里是西食堂。", "学校不就只有一个食堂吗，这里不是西食堂还能是什么？"],
                            callbacks: [
                                [
                                    { type: "textMessage", text: "呼，那就好，我昨天在学校东边也看到了一个食堂，吓死我了。同学你有见过吗？", head_src: "./asset/8.png" },
                                    {
                                        type: "choose",
                                        options: ["东食堂？（询问对方）", "不理会，快步走开（哪来的东食堂，校长不是都说过了只有一个食堂吗）"],
                                        callbacks: [
                                            [
                                                { type: "textMessage", text: "一年级同学：对，学校东边还有一个食堂，是学校最早建立的食堂，不过之前发生了一些事情，导致食堂废弃了。", head_src: "./asset/8.png" },
                                                { type: "textMessage", text: "一年级同学：但是这几个月学校已经重新修缮正式投入使用了，你刚来可能不清楚，来，我带你过去瞧瞧，放心，这顿饭我请你。", head_src: "./asset/8.png" },
                                                { type: "changeMap", map: "DiningHall_Terror" },
                                                { type: "timeLapse" },
                                                { type: "stand", who: "player", direction: "up" },
                                                { type: "textMessage", text: "（你跟随着他来到了东食堂，看到眼前的一幕却瞬间吓得腿脚发软，动弹不得。）", },
                                                { type: "textMessage", text: "我：这...这到底是什么地方，怎么这么诡异？嗯？那是什么？啊——————！", head_src: "./asset/女主（悲伤）.png" },
                                                {
                                                    type: "createNPC",
                                                    configObjects: {
                                                        ghost: ({
                                                            id: "ghost",
                                                            type: "Person",
                                                            x: utils.withGrid(5),
                                                            y: utils.withGrid(5),
                                                            src: "./asset/鬼行走图.png",
                                                        })
                                                    },
                                                },
                                                { type: "textMessage", text: "鬼：东食堂好久没有新鲜的食材了......", head_src: "./asset/鬼.png" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "textMessage", text: "（鬼迅速来到了你的面前，一把抓住了被吓得动弹不得的你）" },
                                                { type: "textMessage", text: "我：啊——————————", head_src: "./asset/女主（悲伤）.png" },
                                                { type: "textMessage", text: "（你被吃掉了）" },
                                                { type: "setAchievement", text: "获得成就：谁说人鬼殊途", img_src: "../achv/image/04.jpg", achievement: "谁说人鬼殊途" },
                                                { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                                { type: "gameover" },
                                            ],
                                            [
                                                { type: "textMessage", text: "（哪来的东食堂，校长不是都说过了只有一个食堂吗）", head_src: "./asset/player_head.png" }
                                            ],
                                        ],
                                    }
                                ],
                                [
                                    { type: "textMessage", text: "一年级同学：学校哪里只有一个食堂，学校东边不是还有一个，我昨天还在那里吃饭来着。", head_src: "./asset/8.png" },
                                    {
                                        type: "choose",
                                        options: ["东食堂？（询问对方）", "(不理会，快步走开)"],
                                        callbacks: [
                                            [
                                                { type: "textMessage", text: "一年级同学：对，学校东边还有一个食堂，是学校最早建立的食堂，不过之前发生了一些事情，导致食堂废弃了。", head_src: "./asset/8.png" },
                                                { type: "textMessage", text: "一年级同学：但是这几个月学校已经重新修缮正式投入使用了，你刚来可能不清楚，来，我带你过去瞧瞧，放心，这顿饭我请你。", head_src: "./asset/8.png" },
                                                { type: "changeMap", map: "DiningHall_Terror" },
                                                { type: "timeLapse" },
                                                { type: "stand", who: "player", direction: "up" },
                                                { type: "textMessage", text: "（你跟随着他来到了东食堂，看到眼前的一幕却瞬间吓得腿脚发软，动弹不得。）", head_src: "./asset/player_head.png" },
                                                { type: "textMessage", text: "我：这...这到底是什么地方，怎么这么诡异？嗯？那是什么？啊——————！", head_src: "./asset/player_head.png" },
                                                {
                                                    type: "createNPC",
                                                    configObjects: {
                                                        ghost: ({
                                                            id: "ghost",
                                                            type: "Person",
                                                            x: utils.withGrid(5),
                                                            y: utils.withGrid(5),
                                                            src: "./asset/鬼行走图.png",
                                                        })
                                                    },
                                                },
                                                { type: "textMessage", text: "鬼：东食堂好久没有新鲜的食材了......", head_src: "./asset/鬼.png" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "textMessage", text: "（鬼迅速来到了你的面前，一把抓住了被吓得动弹不得的你）" },
                                                { type: "textMessage", text: "我：啊——————————", head_src: "./asset/女主（悲伤）.png" },
                                                { type: "textMessage", text: "（你被吃掉了）" },
                                                { type: "setAchievement", text: "获得成就：谁说人鬼殊途", img_src: "../achv/image/04.jpg", achievement: "谁说人鬼殊途" },
                                                { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                                { type: "gameover" },
                                            ],
                                            [
                                                { type: "textMessage", text: "（哪来的东食堂，校长不是都说过了只有一个食堂吗）", head_src: "./asset/player_head.png" }
                                            ],
                                        ],
                                    }
                                ],
                            ]
                        },
                        // { type: "deleteStoryFlag", flag: "food1" },
                        // { type: "deleteStoryFlag", flag: "food2" },
                        // { type: "deleteStoryFlag", flag: "food3" },
                        // { type: "deleteStoryFlag", flag: "food4" },
                    ]
                },
                {
                    required: ["day3"],
                    excepts: ["检测"],
                    events: [
                        { type: "textMessage", text: "我：饭菜还没打齐呢，一共要打四种。", head_src: "./asset/player_head.png" }
                    ]
                }
            ],
            [utils.asGridCoord(13, 15)]: [
                {
                    required: ["food1", "food2", "food3", "food4", "day3"],
                    excepts: ["检测"],
                    events: [

                        { type: "stand", who: "player", direction: "down" },
                        { type: "textMessage", text: "我：饿死啦饿死啦！终于能吃饭啦！", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "（吃着吃着，你突然感觉吃到了一个十分坚硬的东西）" },
                        { type: "textMessage", text: "（你赶忙从嘴里拿出来一看，发现是个小小的金属硬币，上面只有一个数字：*）" },
                        { type: "textMessage", text: "我：呸呸呸！饭里怎么还会有硬币啊，学校食堂也不咋样>_<", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "获得要紧物事：与众不同的硬币", img_src: "asset/硬币.png" },
                        { type: "textMessage", text: "...", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "...", head_src: "./asset/player_head.png" },
                        { type: "addStoryFlag", flag: "检测" },
                        { type: "textMessage", text: "我：吃完啦，改回宿舍写作业睡觉了。", head_src: "./asset/player_head.png" },
                        {
                            type: "createNPC",
                            configObjects: {
                                classmate0: ({
                                    id: "classmate0",
                                    type: "Person",
                                    x: utils.withGrid(9),
                                    y: utils.withGrid(21),
                                    src: "./asset/8行走图.png",
                                }),
                            },
                        },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "right" },
                        { type: "textMessage", text: "一年级同学：同学您好，这里是西食堂吗？", head_src: "./asset/8.png" },
                        {
                            type: "choose",
                            options: ["是啊，这里是西食堂。", "学校不就只有一个食堂吗，这里不是西食堂还能是什么？"],
                            callbacks: [
                                [
                                    { type: "textMessage", text: "呼，那就好，我昨天在学校东边也看到了一个食堂，吓死我了。同学你有见过吗？", head_src: "./asset/8.png" },
                                    {
                                        type: "choose",
                                        options: ["东食堂？（询问对方）", "不理会，快步走开（哪来的东食堂，校长不是都说过了只有一个食堂吗）"],
                                        callbacks: [
                                            [
                                                { type: "textMessage", text: "一年级同学：对，学校东边还有一个食堂，是学校最早建立的食堂，不过之前发生了一些事情，导致食堂废弃了。", head_src: "./asset/8.png" },
                                                { type: "textMessage", text: "一年级同学：但是这几个月学校已经重新修缮正式投入使用了，你刚来可能不清楚，来，我带你过去瞧瞧，放心，这顿饭我请你。", head_src: "./asset/8.png" },
                                                { type: "changeMap", map: "DiningHall_Terror" },
                                                { type: "timeLapse" },
                                                { type: "stand", who: "player", direction: "up" },
                                                { type: "textMessage", text: "（你跟随着他来到了东食堂，看到眼前的一幕却瞬间吓得腿脚发软，动弹不得。）", },
                                                { type: "textMessage", text: "我：这...这到底是什么地方，怎么这么诡异？嗯？那是什么？啊——————！", head_src: "./asset/女主（悲伤）.png" },
                                                {
                                                    type: "createNPC",
                                                    configObjects: {
                                                        ghost: ({
                                                            id: "ghost",
                                                            type: "Person",
                                                            x: utils.withGrid(5),
                                                            y: utils.withGrid(5),
                                                            src: "./asset/鬼行走图.png",
                                                        })
                                                    },
                                                },
                                                { type: "textMessage", text: "鬼：东食堂好久没有新鲜的食材了......", head_src: "./asset/鬼.png" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "textMessage", text: "（鬼迅速来到了你的面前，一把抓住了被吓得动弹不得的你）" },
                                                { type: "textMessage", text: "我：啊——————————", head_src: "./asset/女主（悲伤）.png" },
                                                { type: "textMessage", text: "（你被吃掉了）" },
                                                { type: "setAchievement", text: "获得成就：谁说人鬼殊途", img_src: "../achv/image/04.jpg", achievement: "谁说人鬼殊途" },
                                                { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                                { type: "gameover" },
                                            ],
                                            [
                                                { type: "textMessage", text: "（哪来的东食堂，校长不是都说过了只有一个食堂吗）", head_src: "./asset/player_head.png" }
                                            ],
                                        ],
                                    }
                                ],
                                [
                                    { type: "textMessage", text: "一年级同学：学校哪里只有一个食堂，学校东边不是还有一个，我昨天还在那里吃饭来着。", head_src: "./asset/8.png" },
                                    {
                                        type: "choose",
                                        options: ["东食堂？（询问对方）", "(不理会，快步走开)"],
                                        callbacks: [
                                            [
                                                { type: "textMessage", text: "一年级同学：对，学校东边还有一个食堂，是学校最早建立的食堂，不过之前发生了一些事情，导致食堂废弃了。", head_src: "./asset/8.png" },
                                                { type: "textMessage", text: "一年级同学：但是这几个月学校已经重新修缮正式投入使用了，你刚来可能不清楚，来，我带你过去瞧瞧，放心，这顿饭我请你。", head_src: "./asset/8.png" },
                                                { type: "changeMap", map: "DiningHall_Terror" },
                                                { type: "timeLapse" },
                                                { type: "stand", who: "player", direction: "up" },
                                                { type: "textMessage", text: "（你跟随着他来到了东食堂，看到眼前的一幕却瞬间吓得腿脚发软，动弹不得。）", head_src: "./asset/player_head.png" },
                                                { type: "textMessage", text: "我：这...这到底是什么地方，怎么这么诡异？嗯？那是什么？啊——————！", head_src: "./asset/player_head.png" },
                                                {
                                                    type: "createNPC",
                                                    configObjects: {
                                                        ghost: ({
                                                            id: "ghost",
                                                            type: "Person",
                                                            x: utils.withGrid(5),
                                                            y: utils.withGrid(5),
                                                            src: "./asset/鬼行走图.png",
                                                        })
                                                    },
                                                },
                                                { type: "textMessage", text: "鬼：东食堂好久没有新鲜的食材了......", head_src: "./asset/鬼.png" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "textMessage", text: "（鬼迅速来到了你的面前，一把抓住了被吓得动弹不得的你）" },
                                                { type: "textMessage", text: "我：啊——————————", head_src: "./asset/女主（悲伤）.png" },
                                                { type: "textMessage", text: "（你被吃掉了）" },
                                                { type: "setAchievement", text: "获得成就：谁说人鬼殊途", img_src: "../achv/image/04.jpg", achievement: "谁说人鬼殊途" },
                                                { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                                { type: "gameover" },
                                            ],
                                            [
                                                { type: "textMessage", text: "（哪来的东食堂，校长不是都说过了只有一个食堂吗）", head_src: "./asset/player_head.png" }
                                            ],
                                        ],
                                    }
                                ],
                            ]
                        },
                        // { type: "deleteStoryFlag", flag: "food1" },
                        // { type: "deleteStoryFlag", flag: "food2" },
                        // { type: "deleteStoryFlag", flag: "food3" },
                        // { type: "deleteStoryFlag", flag: "food4" },
                    ]
                },
                {
                    required: ["day3"],
                    excepts: ["检测"],
                    events: [
                        { type: "textMessage", text: "我：饭菜还没打齐呢，一共要打四种。", head_src: "./asset/player_head.png" }
                    ]
                }
            ],
            [utils.asGridCoord(12, 17)]: [
                {
                    required: ["food1", "food2", "food3", "food4", "day3"],
                    excepts: ["检测"],
                    events: [

                        { type: "stand", who: "player", direction: "down" },
                        { type: "textMessage", text: "我：饿死啦饿死啦！终于能吃饭啦！", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "（吃着吃着，你突然感觉吃到了一个十分坚硬的东西）" },
                        { type: "textMessage", text: "（你赶忙从嘴里拿出来一看，发现是个小小的金属硬币，上面只有一个数字：*）" },
                        { type: "textMessage", text: "我：呸呸呸！饭里怎么还会有硬币啊，学校食堂也不咋样>_<", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "获得要紧物事：与众不同的硬币", img_src: "asset/硬币.png" },
                        { type: "textMessage", text: "...", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "...", head_src: "./asset/player_head.png" },
                        { type: "addStoryFlag", flag: "检测" },
                        { type: "textMessage", text: "我：吃完啦，改回宿舍写作业睡觉了。", head_src: "./asset/player_head.png" },
                        {
                            type: "createNPC",
                            configObjects: {
                                classmate0: ({
                                    id: "classmate0",
                                    type: "Person",
                                    x: utils.withGrid(9),
                                    y: utils.withGrid(21),
                                    src: "./asset/8行走图.png",
                                }),
                            },
                        },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "right" },
                        { type: "textMessage", text: "一年级同学：同学您好，这里是西食堂吗？", head_src: "./asset/8.png" },
                        {
                            type: "choose",
                            options: ["是啊，这里是西食堂。", "学校不就只有一个食堂吗，这里不是西食堂还能是什么？"],
                            callbacks: [
                                [
                                    { type: "textMessage", text: "呼，那就好，我昨天在学校东边也看到了一个食堂，吓死我了。同学你有见过吗？", head_src: "./asset/8.png" },
                                    {
                                        type: "choose",
                                        options: ["东食堂？（询问对方）", "不理会，快步走开（哪来的东食堂，校长不是都说过了只有一个食堂吗）"],
                                        callbacks: [
                                            [
                                                { type: "textMessage", text: "一年级同学：对，学校东边还有一个食堂，是学校最早建立的食堂，不过之前发生了一些事情，导致食堂废弃了。", head_src: "./asset/8.png" },
                                                { type: "textMessage", text: "一年级同学：但是这几个月学校已经重新修缮正式投入使用了，你刚来可能不清楚，来，我带你过去瞧瞧，放心，这顿饭我请你。", head_src: "./asset/8.png" },
                                                { type: "changeMap", map: "DiningHall_Terror" },
                                                { type: "timeLapse" },
                                                { type: "stand", who: "player", direction: "up" },
                                                { type: "textMessage", text: "（你跟随着他来到了东食堂，看到眼前的一幕却瞬间吓得腿脚发软，动弹不得。）", },
                                                { type: "textMessage", text: "我：这...这到底是什么地方，怎么这么诡异？嗯？那是什么？啊——————！", head_src: "./asset/女主（悲伤）.png" },
                                                {
                                                    type: "createNPC",
                                                    configObjects: {
                                                        ghost: ({
                                                            id: "ghost",
                                                            type: "Person",
                                                            x: utils.withGrid(5),
                                                            y: utils.withGrid(5),
                                                            src: "./asset/鬼行走图.png",
                                                        })
                                                    },
                                                },
                                                { type: "textMessage", text: "鬼：东食堂好久没有新鲜的食材了......", head_src: "./asset/鬼.png" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "textMessage", text: "（鬼迅速来到了你的面前，一把抓住了被吓得动弹不得的你）" },
                                                { type: "textMessage", text: "我：啊——————————", head_src: "./asset/女主（悲伤）.png" },
                                                { type: "textMessage", text: "（你被吃掉了）" },
                                                { type: "setAchievement", text: "获得成就：谁说人鬼殊途", img_src: "../achv/image/04.jpg", achievement: "谁说人鬼殊途" },
                                                { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                                { type: "gameover" },
                                            ],
                                            [
                                                { type: "textMessage", text: "（哪来的东食堂，校长不是都说过了只有一个食堂吗）", head_src: "./asset/player_head.png" }
                                            ],
                                        ],
                                    }
                                ],
                                [
                                    { type: "textMessage", text: "一年级同学：学校哪里只有一个食堂，学校东边不是还有一个，我昨天还在那里吃饭来着。", head_src: "./asset/8.png" },
                                    {
                                        type: "choose",
                                        options: ["东食堂？（询问对方）", "(不理会，快步走开)"],
                                        callbacks: [
                                            [
                                                { type: "textMessage", text: "一年级同学：对，学校东边还有一个食堂，是学校最早建立的食堂，不过之前发生了一些事情，导致食堂废弃了。", head_src: "./asset/8.png" },
                                                { type: "textMessage", text: "一年级同学：但是这几个月学校已经重新修缮正式投入使用了，你刚来可能不清楚，来，我带你过去瞧瞧，放心，这顿饭我请你。", head_src: "./asset/8.png" },
                                                { type: "changeMap", map: "DiningHall_Terror" },
                                                { type: "timeLapse" },
                                                { type: "stand", who: "player", direction: "up" },
                                                { type: "textMessage", text: "（你跟随着他来到了东食堂，看到眼前的一幕却瞬间吓得腿脚发软，动弹不得。）", head_src: "./asset/player_head.png" },
                                                { type: "textMessage", text: "我：这...这到底是什么地方，怎么这么诡异？嗯？那是什么？啊——————！", head_src: "./asset/player_head.png" },
                                                {
                                                    type: "createNPC",
                                                    configObjects: {
                                                        ghost: ({
                                                            id: "ghost",
                                                            type: "Person",
                                                            x: utils.withGrid(5),
                                                            y: utils.withGrid(5),
                                                            src: "./asset/鬼行走图.png",
                                                        })
                                                    },
                                                },
                                                { type: "textMessage", text: "鬼：东食堂好久没有新鲜的食材了......", head_src: "./asset/鬼.png" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "textMessage", text: "（鬼迅速来到了你的面前，一把抓住了被吓得动弹不得的你）" },
                                                { type: "textMessage", text: "我：啊——————————", head_src: "./asset/女主（悲伤）.png" },
                                                { type: "textMessage", text: "（你被吃掉了）" },
                                                { type: "setAchievement", text: "获得成就：谁说人鬼殊途", img_src: "../achv/image/04.jpg", achievement: "谁说人鬼殊途" },
                                                { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                                { type: "gameover" },
                                            ],
                                            [
                                                { type: "textMessage", text: "（哪来的东食堂，校长不是都说过了只有一个食堂吗）", head_src: "./asset/player_head.png" }
                                            ],
                                        ],
                                    }
                                ],
                            ]
                        },
                        // { type: "deleteStoryFlag", flag: "food1" },
                        // { type: "deleteStoryFlag", flag: "food2" },
                        // { type: "deleteStoryFlag", flag: "food3" },
                        // { type: "deleteStoryFlag", flag: "food4" },
                    ]
                },
                {
                    required: ["day3"],
                    excepts: ["检测"],
                    events: [
                        { type: "textMessage", text: "我：饭菜还没打齐呢，一共要打四种。", head_src: "./asset/player_head.png" }
                    ]
                }
            ],
            [utils.asGridCoord(13, 17)]: [
                {
                    required: ["food1", "food2", "food3", "food4", "day3"],
                    excepts: ["检测"],
                    events: [

                        { type: "stand", who: "player", direction: "down" },
                        { type: "textMessage", text: "我：饿死啦饿死啦！终于能吃饭啦！", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "（吃着吃着，你突然感觉吃到了一个十分坚硬的东西）" },
                        { type: "textMessage", text: "（你赶忙从嘴里拿出来一看，发现是个小小的金属硬币，上面只有一个数字：*）" },
                        { type: "textMessage", text: "我：呸呸呸！饭里怎么还会有硬币啊，学校食堂也不咋样>_<", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "获得要紧物事：与众不同的硬币", img_src: "asset/硬币.png" },
                        { type: "textMessage", text: "...", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "...", head_src: "./asset/player_head.png" },
                        { type: "addStoryFlag", flag: "检测" },
                        { type: "textMessage", text: "我：吃完啦，改回宿舍写作业睡觉了。", head_src: "./asset/player_head.png" },
                        {
                            type: "createNPC",
                            configObjects: {
                                classmate0: ({
                                    id: "classmate0",
                                    type: "Person",
                                    x: utils.withGrid(9),
                                    y: utils.withGrid(21),
                                    src: "./asset/8行走图.png",
                                }),
                            },
                        },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "up" },
                        { type: "walk", who: "classmate0", direction: "right" },
                        { type: "textMessage", text: "一年级同学：同学您好，这里是西食堂吗？", head_src: "./asset/8.png" },
                        {
                            type: "choose",
                            options: ["是啊，这里是西食堂。", "学校不就只有一个食堂吗，这里不是西食堂还能是什么？"],
                            callbacks: [
                                [
                                    { type: "textMessage", text: "呼，那就好，我昨天在学校东边也看到了一个食堂，吓死我了。同学你有见过吗？", head_src: "./asset/8.png" },
                                    {
                                        type: "choose",
                                        options: ["东食堂？（询问对方）", "不理会，快步走开（哪来的东食堂，校长不是都说过了只有一个食堂吗）"],
                                        callbacks: [
                                            [
                                                { type: "textMessage", text: "一年级同学：对，学校东边还有一个食堂，是学校最早建立的食堂，不过之前发生了一些事情，导致食堂废弃了。", head_src: "./asset/8.png" },
                                                { type: "textMessage", text: "一年级同学：但是这几个月学校已经重新修缮正式投入使用了，你刚来可能不清楚，来，我带你过去瞧瞧，放心，这顿饭我请你。", head_src: "./asset/8.png" },
                                                { type: "changeMap", map: "DiningHall_Terror" },
                                                { type: "timeLapse" },
                                                { type: "stand", who: "player", direction: "up" },
                                                { type: "textMessage", text: "（你跟随着他来到了东食堂，看到眼前的一幕却瞬间吓得腿脚发软，动弹不得。）", },
                                                { type: "textMessage", text: "我：这...这到底是什么地方，怎么这么诡异？嗯？那是什么？啊——————！", head_src: "./asset/女主（悲伤）.png" },
                                                {
                                                    type: "createNPC",
                                                    configObjects: {
                                                        ghost: ({
                                                            id: "ghost",
                                                            type: "Person",
                                                            x: utils.withGrid(5),
                                                            y: utils.withGrid(5),
                                                            src: "./asset/鬼行走图.png",
                                                        })
                                                    },
                                                },
                                                { type: "textMessage", text: "鬼：东食堂好久没有新鲜的食材了......", head_src: "./asset/鬼.png" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "textMessage", text: "（鬼迅速来到了你的面前，一把抓住了被吓得动弹不得的你）" },
                                                { type: "textMessage", text: "我：啊——————————", head_src: "./asset/女主（悲伤）.png" },
                                                { type: "textMessage", text: "（你被吃掉了）" },
                                                { type: "setAchievement", text: "获得成就：谁说人鬼殊途", img_src: "../achv/image/04.jpg", achievement: "谁说人鬼殊途" },
                                                { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                                { type: "gameover" },
                                            ],
                                            [
                                                { type: "textMessage", text: "（哪来的东食堂，校长不是都说过了只有一个食堂吗）", head_src: "./asset/player_head.png" }
                                            ],
                                        ],
                                    }
                                ],
                                [
                                    { type: "textMessage", text: "一年级同学：学校哪里只有一个食堂，学校东边不是还有一个，我昨天还在那里吃饭来着。", head_src: "./asset/8.png" },
                                    {
                                        type: "choose",
                                        options: ["东食堂？（询问对方）", "(不理会，快步走开)"],
                                        callbacks: [
                                            [
                                                { type: "textMessage", text: "一年级同学：对，学校东边还有一个食堂，是学校最早建立的食堂，不过之前发生了一些事情，导致食堂废弃了。", head_src: "./asset/8.png" },
                                                { type: "textMessage", text: "一年级同学：但是这几个月学校已经重新修缮正式投入使用了，你刚来可能不清楚，来，我带你过去瞧瞧，放心，这顿饭我请你。", head_src: "./asset/8.png" },
                                                { type: "changeMap", map: "DiningHall_Terror" },
                                                { type: "timeLapse" },
                                                { type: "stand", who: "player", direction: "up" },
                                                { type: "textMessage", text: "（你跟随着他来到了东食堂，看到眼前的一幕却瞬间吓得腿脚发软，动弹不得。）", head_src: "./asset/player_head.png" },
                                                { type: "textMessage", text: "我：这...这到底是什么地方，怎么这么诡异？嗯？那是什么？啊——————！", head_src: "./asset/player_head.png" },
                                                {
                                                    type: "createNPC",
                                                    configObjects: {
                                                        ghost: ({
                                                            id: "ghost",
                                                            type: "Person",
                                                            x: utils.withGrid(5),
                                                            y: utils.withGrid(5),
                                                            src: "./asset/鬼行走图.png",
                                                        })
                                                    },
                                                },
                                                { type: "textMessage", text: "鬼：东食堂好久没有新鲜的食材了......", head_src: "./asset/鬼.png" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "right" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "walk", who: "ghost", direction: "down" },
                                                { type: "textMessage", text: "（鬼迅速来到了你的面前，一把抓住了被吓得动弹不得的你）" },
                                                { type: "textMessage", text: "我：啊——————————", head_src: "./asset/女主（悲伤）.png" },
                                                { type: "textMessage", text: "（你被吃掉了）" },
                                                { type: "setAchievement", text: "获得成就：谁说人鬼殊途", img_src: "../achv/image/04.jpg", achievement: "谁说人鬼殊途" },
                                                { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                                { type: "gameover" },
                                            ],
                                            [
                                                { type: "textMessage", text: "（哪来的东食堂，校长不是都说过了只有一个食堂吗）", head_src: "./asset/player_head.png" }
                                            ],
                                        ],
                                    }
                                ],
                            ]
                        },
                        // { type: "deleteStoryFlag", flag: "food1" },
                        // { type: "deleteStoryFlag", flag: "food2" },
                        // { type: "deleteStoryFlag", flag: "food3" },
                        // { type: "deleteStoryFlag", flag: "food4" },
                    ]
                },
                {
                    required: ["day3"],
                    excepts: ["检测"],
                    events: [
                        { type: "textMessage", text: "我：饭菜还没打齐呢，一共要打四种。", head_src: "./asset/player_head.png" }
                    ]
                }
            ],
        },
        forcedCutscene: [{
            required: ["food1", "food2", "food3", "food4", "day3"],
            excepts: ["seat"],
            events: [
                { type: "textMessage", text: "我：饭打好了，找个没人的桌子坐下吃饭吧", head_src: "./asset/player_head.png" },
                { type: "addStoryFlag", flag: "seat" },
            ]
        }]
    },
    DiningHall_Terror: {
        id: "DiningHall_Terror",
        lowerSrc: "./asset/map/恐怖食堂.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(17),
            }),
        }
    },
    Equipmentroom1: {
        id: "Equipmentroom1",
        lowerSrc: "./asset/map/器材室1.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(15),
                y: utils.withGrid(6),
                isPlayerControlled: true,
            }),
        },
        cutSceneSpaces: {
            [utils.asGridCoord(15, 6)]: [
                {
                    events: [
                        { type: "changeMap", map: "ER_hallway", position: { x: utils.withGrid(3), y: utils.withGrid(5), direction: "down" } },
                    ]
                }
            ],
            [utils.asGridCoord(14, 7)]: [
                {
                    excepts: ["num_1"],
                    required: ["day4"],
                    events: [
                        { type: "textMessage", text: "您获得了道具：羽毛球拍" },
                        { type: "addStoryFlag", flag: "badminton" },
                        { type: "addStoryFlag", flag: "num_1" },
                    ]
                }
            ],
            [utils.asGridCoord(5, 7)]: [
                {
                    excepts: ["num_4"],
                    required: ["day4", "football"],
                    events: [
                        { type: "textMessage", text: "您获得了道具：乒乓球拍" },
                        { type: "addStoryFlag", flag: "pingpang" },
                        { type: "addStoryFlag", flag: "num_4" },
                    ]
                }
            ],
            [utils.asGridCoord(7, 6)]: [
                {
                    excepts: ["num_3"],
                    required: ["day4", "basketball"],
                    events: [
                        { type: "textMessage", text: "您获得了道具：足球" },
                        { type: "addStoryFlag", flag: "football" },
                        { type: "addStoryFlag", flag: "num_3" },
                    ]
                }
            ],
            [utils.asGridCoord(5, 6)]: [
                {
                    excepts: ["num_2"],
                    required: ["day4", "badminton"],
                    events: [
                        { type: "textMessage", text: "您获得了道具：篮球" },
                        { type: "addStoryFlag", flag: "basketball" },
                        { type: "addStoryFlag", flag: "num_2" },
                    ]
                }
            ],
        }
    },
    Equipmentroom2: {
        id: "Equipmentroom2",
        lowerSrc: "./asset/map/器材室2.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(14),
                y: utils.withGrid(6),
                isPlayerControlled: true,
            }),
            luonan: ({
                id: "luonan",
                type: "Person",
                x: utils.withGrid(6),
                y: utils.withGrid(6),
                src: "./asset/裸男行走图.png",
                talking: [
                    {
                        required: ["裸男"],
                        img: "./asset/大力王.png",
                        events: [
                            { type: "textMessage", text: "登记老师：你已经登记过成绩了。", facePlayer: "luonan", head_src: "./asset/裸男.png" },
                        ]
                    },
                    {

                        excepts: ["裸男"],
                        img: "./asset/大力王.png",
                        events: [
                            { type: "textMessage", text: "登记老师：我是登记体育的老师，你可以叫我蚌埠。", facePlayer: "luonan", head_src: "./asset/裸男.png" },
                            { type: "textMessage", text: "登记老师：你每上交一个体育器材，我就会为你登记一次成绩。", facePlayer: "luonan", head_src: "./asset/裸男.png" },
                            { type: "textMessage", text: "登记老师：现在，请上交你的体育器材。", facePlayer: "luonan", head_src: "./asset/裸男.png" },
                            {
                                type: "choose",
                                options: ["羽毛球拍", "乒乓球拍"],
                                callbacks: [
                                    [
                                        { type: "textMessage", text: "登记老师：请提交下一个体育器材。" },
                                        {
                                            type: "choose",
                                            options: ["篮球", "足球"],
                                            callbacks: [
                                                [
                                                    { type: "textMessage", text: "登记老师：请提交下一个体育器材。" },
                                                    {
                                                        type: "choose",
                                                        options: ["足球", "乒乓球拍"],
                                                        callbacks: [
                                                            [
                                                                { type: "addStoryFlag", flag: "裸男" },
                                                                { type: "textMessage", text: "登记老师：恭喜你完成了登记，拿上这个，你可以离开了。" },
                                                                { type: "textMessage", text: "获得要紧物事：写有密码的纸条", img_src: "asset/密码.png" },
                                                                { type: "addStoryFlag", flag: "检测" }
                                                            ],
                                                            [
                                                                { type: "textMessage", text: "提交错误，老师生气了，一巴掌扇死了你" },
                                                                { type: "setAchievement", text: "获得成就：操场上的牛马", img_src: "../achv/image/05.jpg", achievement: "操场上的牛马" },
                                                                { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                                                { type: "gameover" },
                                                            ],
                                                        ],

                                                    },
                                                ],
                                                [
                                                    { type: "textMessage", text: "提交错误，老师生气了，一巴掌扇死了你" },
                                                    { type: "setAchievement", text: "获得成就：操场上的牛马", img_src: "../achv/image/05.jpg", achievement: "操场上的牛马" },
                                                    { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                                    { type: "gameover" },
                                                ],
                                            ],

                                        },
                                    ],
                                    [
                                        { type: "textMessage", text: "提交错误，老师生气了，一巴掌扇死了你" },
                                        { type: "setAchievement", text: "获得成就：操场上的牛马", img_src: "../achv/image/05.jpg", achievement: "操场上的牛马" },
                                        { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                        { type: "gameover" },
                                    ],
                                ],

                            },
                        ]
                    },

                ],

            }),
        },
        cutSceneSpaces: {
            [utils.asGridCoord(14, 6)]: [
                {
                    events: [
                        { type: "changeMap", map: "ER_hallway", position: { x: utils.withGrid(15), y: utils.withGrid(5), direction: "down" } },
                    ]
                }
            ],
        }
    },
    Testroom: {
        id: "Testroom",
        lowerSrc: "./asset/map/考场.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(6),
                isPlayerControlled: true,
            }),
        },
        cutSceneSpaces: {

            [utils.asGridCoord(9, 7)]: [
                {
                    required: ["检测"],
                    events: [
                        { type: "textMessage", text: "我：终于考完了，快去密码门那看看吧。", head_src: "./asset/player_head.png" },
                    ]
                },
                {
                    //img: "./asset/背景/教室背景.jpg",
                    events: [
                        { type: "stand", who: "player", direction: "down" },
                        { type: "textMessage", text: "考试要求：不能答错题目，否则会被监考老师扭掉脑袋" },
                        { type: "textMessage", text: "铃声响起，考试开始了。" },
                        { type: "textMessage", text: "我：太荒谬了，答错就会死？为什么我要把自己的性命交付在这一张破卷子上啊！", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "你看向四周，其他同学都很平静，没有一丝恐慌的感觉，甚至——是没有一点表情，一点都没有！" },
                        { type: "textMessage", text: "（如此荒谬的一场考试，他们竟然还做的下去？就没有一个人反抗吗，这所学校可是在让你们赌命啊！难道他们不带脑子的吗？）", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "突然你感觉被什么人盯着，抬头一看，原来是监考老师" },
                        { type: "textMessage", text: "只见他瞪大了双眼，死死地盯着自己，连眼都不眨一下，仿佛下一秒就会走过来把他的头拧断" },
                        { type: "textMessage", text: "算了算了，还是保命要紧，还是先做题吧一定不要出错啊！", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "第一题：北京理工大学的校训是什么？" },
                        {
                            type: "choose",
                            options: ["上网不涉密，涉密不上网", "德以明理，学以精工"],
                            callbacks: [
                                [
                                    { type: "textMessage", text: "回答错误" },
                                    {
                                        type: "createNPC",
                                        configObjects: {
                                            监考老师: ({
                                                id: "监考老师",
                                                type: "Person",
                                                x: utils.withGrid(8),
                                                y: utils.withGrid(14),
                                                src: "./asset/鬼行走图.png",
                                            })
                                        }
                                    },
                                    { type: "walk", who: "监考老师", direction: "up" },
                                    { type: "walk", who: "监考老师", direction: "up" },
                                    { type: "walk", who: "监考老师", direction: "up" },
                                    { type: "walk", who: "监考老师", direction: "up" },
                                    { type: "walk", who: "监考老师", direction: "up" },
                                    { type: "walk", who: "监考老师", direction: "up" },
                                    { type: "walk", who: "监考老师", direction: "up" },
                                    { type: "stand", who: "监考老师", direction: "right" },
                                    { type: "textMessage", text: "你被监考员扭断了脖子qaq" },
                                    { type: "setAchievement", text: "获得成就：该重开了bro", img_src: "../achv/image/11.jpg", achievement: "该重开了bro" },
                                    { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                    { type: "gameover" },
                                ],
                                [
                                    { type: "textMessage", text: "回答正确" },
                                    { type: "textMessage", text: "第二题：北京理工大学的校歌第二句是什么？" },
                                    {
                                        type: "choose",
                                        options: ["抚育你茁壮成长", "磨练你意志如钢"],
                                        callbacks: [
                                            [
                                                { type: "textMessage", text: "回答正确" },
                                                { type: "textMessage", text: "第三题：谁被誉为“计算机之父”？" },
                                                {
                                                    type: "choose",
                                                    options: ["图灵", "冯.诺依曼"],
                                                    callbacks: [
                                                        [
                                                            { type: "textMessage", text: "回答错误" },
                                                            {
                                                                type: "createNPC",
                                                                configObjects: {
                                                                    监考老师: ({
                                                                        id: "监考老师",
                                                                        type: "Person",
                                                                        x: utils.withGrid(8),
                                                                        y: utils.withGrid(14),
                                                                        src: "./asset/鬼行走图.png",
                                                                    })
                                                                }
                                                            },
                                                            { type: "walk", who: "监考老师", direction: "up" },
                                                            { type: "walk", who: "监考老师", direction: "up" },
                                                            { type: "walk", who: "监考老师", direction: "up" },
                                                            { type: "walk", who: "监考老师", direction: "up" },
                                                            { type: "walk", who: "监考老师", direction: "up" },
                                                            { type: "walk", who: "监考老师", direction: "up" },
                                                            { type: "walk", who: "监考老师", direction: "up" },
                                                            { type: "stand", who: "监考老师", direction: "right" },
                                                            { type: "textMessage", text: "你被监考员扭断了脖子qaq" },
                                                            { type: "setAchievement", text: "获得成就：该重开了bro", img_src: "../achv/image/11.jpg", achievement: "该重开了bro" },
                                                            { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                                            { type: "gameover" },
                                                        ],
                                                        [
                                                            { type: "textMessage", text: "回答正确" },
                                                            { type: "textMessage", text: "第四题：黑神话悟空的售价是？" },
                                                            {
                                                                type: "choose",
                                                                options: ["268元", "298元"],
                                                                callbacks: [
                                                                    [
                                                                        { type: "textMessage", text: "回答正确" },
                                                                        { type: "textMessage", text: "百丽宫最英俊潇洒、风流倜傥、才貌双全的老师是谁？" },
                                                                        {
                                                                            type: "choose",
                                                                            options: ["赵丰年老师", "其他老师"],
                                                                            callbacks: [
                                                                                [
                                                                                    { type: "textMessage", text: "回答正确" },
                                                                                    { type: "textMessage", text: "全都答完了，你仔细检查了一遍又一遍，确认答案准确无误后走上讲台将他交给了监考老师" },
                                                                                    { type: "textMessage", text: "监考老师检查了你的试卷，大笔一挥，在你的试卷上写下了一个大大的*" },
                                                                                    { type: "textMessage", text: "获得要紧物事：密码七", img_src: "asset/密码.png" },
                                                                                    { type: "addStoryFlag", flag: "检测" },
                                                                                    { type: "changeMap", map: "Classroom_normal_101" },
                                                                                    { type: "jumpToTime", time: "18" },
                                                                                    { type: "textMessage", text: "我：终于考完了，快去密码门那看看吧。", head_src: "./asset/player_head.png" },
                                                                                ],
                                                                                [
                                                                                    { type: "textMessage", text: "回答错误" },
                                                                                    {
                                                                                        type: "createNPC",
                                                                                        configObjects: {
                                                                                            监考老师: ({
                                                                                                id: "监考老师",
                                                                                                type: "Person",
                                                                                                x: utils.withGrid(8),
                                                                                                y: utils.withGrid(14),
                                                                                                src: "./asset/鬼行走图.png",
                                                                                            })
                                                                                        }
                                                                                    },
                                                                                    { type: "walk", who: "监考老师", direction: "up" },
                                                                                    { type: "walk", who: "监考老师", direction: "up" },
                                                                                    { type: "walk", who: "监考老师", direction: "up" },
                                                                                    { type: "walk", who: "监考老师", direction: "up" },
                                                                                    { type: "walk", who: "监考老师", direction: "up" },
                                                                                    { type: "walk", who: "监考老师", direction: "up" },
                                                                                    { type: "walk", who: "监考老师", direction: "up" },
                                                                                    { type: "stand", who: "监考老师", direction: "right" },
                                                                                    { type: "textMessage", text: "你被监考员扭断了脖子qaq" },
                                                                                    { type: "setAchievement", text: "获得成就：该重开了bro", img_src: "../achv/image/11.jpg", achievement: "该重开了bro" },
                                                                                    { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                                                                    { type: "gameover" },
                                                                                ],

                                                                            ],
                                                                        },
                                                                    ],
                                                                    [
                                                                        { type: "textMessage", text: "回答错误" },
                                                                        {
                                                                            type: "createNPC",
                                                                            configObjects: {
                                                                                监考老师: ({
                                                                                    id: "监考老师",
                                                                                    type: "Person",
                                                                                    x: utils.withGrid(8),
                                                                                    y: utils.withGrid(14),
                                                                                    src: "./asset/鬼行走图.png",
                                                                                })
                                                                            }
                                                                        },
                                                                        { type: "walk", who: "监考老师", direction: "up" },
                                                                        { type: "walk", who: "监考老师", direction: "up" },
                                                                        { type: "walk", who: "监考老师", direction: "up" },
                                                                        { type: "walk", who: "监考老师", direction: "up" },
                                                                        { type: "walk", who: "监考老师", direction: "up" },
                                                                        { type: "walk", who: "监考老师", direction: "up" },
                                                                        { type: "walk", who: "监考老师", direction: "up" },
                                                                        { type: "stand", who: "监考老师", direction: "right" },
                                                                        { type: "textMessage", text: "你被监考员扭断了脖子qaq" },
                                                                        { type: "setAchievement", text: "获得成就：该重开了bro", img_src: "../achv/image/11.jpg", achievement: "该重开了bro" },
                                                                        { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                                                        { type: "gameover" },
                                                                    ],

                                                                ],
                                                            },
                                                        ],
                                                    ],
                                                },
                                            ],
                                            [
                                                { type: "textMessage", text: "回答错误" },
                                                {
                                                    type: "createNPC",
                                                    configObjects: {
                                                        监考老师: ({
                                                            id: "监考老师",
                                                            type: "Person",
                                                            x: utils.withGrid(8),
                                                            y: utils.withGrid(14),
                                                            src: "./asset/鬼行走图.png",
                                                        })
                                                    }
                                                },
                                                { type: "walk", who: "监考老师", direction: "up" },
                                                { type: "walk", who: "监考老师", direction: "up" },
                                                { type: "walk", who: "监考老师", direction: "up" },
                                                { type: "walk", who: "监考老师", direction: "up" },
                                                { type: "walk", who: "监考老师", direction: "up" },
                                                { type: "walk", who: "监考老师", direction: "up" },
                                                { type: "walk", who: "监考老师", direction: "up" },
                                                { type: "stand", who: "监考老师", direction: "right" },
                                                { type: "textMessage", text: "你被监考员扭断了脖子qaq" },
                                                { type: "setAchievement", text: "获得成就：该重开了bro", img_src: "../achv/image/11.jpg", achievement: "该重开了bro" },
                                                { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                                { type: "gameover" },
                                            ],
                                        ],
                                    },
                                ]
                            ],
                        },




                    ]
                },

            ],
            [utils.asGridCoord(15, 6)]: [
                {
                    events: [
                        { type: "changeMap", map: "Gallery_1st" },
                        { type: "timeLapse" },
                    ]
                }
            ]
        },

    },
    Gate: {
        id: "Gate",
        lowerSrc: "./asset/map/校门.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(12),
                y: utils.withGrid(15),
                isPlayerControlled: true,
            }),
        },
        cutSceneSpaces: {
            [utils.asGridCoord(12, 15)]: [
                {
                    events: [
                        { type: "changeMap", map: "Gallery_1st" },
                        { type: "timeLapse" },
                    ]
                }
            ],
            [utils.asGridCoord(1, 16)]: [
                {
                    required: ["day3"],
                    events: [
                        { type: "changeMap", map: "DiningHall_normal" },
                        { type: "timeLapse" },
                        {
                            type: "createNPC",
                            configObjects: {
                                worker: ({
                                    id: "worker",
                                    type: "Person",
                                    x: utils.withGrid(9),
                                    y: utils.withGrid(13),
                                    src: "./asset/5行走图.png",
                                })
                            }
                        },
                        { type: "walk", who: "worker", direction: "down" },
                        { type: "walk", who: "worker", direction: "down" },
                        { type: "walk", who: "worker", direction: "down" },
                        { type: "textMessage", text: "工作人员：同学你好，欢迎来到西食堂，你是第三批来食堂就餐的同学，需到特定窗口打饭，请随我来。", head_src: "./asset/5.png" },
                        {
                            type: "choose",
                            options: ["哦，这样呀，好的。（跟着他）。", "谢谢，不用麻烦你了，我自己来就可以。"],
                            callbacks: [
                                [
                                    { type: "textMessage", text: "（工作人员衣服逐渐变成了红色,一把抓住了你的胳膊）" },
                                    { type: "textMessage", text: "工作人员：那就跟我来吧！", head_src: "./asset/5.png" },
                                    { type: "textMessage", text: "（你被拖走了）" },
                                    { type: "changeMap", map: "DiningHall_Terror" },
                                    { type: "timeLapse" },
                                    { type: "stand", who: "player", direction: "up" },
                                    { type: "textMessage", text: "（你莫名地跟随着他来到了东食堂，看到眼前的一幕却瞬间吓得腿脚发软，动弹不得。）", },
                                    { type: "textMessage", text: "我：这...这到底是什么地方，怎么这么诡异？嗯？那是什么？啊——————！", head_src: "./asset/女主（悲伤）.png" },
                                    {
                                        type: "createNPC",
                                        configObjects: {
                                            ghost: ({
                                                id: "ghost",
                                                type: "Person",
                                                x: utils.withGrid(5),
                                                y: utils.withGrid(5),
                                                src: "./asset/鬼行走图.png",
                                            })
                                        },
                                    },
                                    { type: "textMessage", text: "鬼：东食堂好久没有新鲜的食材了......", head_src: "./asset/鬼.png" },
                                    { type: "walk", who: "ghost", direction: "down" },
                                    { type: "walk", who: "ghost", direction: "down" },
                                    { type: "walk", who: "ghost", direction: "down" },
                                    { type: "walk", who: "ghost", direction: "down" },
                                    { type: "walk", who: "ghost", direction: "down" },
                                    { type: "walk", who: "ghost", direction: "down" },
                                    { type: "walk", who: "ghost", direction: "right" },
                                    { type: "walk", who: "ghost", direction: "right" },
                                    { type: "walk", who: "ghost", direction: "right" },
                                    { type: "walk", who: "ghost", direction: "right" },
                                    { type: "walk", who: "ghost", direction: "down" },
                                    { type: "walk", who: "ghost", direction: "down" },
                                    { type: "walk", who: "ghost", direction: "down" },
                                    { type: "walk", who: "ghost", direction: "down" },
                                    { type: "walk", who: "ghost", direction: "down" },
                                    { type: "textMessage", text: "（鬼迅速来到了你的面前，一把抓住了被吓得动弹不得的你）" },
                                    { type: "textMessage", text: "我：啊——————————", head_src: "./asset/女主（悲伤）.png" },
                                    { type: "textMessage", text: "（你被吃掉了）" },
                                    { type: "setAchievement", text: "获得成就：谁说人鬼殊途", img_src: "../achv/image/04.jpg", achievement: "谁说人鬼殊途" },
                                    { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                    { type: "gameover" },
                                ],
                                [
                                    { type: "textMessage", text: "工作人员：好的。食堂每个窗口旁边都有该窗口的菜单，共计四类食物八个窗口，祝您用餐愉快！", head_src: "./asset/5.png" },
                                    { type: "walk", who: "worker", direction: "up" },
                                    { type: "walk", who: "worker", direction: "up" },
                                    { type: "walk", who: "worker", direction: "up" },
                                    { type: "stand", who: "worker", direction: "down", time: 300 },
                                ],
                            ]
                        }

                    ]
                },
                {
                    events: [
                        { type: "changeMap", map: "DiningHall_normal" },
                        { type: "timeLapse" },
                    ]
                }
            ],
            [utils.asGridCoord(23, 16)]: [
                {
                    required: ["day"],
                    events: [
                        { type: "changeMap", map: "day_background", position: { x: utils.withGrid(3), y: utils.withGrid(31), direction: "right" } },
                        { type: "timeLapse" },
                    ]
                },
                {
                    required: ["night"],
                    events: [
                        { type: "changeMap", map: "night_background", position: { x: utils.withGrid(3), y: utils.withGrid(31), direction: "right" } },
                        { type: "timeLapse" },
                    ]
                }
            ],
        },
    },
    Gate_night: {
        id: "Gate_night",
        lowerSrc: "./asset/map/校门（黑夜）.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(12),
                y: utils.withGrid(15),
                isPlayerControlled: true,
            }),
        },
        cutSceneSpaces: {
            [utils.asGridCoord(12, 15)]: [
                {
                    required: ["day1"],
                    events: [
                        { type: "textMessage", text: "先去收拾宿舍吧！" },
                        { type: "walk", who: "player", direction: "down" },
                    ]
                },
                {
                    events: [
                        { type: "changeMap", map: "Gallery_1st" },
                        { type: "timeLapse" },
                    ]
                }
            ],
            [utils.asGridCoord(1, 16)]: [
                {
                    events: [
                        { type: "textMessage", text: "食堂已经关门了" },
                        { type: "walk", who: "player", direction: "right" },
                    ]
                }
            ],
            [utils.asGridCoord(23, 16)]: [
                {
                    required: ["day"],
                    events: [
                        { type: "changeMap", map: "day_background", position: { x: utils.withGrid(3), y: utils.withGrid(31), direction: "right" } },
                        { type: "timeLapse" },
                    ]
                },
                {
                    required: ["night"],
                    events: [
                        { type: "changeMap", map: "night_background", position: { x: utils.withGrid(3), y: utils.withGrid(31), direction: "right" } },
                        { type: "timeLapse" },
                    ]
                }
            ],
        },
    },
    third_Gallery: {
        id: "third_Gallery",
        lowerSrc: "./asset/map/三楼走廊.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(3),
                y: utils.withGrid(10),
                isPlayerControlled: true,
            }),
        },
        cutSceneSpaces: {
            [utils.asGridCoord(10, 6)]: [
                {
                    required: ["day6", "midnight"],
                    excepts: ["npcC"],
                    events: [
                        { type: "addStoryFlag", flag: "npcC" },
                        {
                            type: "createNPC",
                            configObjects: {
                                npcC: ({
                                    id: "npcC",
                                    type: "Person",
                                    x: utils.withGrid(15),
                                    y: utils.withGrid(6),
                                    src: "./asset/7行走图.png",
                                })
                            }
                        },
                        { type: "walk", who: "npcC", direction: "left" },
                        { type: "walk", who: "npcC", direction: "left" },
                        { type: "walk", who: "npcC", direction: "left" },
                        { type: "walk", who: "npcC", direction: "left" },

                        { type: "textMessage", text: "路过的同学：同学，夜深了，我有点害怕，能带我一起去自习室吗？", facePlayer: "npcC", head_src: "./asset/7.png" },
                        {
                            type: "choose",
                            options: ["我也正要去自习室呢，一起去吧", "不理会，快步离开"],
                            callbacks: [
                                [{ type: "textMessage", text: "路过的同学面部开始扭曲，露出阴森的笑容：找到你啦!", head_src: "./asset/牛子.jpg" },
                                { type: "textMessage", text: "你被“伪人”发现了", img_src: "./asset/奖杯.jpg" },
                                { type: "setAchievement", text: "获得成就：当心伪人", img_src: "../achv/image/08.jpg", achievement: "当心伪人" },
                                { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                { type: "gameover" },
                                ],
                                [
                                    { type: "textMessage", text: "快走!" }
                                ],
                            ],
                        },
                    ]
                },
            ],

            [utils.asGridCoord(10, 7)]: [
                {
                    required: ["day6", "midnight"],
                    excepts: ["npcC"],
                    events: [
                        { type: "addStoryFlag", flag: "npcC" },
                        {
                            type: "createNPC",
                            configObjects: {
                                npcC: ({
                                    id: "npcC",
                                    type: "Person",
                                    x: utils.withGrid(15),
                                    y: utils.withGrid(7),
                                    src: "./asset/7行走图.png",
                                })
                            }
                        },
                        { type: "walk", who: "npcC", direction: "left" },
                        { type: "walk", who: "npcC", direction: "left" },
                        { type: "walk", who: "npcC", direction: "left" },
                        { type: "walk", who: "npcC", direction: "left" },

                        { type: "textMessage", text: "路过的同学：同学，夜深了，我有点害怕，能带我一起去自习室吗？", facePlayer: "npcC", head_src: "./asset/7.png" },
                        {
                            type: "choose",
                            options: ["我也正要去自习室呢，一起去吧", "不理会，快步离开"],
                            callbacks: [
                                [{ type: "textMessage", text: "路过的同学面部开始扭曲，露出阴森的笑容：找到你啦!", head_src: "./asset/牛子.jpg" },
                                { type: "textMessage", text: "你被“伪人”发现了", img_src: "./asset/奖杯.jpg" },
                                { type: "setAchievement", text: "获得成就：当心伪人", img_src: "../achv/image/08.jpg", achievement: "当心伪人" },
                                { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                { type: "gameover" },
                                ],
                                [
                                    { type: "textMessage", text: "快走!" }
                                ],
                            ],
                        },
                    ]
                },
            ],
            [utils.asGridCoord(5, 7)]: [
                {
                    required: ["day6"],
                    excepts: ["npcB"],
                    events: [
                        { type: "addStoryFlag", flag: "npcB" },
                        {
                            type: "createNPC",
                            configObjects: {
                                npcB: ({
                                    id: "npcB",
                                    type: "Person",
                                    x: utils.withGrid(15),
                                    y: utils.withGrid(7),
                                    src: "./asset/4行走图.png",
                                })
                            }
                        },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "textMessage", text: "路过的同学：同学，你能帮我个忙吗？", facePlayer: "npcB", head_src: "./asset/4.png" },
                        { type: "textMessage", text: "路过的同学：一起把这些东西搬到器材室可以吗？", facePlayer: "npcB", head_src: "./asset/4.png" },
                        {
                            type: "choose",
                            options: ["当然可以", "算了，同学，我还有事儿"],
                            callbacks: [
                                [{ type: "textMessage", text: "路过的同学：那麻烦你了。", head_src: "./asset/4.png" },
                                { type: "textMessage", text: "路过的同学：宿舍关门前我们可得把事情做完呐。", head_src: "./asset/4.png" },
                                { type: "textMessage", text: "......", img_src: "asset/obj.png" },

                                ],
                                [
                                    { type: "textMessage", text: "路过的同学：哦内该（拜托了）", head_src: "./asset/4.png" },
                                    { type: "textMessage", text: "我心一软，答应下来" },
                                    { type: "textMessage", text: "......", img_src: "asset/obj.png" },

                                ],
                            ],
                        },
                        { type: "deleteNPC", who: "npcB" },
                        { type: "changeMap", map: "ER_hallway", position: { x: utils.withGrid(4), y: utils.withGrid(7), direction: "up" } },
                        {
                            type: "createNPC",
                            configObjects: {
                                npcB: ({
                                    id: "npcB",
                                    type: "Person",
                                    x: utils.withGrid(4),
                                    y: utils.withGrid(6),
                                    src: "./asset/4行走图.png",
                                })
                            }
                        },
                        { type: "textMessage", text: "......", img_src: "asset/obj.png" },
                        { type: "textMessage", text: "......", img_src: "asset/obj.png" },
                        { type: "textMessage", text: "......", img_src: "asset/obj.png" },
                        { type: "textMessage", text: "去器材室搬完东西后，我们开始谈天，聊得倒挺投机" },
                        { type: "textMessage", text: "路过的同学：这里总让我想起我的初中，我当时也没啥朋友，还老让人欺负。", head_src: "./asset/4.png" },
                        { type: "textMessage", text: "路过的同学：话说，你初中咋样啊？", head_src: "./asset/4.png" },
                        { type: "textMessage", text: "我：是吗，我也…也…    “也？”", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "不知怎的，身体有些不受控制，发不出任何声音" },
                        { type: "textMessage", text: "霎时两眼一黑，些许头晕目眩，随后便是强烈的失重感，只能感受到不断地下坠", img_src: "asset/obj.png" },
                        { type: "deleteNPC", who: "npcB" },
                        { type: "changeMap", map: "maze", position: { x: utils.withGrid(3), y: utils.withGrid(5), direction: "right" } },
                        { type: "textMessage", text: "当我苏醒过来时，已经到了一个陌生的地方。" },
                        { type: "textMessage", text: "我：这里是？迷宫？", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "试着喊了几声，但仍旧无人回应。" },
                        { type: "textMessage", text: "我：看来是没人听得到我的声音了。", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "时候不早，我得快点逃离这里先！", head_src: "./asset/player_head.png" },



                    ]
                }
            ],
            [utils.asGridCoord(5, 6)]: [
                {
                    required: ["day6"],
                    excepts: ["npcB"],
                    events: [
                        { type: "addStoryFlag", flag: "npcB" },
                        {
                            type: "createNPC",
                            configObjects: {
                                npcB: ({
                                    id: "npcB",
                                    type: "Person",
                                    x: utils.withGrid(15),
                                    y: utils.withGrid(7),
                                    src: "./asset/4行走图.png",
                                })
                            }
                        },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "walk", who: "npcB", direction: "left" },
                        { type: "textMessage", text: "路过的同学：同学，你能帮我个忙吗？", facePlayer: "npcB", head_src: "./asset/4.png" },
                        { type: "textMessage", text: "路过的同学：一起把这些东西搬到器材室可以吗？", facePlayer: "npcB", head_src: "./asset/4.png" },
                        {
                            type: "choose",
                            options: ["当然可以", "算了，同学，我还有事儿"],
                            callbacks: [
                                [{ type: "textMessage", text: "路过的同学：那麻烦你了。", head_src: "./asset/4.png" },
                                { type: "textMessage", text: "路过的同学：宿舍关门前我们可得把事情做完呐。", head_src: "./asset/4.png" },
                                { type: "textMessage", text: "......", img_src: "asset/obj.png" },

                                ],
                                [
                                    { type: "textMessage", text: "路过的同学：哦内该（拜托了）", head_src: "./asset/4.png" },
                                    { type: "textMessage", text: "我心一软，答应下来" },
                                    { type: "textMessage", text: "......", img_src: "asset/obj.png" },

                                ],
                            ],
                        },
                        { type: "deleteNPC", who: "npcB" },
                        { type: "changeMap", map: "ER_hallway", position: { x: utils.withGrid(4), y: utils.withGrid(7), direction: "up" } },
                        {
                            type: "createNPC",
                            configObjects: {
                                npcB: ({
                                    id: "npcB",
                                    type: "Person",
                                    x: utils.withGrid(4),
                                    y: utils.withGrid(6),
                                    src: "./asset/4行走图.png",
                                })
                            }
                        },
                        { type: "textMessage", text: "......", img_src: "asset/obj.png" },
                        { type: "textMessage", text: "......", img_src: "asset/obj.png" },
                        { type: "textMessage", text: "......", img_src: "asset/obj.png" },
                        { type: "textMessage", text: "去器材室搬完东西后，我们开始谈天，聊得倒挺投机" },
                        { type: "textMessage", text: "路过的同学：这里总让我想起我的初中，我当时也没啥朋友，还老让人欺负。", head_src: "./asset/4.png" },
                        { type: "textMessage", text: "路过的同学：话说，你初中咋样啊？", head_src: "./asset/4.png" },
                        { type: "textMessage", text: "我：是吗，我也…也…    “也？”", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "不知怎的，身体有些不受控制，发不出任何声音" },
                        { type: "textMessage", text: "霎时两眼一黑，些许头晕目眩，随后便是强烈的失重感，只能感受到不断地下坠", img_src: "asset/obj.png" },
                        { type: "deleteNPC", who: "npcB" },
                        { type: "changeMap", map: "maze", position: { x: utils.withGrid(3), y: utils.withGrid(5), direction: "right" } },
                        { type: "textMessage", text: "当我苏醒过来时，已经到了一个陌生的地方。" },
                        { type: "textMessage", text: "我：这里是？迷宫？", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "试着喊了几声，但仍旧无人回应。" },
                        { type: "textMessage", text: "我：看来是没人听得到我的声音了。", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "时候不早，我得快点逃离这里先！", head_src: "./asset/player_head.png" },



                    ]
                }
            ],
            [utils.asGridCoord(3, 10)]: [
                {
                    events: [
                        { type: "changeMap", map: "Gallery_2nd", position: { x: utils.withGrid(54), y: utils.withGrid(5), direction: "down" } },
                    ]
                }
            ],
            [utils.asGridCoord(4, 10)]: [
                {
                    events: [
                        { type: "changeMap", map: "Gallery_2nd", position: { x: utils.withGrid(54), y: utils.withGrid(5), direction: "down" } },
                    ]
                }
            ],
            [utils.asGridCoord(25, 5)]: [
                {
                    required: ["day6", "midnight"],
                    excepts: ["delete npcC"],
                    events: [
                        { type: "addStoryFlag", flag: "delete npcC" },
                        { type: "deleteNPC", who: "npcC" },
                        { type: "changeMap", map: "Library", position: { x: utils.withGrid(15), y: utils.withGrid(9), direction: "left" } },
                        {
                            type: "createNPC",
                            configObjects: {
                                npcD: ({
                                    id: "npcD",
                                    type: "Person",
                                    x: utils.withGrid(13),
                                    y: utils.withGrid(9),
                                    src: "./asset/4行走图.png",
                                })
                            }
                        },
                        { type: "stand", who: "npcD", direction: "right" },
                        { type: "textMessage", text: "我：诶，不是刚刚那个人吗，是在等我吗？", head_src: "./asset/player_head.png" },
                        {
                            type: "choose",
                            options: ["我得赶紧过去才行", "不理会，快步离开"],
                            callbacks: [
                                [{ type: "textMessage", text: "那位同学的头扭了180度，脸从中间裂开了，你的惶恐值猛增到100", head_src: "./asset/牛子.jpg" },
                                { type: "textMessage", text: "你被“伪人”发现了", img_src: "./asset/奖杯.jpg" },
                                { type: "setAchievement", text: "获得成就：当心伪人", img_src: "../achv/image/08.jpg", achievement: "当心伪人" },
                                { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                                { type: "gameover" },
                                ],
                                [

                                    { type: "textMessage", text: "快走！" }
                                ],
                            ],
                        },



                    ]
                },
                {
                    //原excepts: ["midnight"],
                    events: [
                        { type: "changeMap", map: "Library", position: { x: utils.withGrid(15), y: utils.withGrid(9), direction: "left" } },
                    ]
                },
                {
                    required: ["delete npcC"],
                    events: [
                        { type: "changeMap", map: "Library", position: { x: utils.withGrid(15), y: utils.withGrid(9), direction: "left" } },
                    ]
                }
            ],
        },
    },
    WomenRoom: {
        id: "WomenRoom",
        lowerSrc: "./asset/map/二楼女厕所.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(6),
                y: utils.withGrid(12),
                isPlayerControlled: true,
                direction: "up",
            }),
        },
        wall: {
        },
        cutSceneSpaces: {
            [utils.asGridCoord(6, 12)]: [
                {
                    events: [
                        { type: "changeMap", map: "Gallery_2nd", position: { x: utils.withGrid(30), y: utils.withGrid(5), direction: "down" } },
                    ]
                }
            ],
        },
    },
    WomenRoom_black: {
        id: "WomenRoom_black",
        lowerSrc: "./asset/map/一楼女厕所（背景纯黑）.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(6),
                y: utils.withGrid(12),
                isPlayerControlled: true,
                direction: "up",
            }),
            matong: ({
                id: "matong",
                type: "Person",
                x: utils.withGrid(3),
                y: utils.withGrid(5),
                direction: "down",
                src: "./asset/obj.png",
                talking: [
                    {
                        required: ["厕所"],
                        img: "./asset/背景/厕所场景.png",
                        events: [
                            { type: "textMessage", text: "介是一个马桶" },
                            { type: "textMessage", text: "一个普通的马桶" },
                            { type: "textMessage", text: "一个低调奢华有内涵的马桶" },
                            { type: "textMessage", text: "看起来很让人想上的样子" },
                            { type: "textMessage", text: "你不由自主地坐了上去" },
                            { type: "textMessage", text: "（若有所思）" },
                            { type: "textMessage", text: "然后你从马桶上站了起来" },
                            { type: "textMessage", text: "走之前还不由得回头望了一眼那个马桶" },
                            { type: "textMessage", text: "嗯，它只不过是一个普通的马桶罢了" },
                        ],
                    },
                    {
                        img: "./asset/背景/厕所场景.png",
                        events: [
                            { type: "textMessage", text: "介是一个马桶" },
                            { type: "textMessage", text: "一个普通的马桶" },
                            { type: "textMessage", text: "一个低调奢华有内涵的马桶" },
                            { type: "textMessage", text: "看起来很让人想上的样子" },
                            { type: "textMessage", text: "你不由自主地坐了上去" },
                            { type: "textMessage", text: "我：诶，这里怎么有张纸条", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "纸条上写着：你一定要加入学生会" },
                            { type: "textMessage", text: "调查这个学校的真相" },
                            { type: "textMessage", text: "我：这是？？？", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "（若有所思）" },
                            { type: "textMessage", text: "然后你从马桶上站了起来" },
                            { type: "textMessage", text: "走之前还不由得回头望了一眼那个马桶" },
                            { type: "textMessage", text: "嗯，它只不过是一个普通的马桶罢了" },
                            { type: "addStoryFlag", flag: "真结局" },
                            { type: "setAchievement", text: "获得成就：它真的只是一个普通的马桶而已", achievement: "它真的只是一个普通的马桶而已" },
                            { type: "addStoryFlag", flag: "厕所" },
                        ],
                    },
                ]
            }),
        },
        wall: {
        },
        cutSceneSpaces: {
            [utils.asGridCoord(6, 12)]: [
                {
                    events: [
                        { type: "changeMap", map: "Gallery_1st", position: { x: utils.withGrid(30), y: utils.withGrid(5), direction: "down" } },
                    ]
                }
            ],
        },
    },

    Home: {
        id: "Home",
        lowerSrc: "./asset/map/家.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(14),
                y: utils.withGrid(6),
                isPlayerControlled: true,
            }),
        },
        wall: {
        },
        cutSceneSpaces: {
            [utils.asGridCoord(10, 15)]: [
                {
                    events: [
                        { type: "changeMap", map: "Ceremony" },
                        { type: "timeLapse" },
                        { type: "textMessage", text: "妈妈开车送我来到了学校" },
                    ]
                }
            ],
        },
    },
    Ceremony: {
        id: "Ceremony",
        lowerSrc: "./asset/map/开学典礼.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(16),
                isPlayerControlled: true,
            }),
        },
        walls: {
            [utils.asGridCoord(9, 17)]: true,
            [utils.asGridCoord(10, 16)]: true,
            [utils.asGridCoord(8, 16)]: true,
        },
        cutSceneSpaces: {
            [utils.asGridCoord(9, 15)]: [
                {
                    events: [
                        { type: "textMessage", text: "(新生开学典礼上，校长发表讲话，你和发小王允儿交头接耳)" },
                        { type: "textMessage", text: "我：允儿，传言这学校有很多奇怪的规则，违反规则的人最后都消失了。", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：这样一个怪学校，你怎么还敢来啊？", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "允儿：嗯...我觉得吧，应该是些哄骗小孩子的把戏。", head_src: "./asset/发小.png" },
                        { type: "textMessage", text: "允儿：听上去挺像从什么老套的鬼故事里摘出来的东西。", head_src: "./asset/发小.png" },
                        { type: "textMessage", text: "允儿：应该不用太担心吧。", head_src: "./asset/发小.png" },
                        { type: "textMessage", text: "我：可是......", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "允儿：我们俩一起，总不会出什么事的，你就别胡思乱想了。", head_src: "./asset/发小.png" },
                        { type: "textMessage", text: "(总归有些担心，不过也不好说什么，于是聊起了对未来校园生活的期待......)" },
                        { type: "changeMap", map: "Classroom_normal_101" },
                        { type: "jumpToTime", time: "18" },
                        { type: "textMessage", text: "我：呼！今天总算是结束了，这学校挺正常的呀。", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：就是规矩确实有点多(T_T)", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：该回宿舍啦！还不知道我被分到哪一间呢，真希望林允能和我住一起！", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：宿舍楼在哪里来着，我今天才看的地图。", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：嗯~好像是教学楼的东边。", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：出发吧！我已经迫不及待啦~", head_src: "./asset/player_head.png" },
                    ]
                }
            ],
        },

    },
    ER_hallway: {
        id: "ER_hallway",
        lowerSrc: "./asset/map/器材室走廊.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(4),
                y: utils.withGrid(7),
                isPlayerControlled: true,
            }),
        },
        wall: {
        },
        cutSceneSpaces: {
            [utils.asGridCoord(15, 5)]: [
                {
                    events: [
                        { type: "textMessage", text: "门不能从这一侧打开" },
                    ]
                }
            ],
            [utils.asGridCoord(3, 5)]: [
                {
                    events: [
                        { type: "changeMap", map: "Equipmentroom1" },
                    ]
                }
            ],
            // [utils.asGridCoord(15, 5)]: [
            //     {
            //         events: [
            //             { type: "changeMap", map: "Equipmentroom2" },
            //         ]
            //     }
            // ],
            [utils.asGridCoord(3, 10)]: [
                {
                    required: ["day"],
                    events: [
                        { type: "changeMap", map: "day_background", position: { x: utils.withGrid(28), y: utils.withGrid(33), direction: "down" } },
                        { type: "timeLapse" },
                    ]
                },
                {
                    required: ["night"],
                    events: [
                        { type: "changeMap", map: "night_background", position: { x: utils.withGrid(28), y: utils.withGrid(33), direction: "down" } },
                        { type: "timeLapse" },
                    ]
                }
            ],
            [utils.asGridCoord(4, 10)]: [
                {
                    required: ["day"],
                    events: [
                        { type: "changeMap", map: "day_background", position: { x: utils.withGrid(28), y: utils.withGrid(33), direction: "down" } },
                        { type: "timeLapse" },
                    ]
                },
                {
                    required: ["night"],
                    events: [
                        { type: "changeMap", map: "night_background", position: { x: utils.withGrid(28), y: utils.withGrid(33), direction: "down" } },
                        { type: "timeLapse" },
                    ]
                }
            ],
        }
    },
    day_background: {
        id: "day_background",
        lowerSrc: "./asset/map/操场.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(11),
                y: utils.withGrid(24),
                isPlayerControlled: true,
            }),
            teacher_badminton: ({
                id: "teacher_badminton",
                type: "Person",
                x: utils.withGrid(6),
                y: utils.withGrid(26),
                src: "./asset/4行走图.png",
                talking: [
                    {
                        required: ["badminton", "day4", "num_1", "cnm"],
                        img: "./asset/map/操场背景.jpg",
                        events: [
                            { type: "textMessage", text: "羽毛球老师：好的，马上为你进行羽毛球测试。", facePlayer: "teacher_badminton", head_src: "./asset/4.png" },
                            { type: "textMessage", text: "经过一段时间的测试......", facePlayer: "teacher_badminton" },
                            { type: "textMessage", text: "我：呼.呼.呼...累死我了。", facePlayer: "teacher_badminton", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "羽毛球老师：你已经完成羽毛球测试。", facePlayer: "teacher_badminton", head_src: "./asset/4.png" },
                            { type: "textMessage", text: "（该进行下一项测试了）", facePlayer: "teacher_badminton", head_src: "./asset/player_head.png" },
                            { type: "addStoryFlag", flag: "first" },
                            { type: "deleteStoryFlag", flag: "num_1" },
                        ],
                    },
                    {
                        required: ["badminton", "day4", "cnm"],
                        img: "./asset/map/操场背景.jpg",
                        events: [
                            { type: "textMessage", text: "羽毛球老师：您已经完成了羽毛球测试，Ciallo～(∠・ω< )⌒★", facePlayer: "teacher_badminton", head_src: "./asset/4.png" },
                        ]
                    },
                    {
                        required: ["day4", "cnm"],
                        img: "./asset/map/操场背景.jpg",
                        events: [
                            { type: "textMessage", text: "我：你好，老师，我来参加羽毛球测试。", facePlayer: "teacher_badminton", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "羽毛球老师：你需要羽毛球拍才能完成测试。", facePlayer: "teacher_badminton", head_src: "./asset/4.png" },
                        ],
                    },

                ]
            }),
            teacher_basketball: ({
                id: "teacher_basketball",
                type: "Person",
                x: utils.withGrid(10),
                y: utils.withGrid(32),
                src: "./asset/8行走图.png",
                talking: [
                    {
                        required: ["basketball", "day4", "num_2", "first", "cnm"],
                        img: "./asset/map/操场背景.jpg",
                        events: [
                            { type: "textMessage", text: "篮球老师：好的，马上为你进行篮球测试。", facePlayer: "teacher_basketball", head_src: "./asset/8.png" },
                            { type: "textMessage", text: "经过一段时间的测试......", facePlayer: "teacher_badminton" },
                            { type: "textMessage", text: "我：呼.呼.呼....累死我了。", facePlayer: "teacher_badminton", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "篮球老师：你已经完成篮球测试。", facePlayer: "teacher_basketball", head_src: "./asset/8.png" },
                            { type: "textMessage", text: "（该进行下一项测试了）", facePlayer: "teacher_badminton", head_src: "./asset/player_head.png" },
                            { type: "addStoryFlag", flag: "second" },
                            { type: "deleteStoryFlag", flag: "num_2" },
                        ],
                    },
                    {
                        required: ["basketball", "day4", "cnm"],
                        img: "./asset/map/操场背景.jpg",
                        events: [
                            { type: "textMessage", text: "篮球老师：大家好啊，我是练习时长两年半的个人练习生阿坤，我会唱跳RAP打篮球。", facePlayer: "teacher_basketball", head_src: "./asset/8.png" },
                        ]
                    },
                    {
                        required: ["day4", "cnm"],
                        img: "./asset/map/操场背景.jpg",
                        events: [
                            { type: "textMessage", text: "我：你好，老师，我来参加篮球测试。", facePlayer: "teacher_basketball", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "篮球老师：你需要篮球才能完成测试。", facePlayer: "teacher_basketball", head_src: "./asset/8.png" },
                        ],
                    },

                ]
            }),
            teacher_football: ({
                id: "teacher_football",
                type: "Person",
                x: utils.withGrid(20),
                y: utils.withGrid(28),
                src: "./asset/6行走图.png",
                talking: [
                    {
                        required: ["football", "day4", "num_3", "second", "cnm"],
                        img: "./asset/map/操场背景.jpg",
                        events: [
                            { type: "textMessage", text: "足球老师：好的，马上为你进行足球测试。", facePlayer: "teacher_football", head_src: "./asset/6.png" },
                            { type: "textMessage", text: "经过一段时间的测试......", facePlayer: "teacher_badminton" },
                            { type: "textMessage", text: "我：呼.呼.呼....累死我了。", facePlayer: "teacher_badminton", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "足球老师：你已经完成足球测试。", facePlayer: "teacher_football", head_src: "./asset/6.png" },
                            { type: "textMessage", text: "（该进行下一项测试了）", facePlayer: "teacher_badminton", head_src: "./asset/player_head.png" },
                            { type: "addStoryFlag", flag: "third" },
                            { type: "deleteStoryFlag", flag: "num_3" },
                        ],
                    },
                    {
                        required: ["football", "day4", "cnm"],
                        img: "./asset/map/操场背景.jpg",
                        events: [
                            { type: "textMessage", text: "足球老师：siuuuuuuuuuuuuuuuuu!!!!!!!!!!!!!!!!!!!!!!", facePlayer: "teacher_football", head_src: "./asset/6.png" },
                        ]
                    },
                    {
                        required: ["day4", "cnm"],
                        img: "./asset/map/操场背景.jpg",
                        events: [
                            { type: "textMessage", text: "我：你好，老师，我来参加足球测试。", facePlayer: "teacher_football", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "足球老师：你需要足球才能完成测试。", facePlayer: "teacher_football", head_src: "./asset/6.png" },
                        ],
                    },

                ]
            }),
            teacher_pingpang: ({
                id: "teacher_pingpang",
                type: "Person",
                x: utils.withGrid(25),
                y: utils.withGrid(33),
                src: "./asset/5行走图.png",
                talking: [
                    {
                        required: ["pingpang", "day4", "num_4", "third", "cnm"],
                        img: "./asset/map/操场背景.jpg",
                        events: [
                            { type: "textMessage", text: "乒乓球老师：好的，马上为你进行乒乓球测试。", facePlayer: "teacher_pingpang", head_src: "./asset/5.png" },
                            { type: "textMessage", text: "经过一段时间的测试......", facePlayer: "teacher_badminton" },
                            { type: "textMessage", text: "我：呼.呼.呼...累死我了。", facePlayer: "teacher_badminton", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "乒乓球老师：你已经完成乒乓球测试。", facePlayer: "teacher_pingpang", head_src: "./asset/5.png" },
                            { type: "textMessage", text: "乒乓球老师：你已经完成了所有的体育测试，请前往器材室。", facePlayer: "teacher_pingpang", head_src: "./asset/5.png" },
                            {
                                type: "choose",
                                options: ["立即去登记成绩", "我再逛逛"],
                                callbacks: [
                                    [
                                        { type: "changeMap", map: "Equipmentroom2", direction: "left" },
                                    ],
                                    [
                                        { type: "textMessage", text: "乒乓球老师：如果你需要去登记成绩的话的话，就再来找我。", facePlayer: "teacher_pingpang", head_src: "./asset/5.png" },
                                    ],
                                ],

                            },
                            { type: "addStoryFlag", flag: "forth" },
                            { type: "deleteStoryFlag", flag: "num_4" },
                        ],
                    },
                    {
                        required: ["pingpang", "day4", "cnm"],
                        img: "./asset/map/操场背景.jpg",
                        events: [
                            { type: "textMessage", text: "乒乓球老师：时代少年团我们喜欢你，我们喜欢马嘉祺丁程鑫宋亚轩，时代少年团我们喜欢你，刘耀文张真源严浩翔贺俊霖。", facePlayer: "teacher_pingpang", head_src: "./asset/5.png" },
                            { type: "textMessage", text: "乒乓球老师：请问你有什么事情吗？", facePlayer: "teacher_pingpang", head_src: "./asset/5.png" },
                            {
                                type: "choose",
                                options: ["立即去登记成绩", "我再逛逛"],
                                callbacks: [
                                    [
                                        { type: "changeMap", map: "Equipmentroom2" },
                                    ],
                                    [
                                        { type: "textMessage", text: "乒乓球老师：如果你需要去登记成绩的话的话，就再来找我。", facePlayer: "teacher_pingpang", head_src: "./asset/5.png" },
                                    ],
                                ],

                            },
                        ]
                    },
                    {
                        required: ["day4", "cnm"],
                        img: "./asset/map/操场背景.jpg",
                        events: [
                            { type: "textMessage", text: "我：你好，老师，我来参加乒乓球测试。", facePlayer: "teacher_pingpang", head_src: "./asset/player_head.png" },
                            { type: "textMessage", text: "乒乓球老师：你需要乒乓球拍才能完成测试。", facePlayer: "teacher_pingpang", head_src: "./asset/5.png" },
                        ],
                    },

                ]
            }),
        },
        wall: {
        },
        cutSceneSpaces: {
            [utils.asGridCoord(3, 31)]: [
                {
                    required: ["sb", "day2"],
                    events: [
                        { type: "changeMap", map: "Classroom_special" },
                        { type: "deleteStoryFlag", flag: "sb" },
                        { type: "jumpToTime", time: "17" },
                        { type: "textMessage", text: "我：终于下课了=w=,在日记里找找线索，看看今天去哪个地方探索吧！", head_src: "./asset/player_head.png" },
                    ]
                },
                {
                    required: ["sb", "day4"],
                    events: [
                        { type: "changeMap", map: "Classroom_normal_101" },
                        { type: "addStoryFlag", flag: "cnm" },
                        { type: "deleteStoryFlag", flag: "sb" },
                        { type: "jumpToTime", time: "15" },
                        { type: "textMessage", text: "我：今天提前下课了=w=,在日记里找找线索，看看今天去哪个地方探索吧！", head_src: "./asset/player_head.png" },
                    ]
                },
                {
                    required: ["sb", "day7"],
                    events: [
                        { type: "changeMap", map: "Testroom" },
                        { type: "deleteStoryFlag", flag: "sb" },
                        { type: "textMessage", text: "我：今天是期中测试，赶快到座位上坐好吧。", head_src: "./asset/player_head.png" },
                    ]
                },
                {
                    required: ["sb"],
                    events: [
                        { type: "changeMap", map: "Classroom_normal_101" },
                        { type: "deleteStoryFlag", flag: "sb" },
                        { type: "jumpToTime", time: "17" },
                        { type: "textMessage", text: "我：终于下课了=w=,在日记里找找线索，看看今天去哪个地方探索吧！", head_src: "./asset/player_head.png" },
                    ]
                },

                {
                    required: ["day"],
                    excepts: ["sb"],
                    events: [
                        { type: "changeMap", map: "Gate", position: { x: utils.withGrid(22), y: utils.withGrid(16), direction: "left" } },
                        { type: "timeLapse" },
                    ]
                },
                {
                    required: ["night"],
                    events: [
                        { type: "changeMap", map: "Gate_night", position: { x: utils.withGrid(22), y: utils.withGrid(16), direction: "left" } },
                        { type: "timeLapse" },
                    ]
                }
            ],
            [utils.asGridCoord(28, 33)]: [
                {
                    events: [
                        { type: "changeMap", map: "ER_hallway" },
                    ]
                }
            ],
            [utils.asGridCoord(11, 24)]: [
                {
                    events: [
                        { type: "textMessage", text: "前面的区域以后再探索吧！" },
                    ]
                }
            ],
            [utils.asGridCoord(12, 35)]: [
                {
                    events: [
                        { type: "textMessage", text: "一扇破旧的铁门，门上是一个六位密码锁", img_src: "./asset/输密码.png" },
                        { type: "textMessage", text: "门卫：在门口偷偷摸摸的干什么呢你，上一边去！" },
                        { type: "walk", who: "player", direction: "up" },
                        { type: "addStoryFlag", flag: "门卫室_宿舍剧情" }
                    ]
                },
            ]
        },
    },
    night_background: {
        id: "night_background",
        lowerSrc: "./asset/map/操场（黑夜）.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(3),
                y: utils.withGrid(31),
                isPlayerControlled: true,
            }),
        },
        wall: {
        },
        cutSceneSpaces: {
            [utils.asGridCoord(3, 31)]: [
                {
                    required: ["day"],
                    events: [
                        { type: "changeMap", map: "Gate", position: { x: utils.withGrid(22), y: utils.withGrid(16), direction: "left" } },
                        { type: "timeLapse" },
                    ]
                },
                {
                    required: ["night"],
                    excepts: ["day1"],
                    events: [
                        { type: "changeMap", map: "Gate_night", position: { x: utils.withGrid(22), y: utils.withGrid(16), direction: "left" } },
                        { type: "timeLapse" },
                    ]
                },
                {
                    required: ["day1"],
                    events: [
                        { type: "textMessage", text: "先去收拾宿舍吧！" },
                        { type: "walk", who: "player", direction: "right" },
                    ]
                },
            ],
            [utils.asGridCoord(28, 33)]: [
                {
                    required: ["day1"],
                    events: [
                        { type: "textMessage", text: "先去收拾宿舍吧！" },
                        { type: "walk", who: "player", direction: "down" },
                    ]
                },
                {
                    events: [
                        { type: "changeMap", map: "ER_hallway" },
                    ]
                }
            ],
            [utils.asGridCoord(11, 24)]: [
                {
                    excepts: ["midnight"],
                    required: ["day1"],
                    img: "./asset/背景/宿舍背景.jpg",
                    events: [
                        { type: "textMessage", text: "我：真幸运，咱们又分到了一个宿舍！", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "允儿：Ciallo～(∠・ω< )⌒★", head_src: "./asset/发小.png" },
                        { type: "textMessage", text: "..." },
                        { type: "textMessage", text: "..." },
                        { type: "textMessage", text: "夜深了" },
                        { type: "textMessage", text: "允儿：好渴好渴，这宿舍楼怎么连个饮水机都没有。", head_src: "./asset/发小.png" },
                        { type: "textMessage", text: "允儿：诶雪儿，我去买瓶水，马上回来。", head_src: "./asset/发小.png" },
                        { type: "textMessage", text: "我：这不好吧，我记得传言中十一点后学生是不能出门的诶。", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "允儿：没关系，买瓶水没什么问题，售货机不是很近嘛。", head_src: "./asset/发小.png" },
                        { type: "textMessage", text: "允儿：哎呀，你放心，我去去就来。", head_src: "./asset/发小.png" },
                        { type: "textMessage", text: "说罢，允儿转身出门了" },
                        { type: "textMessage", text: "..." },
                        { type: "textMessage", text: "..." },
                        { type: "textMessage", text: "过了许久，允儿还是没有回到宿舍" },
                        { type: "textMessage", text: "不安的情绪潜滋暗长，你开始想起学校里充斥的古怪规则，以及规则里提到的“惩罚”" },
                        { type: "textMessage", text: "那个“惩罚”可能没我想象中那么简单......" },
                        { type: "textMessage", text: "这时在宿舍角落的舍友神秘兮兮地说道:" },
                        { type: "textMessage", text: "舍友：她...她...多半是被“他们”发现了，你的朋友应...应该回不来了。", head_src: "./asset/女舍友.png" },
                        { type: "textMessage", text: "舍友：这个学校里有...有什么在维护规则，违背规则的人会...会受到“惩罚”。", head_src: "./asset/女舍友.png" },
                        { type: "textMessage", text: "你震惊到失声，半晌出不来一个字" },
                        { type: "textMessage", text: "舍友深呼吸，整理了下思绪说道：" },
                        { type: "textMessage", text: "舍友：我是从这所学校的初中部升上来的，这所学校的高中部有很多奇怪的规则，在这里你要绝对遵守规则 。", head_src: "./asset/女舍友.png" },
                        { type: "textMessage", text: "舍友：我有一个学长，在离开学校前，他交给我一本学生守则，里面记录了学生们口口相传的规则。", head_src: "./asset/女舍友.png" },
                        { type: "textMessage", text: "舍友：你是转校生，我想，你应该会更需要这个。", head_src: "./asset/女舍友.png" },
                        { type: "textMessage", text: "说罢，她从包里掏出一本泛黄皱巴的小册子递给我" },
                        { type: "textMessage", text: "获得要紧物事：学生守则", img_src: "./asset/学生手册.png" },
                        { type: "textMessage", text: "尚未从震惊中缓过来，你只能机械地驱动肉体去接过那本小册子" },
                        { type: "textMessage", text: "突如其来的信息虽然不多，但是引爆了你脑海中无数的猜测" },
                        { type: "textMessage", text: "这个学校的诡异规则是真实存在的，违背规则受到的惩罚远比想象中还要可怕，允儿也可能永远地消失了", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "“他们”是什么存在？十一点后的校园发生了什么？这里面的老师，我还能信任吗？", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "这里面的老师，我还能信任吗？在这个封闭式管理的学校，我能做些什么呢......", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "一番头脑风暴后，脉络逐渐清晰" },
                        { type: "textMessage", text: "我:已经出现了这么诡异的事件了，学校这么危险，看来我没法等到这个月结束学生放假再离开学校了。", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：我得逃离学校！越快越好！！！", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "这时你瞥见允儿的桌上，一本翻开的日记本，未干的字迹写着的满是她对新学校的期待" },
                        { type: "textMessage", text: "悲从中来，你抚摸着舍友的日记本，泪濡湿了眼眶" },
                        { type: "textMessage", text: "出于留念，你将发小的日记本，连同学生手册收在了包里" },
                        { type: "textMessage", text: "获得要紧物事：发小的日记本", img_src: "./asset/日记本.png" },
                        { type: "textMessage", text: "（提示：按R键可打开日记，按B键可打开学生手册）" },
                        { type: "textMessage", text: "..." },
                        { type: "textMessage", text: "..." },
                        { type: "textMessage", text: "一夜无梦" },
                        { type: "addStoryFlag", flag: "sb" },
                        { type: "sleep" },
                        { type: "textMessage", text: "我：新的一天开始了，该去上课了。", head_src: "./asset/player_head.png" },
                    ],
                },
                {
                    required: ["检测"],
                    excepts: ["midnight", "day1", "门卫室_宿舍剧情"],
                    img: "./asset/背景/宿舍背景.jpg",
                    events: [
                        {
                            type: "choose",
                            options: ["睡觉", "打游戏"],
                            callbacks: [
                                [{ type: "textMessage", text: "我：今天早点休息吧。", head_src: "./asset/player_head.png" },
                                { type: "addStoryFlag", flag: "sb" },
                                { type: "deleteStoryFlag", flag: "检测" },
                                { type: "sleep" },
                                { type: "textMessage", text: "我：新的一天开始了，该去上课了。", head_src: "./asset/player_head.png" },
                                ],
                                [{ type: "playGame", container: document.querySelector(".game-container"), toEmbed: "./mini-game/NumberPuzzle/puzzle.html" },
                                { type: "textMessage", text: "我：哎啦，不知不觉玩到这么晚了。", head_src: "./asset/player_head.png" },
                                { type: "textMessage", text: "我：该上床休息了。", head_src: "./asset/player_head.png" },
                                { type: "addStoryFlag", flag: "sb" },
                                { type: "deleteStoryFlag", flag: "检测" },
                                { type: "sleep" },
                                { type: "textMessage", text: "我：新的一天开始了，该去上课了。", head_src: "./asset/player_head.png" },
                                ]
                            ],
                        },
                    ]
                },
                {
                    required: ["门卫室_宿舍剧情", "检测"],
                    excepts: ["day1", "midnight"],
                    img: "./asset/背景/宿舍背景.jpg",
                    events: [
                        { type: "deleteStoryFlag", flag: "门卫室_宿舍剧情" },
                        { type: "textMessage", text: "我：今天到学校侧门去，被门卫训了一顿，真倒霉，我还想好好研究下密码锁呢。", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "舍友：我记得学校侧门只有一个老大爷看门，只有day7的晚上老大爷才会回家，你要研究那个密码门不如等到day7再去吧。", head_src: "./asset/女舍友.png" },
                        { type: "textMessage", text: "我：好吧，今天先睡吧。", head_src: "./asset/player_head.png" },
                        { type: "addStoryFlag", flag: "sb" },
                        { type: "deleteStoryFlag", flag: "检测" },
                        { type: "sleep" },
                        { type: "textMessage", text: "我：新的一天开始了，该去上课了。", head_src: "./asset/player_head.png" }
                    ]
                },
                {
                    excepts: ["day1", "midnight"],
                    img: "./asset/背景/宿舍背景.jpg",
                    events: [
                        {
                            type: "choose",
                            options: ["睡觉", "打游戏"],
                            callbacks: [
                                [{ type: "textMessage", text: "我：今天早点休息吧。", head_src: "./asset/player_head.png" },
                                { type: "gameover2" },
                                { type: "textMessage", text: "我：诶，怎么今天日期没有变化呢？", head_src: "./asset/player_head.png" },
                                { type: "textMessage", text: "我：我是忘记了什么重要的事情了吗？", head_src: "./asset/player_head.png" },
                                { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意" },
                                ],
                                [{ type: "playGame", container: document.querySelector(".game-container"), toEmbed: "./mini-game/NumberPuzzle/puzzle.html" },
                                { type: "textMessage", text: "我：哎啦，不知不觉玩到这么晚了。", head_src: "./asset/player_head.png" },
                                { type: "textMessage", text: "我：该上床休息了。", head_src: "./asset/player_head.png" },
                                { type: "gameover2" },
                                { type: "textMessage", text: "我：诶，怎么今天日期没有变化呢？", head_src: "./asset/player_head.png" },
                                { type: "textMessage", text: "我：我是忘记了什么重要的事情了吗？", head_src: "./asset/player_head.png" },
                                { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意" },
                                ]
                            ],
                        },
                    ]
                },
            ],
            [utils.asGridCoord(12, 35)]: [
                {
                    required: ["day1"],
                    events: [
                        { type: "textMessage", text: "似乎是学校的侧门" },
                        { type: "textMessage", text: "先去收拾宿舍吧！" },
                        { type: "walk", who: "player", direction: "up" },
                    ]
                },
                {
                    excepts: ["day7", "day1"],
                    events: [
                        { type: "textMessage", text: "一扇破旧的铁门，门上是一个六位密码锁", img_src: "./asset/输密码.png" },
                        { type: "textMessage", text: "门卫：在门口偷偷摸摸的干什么呢你，上一边去！" },
                        { type: "walk", who: "player", direction: "up" },
                        { type: "addStoryFlag", flag: "门卫室_宿舍剧情" }
                    ]
                },
                {
                    required: ["day7", "真结局"],
                    events: [
                        { type: "textMessage", text: "我：总算凑齐了密码，赶快输入试试吧！", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "请输入密码", img_src: "./asset/输密码.png" },
                        { type: "textMessage", text: "密码正确", img_src: "./asset/密码正确.png" },
                        { type: "changeMap", map: "Home", position: { x: utils.withGrid(14), y: utils.withGrid(6), direction: "down" } },
                        { type: "textMessage", text: "你醒了" },
                        { type: "textMessage", text: "你从家中醒来，休学一年，今天是你转到XX中学上学的第一天。", img_src: "./asset/早晨起床卧室背景.png" },
                        { type: "textMessage", text: "妈妈：瑞雪，快收拾收拾出门了，上学第一天可别迟到了。" },
                        { type: "textMessage", text: "我：好，妈妈，就来了。", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：都…都只是梦吗，怎么这么熟悉啊。", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：头好痛，但是，好像…好像有什么重要的事情——", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：对！学生会！", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "为什么学校会有这么多奇怪的规则？什么让学生们噤若寒蝉？", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我要加入学生会，亲眼看到这个学校的真相!", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "这时，你瞥见桌上有这一本和梦中一摸一样的日记" },
                        { type: "textMessage", text: "我(疑惑):妈，王允儿的日记怎么在我这里啊？", head_src: "./asset/女主（思考）.png" },
                        { type: "textMessage", text: "妈妈：什么王允儿？有这个人吗？" },
                        { type: "textMessage", text: "妈妈：傻孩子，这不是你自己的日记本吗？" },
                        { type: "textMessage", text: "沉默良久，若有所思" },
                        { type: "textMessage", text: "我:原来...允儿也是假的的吗，我从一开始就没有什么发小啊！", head_src: "./asset/女主（悲伤）.png" },
                        { type: "textMessage", text: "叹罢，把手机放进包里，就随妈妈出门上学了", img_src: "./asset/手机.png" },
                        { type: "textMessage", text: "到学校以后，你看到学校布告栏处有学生会招新，你决定全力以赴，进入学生会", img_src: "./asset/公告栏.png" },
                        { type: "textMessage", text: "在激烈的竞选过后，你如愿成为了学生会的一员", img_src: "./asset/公告栏.png" },//可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可可更新图片
                        { type: "textMessage", text: "穿上黑制服后，你能够安全地在十一点后的学校区域活动" },
                        { type: "textMessage", text: "你决定亲眼见证十一点以后会发生什么" },
                        { type: "changeMap", map: "night_background", position: { x: utils.withGrid(11), y: utils.withGrid(24), direction: "down" } },
                        { type: "textMessage", text: "十一点，夜" },
                        { type: "textMessage", text: "我：出发吧，我要亲眼见证这座校园的真相。", head_src: "./asset/player_head.png" },
                        { type: "changeMap", map: "Gallery_1st", position: { x: utils.withGrid(30), y: utils.withGrid(6), direction: "up" } },
                        { type: "textMessage", text: "当你从厕所门前经过时" },
                        { type: "textMessage", text: "厕所里传来异样的声响" },
                        { type: "textMessage", text: "王元：你！去给我买包芙蓉王回来！", head_src: "./asset/王元.png" },
                        { type: "textMessage", text: "顶针：我不抽传统香烟，你给我带根锐刻五吧。", head_src: "./asset/顶针.png" },
                        { type: "textMessage", text: "雪宝（委屈）：在学校里抽烟是不对的。", head_src: "./asset/流泪图.png" },
                        { type: "textMessage", text: "顶针：雪宝闭嘴！让你说话了吗？", head_src: "./asset/顶针.png" },
                        { type: "textMessage", text: "只听见“啪”的一声，似乎雪宝被抽了一巴掌" },
                        { type: "textMessage", text: "王元：你记住了，一包芙蓉王，还有锐刻五", head_src: "./asset/王元.png" },
                        { type: "textMessage", text: "顶针：听懂了吗？一！五！现就就去买！", head_src: "./asset/顶针.png" },
                        { type: "textMessage", text: "......" },
                        { type: "textMessage", text: "至此，规则的真相浮现" },
                        { type: "textMessage", text: "学生会晚上十一点后会霸凌同学，你掏出手机，默默记录下罪证，不发出声响地离开了" },
                        { type: "changeMap", map: "ending", position: { x: utils.withGrid(10), y: utils.withGrid(6), direction: "down" } },
                        { type: "textMessage", text: "然后你找到机会，向警察👮‍♀️提交了证据", img_src: "./asset/警察局.jpg" },
                        { type: "textMessage", text: "警方介入，查清了学生会的罪行，曾经被霸凌过的同学也逐渐站出来指证", img_src: "asset/起义.jpg" },
                        { type: "textMessage", text: "弱者们鼓起勇气，联合起来，同霸凌者对抗，一呼百应", img_src: "asset/起义.jpg" },
                        { type: "textMessage", text: "最后，涉事成员被学校予以退学处置并受到了法律的制裁", img_src: "asset/警方通告.jpg" },
                        { type: "textMessage", text: "令人唏嘘的是，在退学名单里，还有曾经遭受霸凌的人" },
                        { type: "textMessage", text: "她们为了不被霸凌，而成为了霸凌者，为了苟活，向“它们”屈服，成为了“恶”的帮凶" },
                        { type: "walk", who: "player", direction: "down" },
                        { type: "walk", who: "player", direction: "down" },
                        { type: "walk", who: "player", direction: "down" },
                        { type: "walk", who: "player", direction: "down" },
                        { type: "walk", who: "player", direction: "down" },
                        { type: "walk", who: "player", direction: "down" },
                        { type: "walk", who: "player", direction: "down" },
                        { type: "walk", who: "player", direction: "down" },
                        { type: "walk", who: "player", direction: "down" },
                        { type: "textMessage", text: "勇者愤怒，抽刃向更强者；弱者愤怒，却抽刃向更弱者" },
                        { type: "textMessage", text: "那些家伙被清退的当天，学校飘起了鹅毛雪", img_src: "./asset/瑞雪.png" },
                        { type: "textMessage", text: "“银装素裹，分外妖娆”", img_src: "./asset/瑞雪.png" },
                        { type: "textMessage", text: "雪花飘落在手上，不觉冰冷，倒平添几分温暖", img_src: "./asset/瑞雪.png" },
                        { type: "textMessage", text: "久违的笑容在瑞雪的脸上舒展开来", img_src: "./asset/瑞雪.png" },
                        { type: "textMessage", text: "瑞雪抬头看了看天，感叹道：", img_src: "./asset/瑞雪.png" },
                        { type: "textMessage", text: "真是瑞雪兆丰年啊", img_src: "./asset/瑞雪.png" },
                        { type: "setAchievement", text: "获得成就：瑞雪兆丰年", img_src: "../achv/image/12.jpg", achievement: "瑞雪兆丰年" },
                        { type: "textMessage", text: "无法打破心魔的人，只会永远困于轮回" },
                        { type: "textMessage", text: "“领教跳出轮回网，致使齐天大圣威”" },
                        { type: "textMessage", text: "感谢游玩" },
                        { type: "textMessage", text: "你怎么知道我买了黑猴工作室" },
                        { type: "pass" }
                    ]
                },
                {
                    required: ["day7"],
                    events: [
                        { type: "textMessage", text: "我：总算凑齐了密码，赶快输入试试吧！", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "请输入密码", img_src: "./asset/输密码.png" },
                        { type: "textMessage", text: "密码正确", img_src: "./asset/密码正确.png" },
                        { type: "changeMap", map: "Home", position: { x: utils.withGrid(14), y: utils.withGrid(6), direction: "down" } },
                        { type: "textMessage", text: "你醒了" },
                        { type: "textMessage", text: "你从家中醒来，休学一年，今天是你转到XX中学上学的第一天。", img_src: "./asset/早晨起床卧室背景.png" },
                        { type: "textMessage", text: "妈妈：瑞雪，快收拾收拾出门了，上学第一天可别迟到了。" },
                        { type: "textMessage", text: "我：好，妈妈，就来了。", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：都…都只是梦吗，怎么这么熟悉啊。", head_src: "./asset/player_head.png" },
                        { type: "setAchievement", text: "获得成就：无尽的轮回", img_src: "../achv/image/10.jpg", achievement: "无尽的轮回" },
                        { type: "textMessage", text: "Tips:日记是十分重要的线索，还请多多留意", img_src: "./asset/gameover.png" },
                        { type: "gameover" },
                    ]
                }
            ]
        },
    },
    maze: {
        id: "maze",
        lowerSrc: "./asset/map/迷宫.png",
        configObjects: {
            player: ({
                id: "player",
                type: "Person",
                x: utils.withGrid(3),
                y: utils.withGrid(5),
                isPlayerControlled: true,
            }),
        },
        cutSceneSpaces: {
            [utils.asGridCoord(31, 21)]: [
                {
                    events: [
                        { type: "changeMap", map: "night_background", position: { x: utils.withGrid(28), y: utils.withGrid(33), direction: "down" } },
                        { type: "jumpToTime", time: "23" },
                        { type: "textMessage", text: "(这迷宫，怎么在器材室的地下啊，不对劲......)", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "可正在此时，学校十一点的钟声响起，紧张与不安涌上心头。" },
                        { type: "textMessage", text: "我：糟糕，都这个点了，宿舍肯定锁门，回不去了！", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：冷静点，瑞雪，快想想，还有哪里能够躲开“他们”，还有哪里是安全的......", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：对了！自习室。", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我:记得规则里说过：在24小时自习室，不需要担心任何问题。请把自己全部身心投入学习之中。任何人都不能妨碍在此区域进行学习的学生。", head_src: "./asset/player_head.png" },
                        { type: "textMessage", text: "我：死马当活马医，现在只能去自习室避一避了。", head_src: "./asset/player_head.png" },
                    ]
                }
            ],
        }
    }
}