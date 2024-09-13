class PauseMenu {
    constructor({ progress, onComplete }) {
        this.progress = progress;
        this.onComplete = onComplete;
    }

    getOptions(pageKey) {
        if (pageKey === "root") {
            return [
                {
                    label: "保存",
                    description: "保存你的进度",
                    handler: () => {
                        //
                        this.progress.save();
                        this.close();
                    }
                },

                // saveFile ? {
                //     label: "下载",
                //     description: "重新开始你的冒险",
                //     handler: () => {
                //         this.esc?.unbind();
                //         this.keyboardMenu.end();
                //         this.element.remove();
                //         this.onComplete(true);

                //         let oldcanvas = document.querySelector(".game-canvas");
                //         oldcanvas.remove();

                //         //尝试清楚原先的eventListener
                //         // let oldGameContainer = document.querySelector(".game-container");
                //         // let newGameContainer = oldGameContainer.cloneNode(true);
                //         // oldGameContainer.remove();
                //         // document.body.appendChild(newGameContainer);

                //         let canv = document.createElement('canvas');
                //         canv.classList.add("game-canvas");
                //         document.querySelector(".game-container").appendChild(canv);
                //         canv.height = 500;
                //         canv.width = 800;

                //         const overworld = new Overworld({
                //             element: document.querySelector(".game-container")
                //         });
                //         window.overworld = overworld;
                //         overworld.init({
                //             forbidTitleScreen: true,
                //             useSaveFile: true,
                //         });

                //     }
                // } : null,
                // {
                //     label: "存档",
                //     description: "查看存档或者覆盖存档",
                //     handler: () => {
                //         this.progress.setWhereToContinue();
                //         this.close();
                //         window.open("../save system/save.html", '_self');
                //     }
                // },
                // {
                //     label: "成就",
                //     description: "查看你已经完成的成就",
                //     handler: () => {
                //         this.progress.setWhereToContinue();
                //         this.close();
                //         window.open(".", '_self');
                //     }
                // },
                {
                    label: "主页面",
                    description: "返回主页面",
                    handler: () => {
                        this.close();
                        window.open("../main/main.html", '_self');
                    }
                },
                {
                    label: "关闭",
                    description: "关闭暂停菜单",
                    handler: () => {
                        this.close();
                    }
                }
            ]
        }
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("PauseMenu");
        this.element.classList.add("overlayMenu");
        this.element.innerHTML = (`
            <h2>Pause Menu</h2>
        `)
    }

    close() {
        this.esc?.unbind();
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

        utils.wait(200);
        this.esc = new KeyPressListener("Escape", () => {
            this.close();
        });
    }
}