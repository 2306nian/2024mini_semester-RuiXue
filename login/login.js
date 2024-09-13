window.onload = function () {
    const loginText = document.querySelector(".title-text .login_title");
    const loginForm = document.querySelector("form.login");
    const loginBtn = document.querySelector("label.login");
    const signupBtn = document.querySelector("label.signup");
    signupBtn.onclick = (() => {
        loginForm.style.marginLeft = "-50%";
        loginText.style.marginLeft = "-50%";
    });
    loginBtn.onclick = (() => {
        loginForm.style.marginLeft = "0%";
        loginText.style.marginLeft = "0%";
    });
};


function log() {
    let logUN = document.getElementById('login_UN').value;
    let logPW = document.getElementById('login_PW').value;
    //判断用户是否输入数据
    if (logUN === "" || logPW === "") {
        alert("请输入您的用户名或密码");
    } else {
        //判断用户名是否已经注册
        if ("Sec-Sight-" + logUN in localStorage) {
            //如果已经注册，获取用户密码
            let password = localStorage["Sec-Sight-" + logUN];
            //判断用户输入的密码和 注册的密码是否一致
            if (logPW === password) {
                alert("登录成功！");
                document.getElementById('login_UN').value = "";
                document.getElementById('login_PW').value = "";
                localStorage.setItem("Sec-Sight-current-username", logUN);
                window.open('../main/main.html','_self');
            } else {
                alert("密码错误");
                document.getElementById('logPW').value = "";
            }
        } else {
            alert("用户不存在，请先注册！");
        }
    }
}

function reg() {
    const loginBtn = document.querySelector("label.login");
    const signupBtn = document.querySelector("label.signup");

    let username = document.getElementById('signup_UN').value;
    let password1 = document.getElementById('signup_PW1').value;
    let password2 = document.getElementById('signup_PW2').value;  // Corrected ID

    if (username === "" || password1 === "" || password2 === "") {
        alert("请输入您的用户名或密码");
    } else {
        // 判断用户名是否已经存在
        if ("Sec-Sight-" + username in localStorage) {  // Corrected check for existing username
            alert("用户已经存在了，换一个试试吧");
            document.getElementById('signup_UN').value = "";  // Corrected clearing input fields
            document.getElementById('signup_PW1').value = "";
            document.getElementById('signup_PW2').value = "";
        } else if (password1 !== password2) {
            alert("您输入的两次密码不一样");
        } else {
            // 如果不存在，则将用户名和密码存到网页中
            localStorage.setItem("Sec-Sight-" + username, password1);
            alert("注册成功");
            loginBtn.click();
        }
    }
}
