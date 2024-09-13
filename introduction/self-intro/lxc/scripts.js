document.addEventListener("DOMContentLoaded", function() {
    // 移除页面加载动画
    document.body.classList.remove('loading');

    // 平滑滚动效果
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth'
            });
        });
    });
});

// 页面加载动画
window.onload = function() {
    document.body.classList.remove('loading');
};


// 可选：监听滚动事件，当技能部分进入视野时触发动画
document.addEventListener("DOMContentLoaded", function() {
    const skillSection = document.getElementById('skills');
    const skills = document.querySelectorAll('.skill-level');
    let skillsAnimated = false;

    function animateSkills() {
        skills.forEach(skill => {
            const width = skill.style.width;
            skill.style.width = '0';
            setTimeout(() => {
                skill.style.width = width;
            }, 100);
        });
        skillsAnimated = true;
    }

    function checkSkillsInView() {
        const rect = skillSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight && !skillsAnimated) {
            animateSkills();
        }
    }

    window.addEventListener('scroll', checkSkillsInView);
});
