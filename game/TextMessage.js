class TextMessage {
    constructor({ text, onComplete, head_img_src, img_src}) {
      this.text = text;
      this.onComplete = onComplete;
      this.element = null;
      this.image = null;
      this.head_img_src = head_img_src || null;
      this.img_src = img_src || null;

    }
  
    createElement() {
      //Create the element
      this.element = document.createElement("div");
      this.element.classList.add("TextMessage");
      
      if (this.head_img_src){
        this.element.innerHTML = (`
          <p class="TextMessage_p"></p>
          <img class="TextMessage_head_image" src=${this.head_img_src}>
          <button style="right: 4px;" class="TextMessage_button">Next</button>
        `)
      }else{
        this.element.innerHTML = (`
          <p class="TextMessage_p"></p>
          <button style="right: 4px" class="TextMessage_button">Next</button>
        `)
      }
      

      //Init the typewriter effect
      this.revealingText = new RevealingText({
        element: this.element.querySelector(".TextMessage_p"),
        text: this.text
      })
  
      this.element.querySelector("button").addEventListener("click", () => {
        //Close the text message
        this.done();
      });
  
      this.actionListener = new KeyPressListener("Space", () => {
        this.done();
      })
  
    }

    createImage(){
      this.image = document.createElement("img");
      this.image.classList.add("TextMessage_image");
      this.image.src = this.img_src;
    }
  
    done() {
  
      if (this.revealingText.isDone) {
        this.element.remove();
        if (this.image) this.image.remove();
        this.actionListener.unbind();
        this.onComplete();
      } else {
        this.revealingText.warpToDone();
      }
    }
  
    init(container) {
      this.createElement();
      container.appendChild(this.element);
      if (this.img_src){
        this.createImage();
        container.appendChild(this.image);
      }
      this.revealingText.init();
    }
  
  }