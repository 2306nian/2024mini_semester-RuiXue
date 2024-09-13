class San{
    constructor(container, overworld){
        this.san = 100;
        this.safe = false;
        this.intervalId = null;
        this.container = container;
        this.overworld = overworld;
        console.log(this.overworld)
    }

    creatElement(){
        this.element = document.createElement("div");
        this.element.classList.add("Timer");

        this.element.innerHTML = (`
            <p class="Timer_p">${this.san}</p>
        `);
        
        this.container.appendChild(this.element);
    }

    async update(){
        this.san -= 1;
        if (this.san <= 0){
            this.clear();
            this.overworld.timer.creatElement();
            this.overworld.timer.san = null;
            this.overworld.map.startCutscene([{type: "gameover"}]);
        }
        if (this.element){
            const SanElement = this.element.querySelector(".Timer_p");
            if (SanElement){
                SanElement.textContent = `${this.san}`;
            }
        }
    }

    clear(){
        clearInterval(this.intervalId);
        this.san = 100;
        this.intervalId = null;
        this.element.remove();
    }

    init(){
        this.creatElement();
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = setInterval(() => {
                this.update();
        }, 1000);
    }
}