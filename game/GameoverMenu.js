class GameoverMenu {
    constructor( overworld, onComplete ) {
        this.overworld = overworld;
        this.onComplete = onComplete;
    }

    getOptions(pageKey) {
        if (pageKey === "root") {
            return [
                {
                    label: "重新开始",
                    description: "重新开始",
                    handler: () => {
                        this.close();
                        const sceneTransition = new SceneTransition();
                        sceneTransition.init(document.querySelector(".game-container"), async () => {
                            console.log(this.overworld)
                            this.overworld.progress.load();
                            let initialHeroState = {
                                x: this.overworld.progress.startingHeroX,
                                y: this.overworld.progress.startingHeroY,
                                direction: this.overworld.progress.startingHeroDirection,
                            }
                            this.overworld.timer.time = this.overworld.progress.gametime.time-1;
                            this.overworld.timer.update();
                            this.overworld.timer.day = this.overworld.progress.gametime.day;
                            this.overworld.startMap(window.OverworldMaps[this.overworld.progress.mapId], initialHeroState );
                            sceneTransition.fadeOut();
                        })
                    }
                },
                {
                    label: "成就",
                    description: "查看你已经完成的成就",
                    handler: () => {
                        this.close();
                        window.open("../achv/achv.html", '_self');
                    }
                },
                {
                    label: "主页面",
                    description: "返回主页面",
                    handler: () => {
                        this.close();
                        window.open("../main/main.html", '_self');
                    }
                },
            ]
        }
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("PauseMenu");
        this.element.classList.add("overlayMenu");
        this.element.innerHTML = (`
            <h2><strong>Game Over</strong></h2>
        `)
    }

    close() {
        this.keyboardMenu.end();
        this.element.remove();
        this.onComplete();
    }

    async init(container) {
        this.createElement();
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container,
        });
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions("root"));

        container.appendChild(this.element);

    }
}