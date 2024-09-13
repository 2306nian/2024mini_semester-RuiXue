window.onload = () => {
    let file = window.localStorage.getItem("RuiXue_Achievements");
    if (file) {
        file = JSON.parse(file);

        let achievement = file.achievement;
        console.log(achievement);

        var achievementItems = document.querySelectorAll(".item");
        console.log(achievementItems);

        for (let i = 0; i < achievementItems.length; i++) {
            let achievementItem = achievementItems[i];
            let stateElement = achievementItem.querySelector(".achievement-state");

            let h1Element = achievementItem.querySelector(".frame .box.front h1");
            //原来的：let h1Element = document.querySelector(".frame .box.front h1");
            let h1Text = h1Element.innerText;
            console.log(h1Text);

            stateElement.innerHTML = (achievement[h1Text]) ? "已达成" : "未达成";

        }
    }
}
    