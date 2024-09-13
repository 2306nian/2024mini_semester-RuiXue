let globalTimer = null;

class Timer{
    constructor(container, overworld){
        this.day = 1;
        this.time = 6;
        this.element = null;
        this.container = container;
        this.san = null;
        this.overworld = overworld || null;
        globalTimer = this; 
    }

    getTime() {
        return {
            day: this.day,
            time: this.time
        };
    }



    creatElement(){
        this.element = document.createElement("div");
        this.element.classList.add("Timer");

        this.element.innerHTML = (`
            <p class="Timer_p">day${this.day} ${this.time} : 00</p>
        `);
        
        this.container.appendChild(this.element);
    }

    update(){
        if (window.playerState.storyFlags["midnight"]){
            return;
        }
        this.time += 1;
        if (this.time >= 23) {
            while (this.time>23) this.time--;
            if (this.element) this.clear();
            if (this.san === null){
                console.log("create a new san");
                window.playerState.storyFlags["midnight"] = true;
                this.san = new San(this.container, this.overworld);
                this.san.init();
            }
        }
        
        if (!this.element && this.time <23) this.creatElement();
        if (this.element){
            const timeElement = this.element.querySelector(".Timer_p");
            if (timeElement){
                timeElement.textContent = `day${this.day} ${this.time} : 00`;
            }
        }
    }

    changeday(){
        this.day += 1;
        delete window.playerState.storyFlags[`day${this.day-1}`];
        window.playerState.storyFlags[`day${this.day}`] = true;
        this.overworld.progress.save();
    }

    clear(){
        this.element.remove();
    }

    init(){
        this.creatElement();
        if (this.day === 1) window.playerState.storyFlags["day1"] = true;
    }
    //获取时间
    

}