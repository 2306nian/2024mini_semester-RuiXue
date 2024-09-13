class Rules{
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.element = null;
      }
    
      createElement() {
        //Create the element
        this.element = document.createElement("div");
        this.element.classList.add("Diary");
        
        this.element.innerHTML = (`
          <p class="Diary_p">
学生总则<br>
<br>
你好，无论你从何处看到本守则，请仔细阅读，这会对你的校园生活有很大帮助。<br>
<br>
1.你是人，是能看懂文字的人，是能独自思考的人。<br>
2.没有人不会犯错，所以只有人才具有违反规则的能力，仅仅遵守规则很难真正地□□□□。<br>
3.请保持人该有的判断力，不是每条规则都不应该遵守的。<br>
4.不要离开□□，没有人可以离开□□，人是不可以离开□□的。<br>
5.宿舍是绝对危险的，不论□□□□□，都不要回到□□，在夜晚，和□□□一起□□，加入美好的□□。<br>
6.当你遵守规则时，是不会被“□□”发现的，“□□”只会把你当成自己的同类，但是你不要真的变成“□□”<br>
7.身穿黑色制服的人是学生会，他们绝对遵守规则，并且绝对维护规则，只有学生会才能在晚上十一点后活动。<br>
□、规□□□□条是假的，保持谨慎！别太相信□□□，□□□□□值得信任，□□□□离开□□□□□□<br>
8、此规则只有8条，当你看到其他规则，不要相信！<br>
<br>
最后，诚挚的祝福您，努力活下去。<br>
<br>
教室规则<br>
<br>
1.晚上教室会遇见回来取东西的老师，不要回答她的任何问题。<br>
2.不要锁门<br>
3.若出现非黑色服装的人员进入教室检查，不要回答他的任何问题并迅速撤离教室。少时方可进入<br>
<br>
食堂规则：<br>
<br>
1.本学校只有一个食堂，因位于学校的西边，所以叫西食堂……如果有同学提起见到了其他食堂存在，无视他。<br>
2.本食堂为自选制，同学或老师可以自行选择窗口购买饭菜，学校食堂不会强行限制您的饮食挑选，如果有老师或自称学生会的同学组织你前往指定位置打饭，拒绝他。<br>
3.本学校食堂开放时间为每天早上6:00至晚上8:00，晚上八点之后请不要来食堂，这里是寒冷且不安全的。<br>
4.请勿将食堂内的食物带离食堂，维持学校的清洁卫生。<br>
<br>
体育课规则： <br>
<br>
1.你必须完成所有的事项才能离开操场<br>
2.操场上的人都很看重次序<br>
3.体育老师们都很没耐心，请不要过多与他们对话<br>
<br>
图书馆规则<br>
<br>
1.	为了确保图书管理员的工作效率，图书馆一次只允许借阅一本书，否则会被图书管理员驱逐，如要借阅多本，请分多次借阅。<br>
2.	没有阅览证不得翻阅对应书架的书籍。<br>
3.请不要翻阅黑色封面的书籍，图书馆里并没有这类书。<br>
4.图书馆开馆时间为每早7:00，闭馆时间为23:00。如有重要的任务未完成，请移步到24小时自习室。<br>
5. 祝您在图书馆能尽善尽美地完成学习、工作任务。<br>
6.不要拒绝身穿红衣服的人提出的要求，尽可能地安定它的情绪。<br>
7.只有与图书相关的问题可以相图书管理员提问。<br>
<br>
《附录:24小时自习室须知》<br>
<br>
1.欢迎来到24小时自习室。这是全校唯一可以提供24小时学习的地点。<br>
2尽管学生学习热情高涨，但24小时学习区座位十分充足，至今为止从未出现过满员情况。即便如此，落座之前请检查自己的座位是否有占座标志。如果有，无论该座位当前是否有人，都请主动更换座位。<br>
3.23:00之后，24小时自习室是图书馆唯一开放的公共区域。此时寝室大门已经关闭，进入此区域的同学不得在早于第天早晨5:30之前离开此区域。自习区设有可以放低靠背的舒适椅子，以便学生在疲惫时休息。（占座后）23:00之后，除24小时自习室之外，任何其他区域都不会有其他学生。<br>
4.不要和任何和你一同寻找自习室的同学搭请把自己全部身心投入学习之中。任何人都不能妨碍在此区域进行学习的学生。<br>
          </p>
          <button style="right: 2px" class="Diarybutton">Escape</button>
        `)
    
        this.element.querySelector("button").addEventListener("click", () => {
          //Close the text message
          this.done();
        });
    
        this.actionListener = new KeyPressListener("Escape", () => {
          this.done();
        })
    
      }
  
      done() {
          this.element.remove();
          this.actionListener.unbind();
          this.onComplete();
      }
    
      init(container) {
        this.createElement();
        container.appendChild(this.element);
      }
}