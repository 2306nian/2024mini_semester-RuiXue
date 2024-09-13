class ChooseMenu {
    constructor(overworld, options, callbacks, onComplete) {
        this.map = overworld.map;
        this.options = options;
        this.callbacks = callbacks;
        this.onComplete = onComplete;
    }

    getOptions(pageKey) {
        if (pageKey === "root") {
            console.log(this.options);
            return [
                {
                    label: this.options[0],
                    handler: async () => {
                        //
                        this.close();
                        await utils.wait(100);
                        console.log("change true");
                        this.map.isCutscenePlaying = true;
                        this.map.startCutscene(this.callbacks[0]);
                        
                    }
                },

                {
                    label: this.options[1],
                    handler: async () => {
                        this.close();
                        await utils.wait(100);
                        console.log("change true");
                        this.map.isCutscenePlaying = true;
                        this.map.startCutscene(this.callbacks[1]);
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
             <h2>Choose Menu</h2>
        `)
    }

    close() {
        this.keyboardMenu.end();
        this.element.remove();
        this.onComplete();
    }

    async init(container) {
        this.createElement();
        this.map.isCutscenePlaying = true;
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container,
        });
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions("root"));

        container.appendChild(this.element);
    }
}