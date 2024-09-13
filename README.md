# README

## 引言

### 简介：

本项目为北京理工大学2024学年大二小学期“互联网应用基础”课程 “你怎么知道我买了黑猴组” 大作业，是一款以校园怪谈为主题的探索解谜类RPG。本项目采用HTML、CSS及JS等网页前端技术进行开发，开发时间为三周，新人首作，尚有诸多瑕疵，还望海涵。

### 特点：

项目使用纯前端技术完成底层架构设计、平面布局设计。设计思路根据面向对象原则，优先完成游戏底层功能实现并向流程组提供接口，在overworldMap.js文件中实现高自由度的地图及流程自定义开发。

项目根据YouTube视频https://www.youtube.com/watch?v=fyi4vfbKEeo&list=PLcjhmZ8oLT0r9dSiIK6RB_PuBWlG1KSq_改造开发，借助自主开发的时间系统将原本的网状剧情结构改为线性推进，同时给予玩家足够自由度进行地图探索。借助面向对象及完善的接口设计，本项目设计了丰富的交互选项，极大地增强了游戏的沉浸感和游戏性。此外，为适配各种分辨率的显示器，CSS平面设计上采用了响应式设计，优化了各种情况下的显示效果。

除游玩外，本项目也可作为微型引擎进行2DRPG开发，在./game/overworldMap.js中更改window.overworldmap即可自定义游戏地图及交互，在./game/overworldEvent.js中可自定义游戏事件，但功能和格式上限制较多，亟待优化。

## 安装步骤及架构

### 安装步骤：

解压即用，游戏目录下点击index.html即可在浏览器中打开。

### 架构：
```
├── .vscode
│   └── settings.json
├── achv
│   ├── achv.css
│   ├── achv.html
│   ├── achv.js
│   ├── image
│   │   ├── 01.jpg
│   │   ├── ....
│   └── save.css
│   ├── .github
│   ├── .gitignore
│   ├── assets
├── game
│   ├── asset
│   │   ├── 1.png
│   │   ├── ...
│   ├── ChooseMenu.js
│   ├── Diary.js
│   ├── DirectionInput.js
│   ├── GameObjects.js
│   ├── GameoverMenu.js
│   ├── index.html
│   ├── init.js
│   ├── KeyboardMenu.js
│   ├── KeyPressListener.js
│   ├── mini-game
│   │   └── NumberPuzzle
│   │       ├── puzzle.html
│   │       ├── ...
│   ├── Overworld.js
│   ├── OverworldEvent.js
│   ├── OverworldMap.js
│   ├── PauseMenu.js
│   ├── Person.js
│   ├── Progress.js
│   ├── RevealingText.js
│   ├── Rules.js
│   ├── San.js
│   ├── SceneTransition.js
│   ├── Sprite.js
│   ├── state
│   │   └── PlayerState.js
│   ├── style
│   │   ├── Diary.css
│   │   ├── global.css
│   │   ├── KeyboardMenu.css
│   │   ├── Menus.css
│   │   ├── SceneTransition.css
│   │   ├── TextMessage.css
│   │   ├── Timer.css
│   │   └── toEmbed.css
│   ├── TextMessage.js
│   ├── Timer.js
│   └── utils.js
├── index.html
├── introduction
│   ├── css
│   ├── images
│   ├── index.html
│   ├── js
│   └── self-intro
├── login
│   ├── background.jpg
│   ├── login.css
│   ├── login.html
│   └── login.js
├── main
│   ├── background.jpg
│   ├── main.css
│   └── main.html
├── music-player
│   ├── music
│   ├── music-player.css
│   └── music-player.js
├── save system
│   ├── archive.js
│   ├── Progress.js
│   └── save.css
└── webfonts
```

游戏主目录下index.html为根页面，登录后跳转至main.html，游戏页面为game文件夹下index.html；

init.js为main函数，页面加载后自动运行；

主循环在overworld.js文件中，该文件为游戏全局控制器，初始化存档、计时器、地图、位置检测、键盘监听等基本功能；

OverworldMap.js为地图类及地图制作器，完成了全局事件处理、交互事件处理、碰撞体积检测、canvas图片及sprite渲染等功能。文件中的window.OverworldMaps为地图编辑器，储存了游戏中所有的地图及其包含的npc、事件及交互选项。通过进行window.OverworldMaps的编辑，我们可以实现低门槛的自定义地图创作，本作也主要以该方式完成流程搭建；

OverworldEvent.js为交互事件控制器，对于每个events事件簇，overworldMap将创建一个OverworldEvent类型的事件控制器以完成交互事件。OverworldEvent类中的成员函数即为所有可进行的事件，包括地图跳转（changeMap)、文本展示(textMessage)、强制移动(walk)等等。开发者也可根据自身需要在其中添加事件。

GameObject.js及Person.js为游戏人物及交互物品类，定义了人物（包括主角）的运动控制、碰撞体积、动作执行逻辑等基本功能；

其余源码文件为额外游戏组件，如计时器（Timer)、菜单(ChooseMenu、GameoverMenu、PauseMenu)等；

## 技术栈

### 主循环

主循环设计为一个递归调用自身的函数step()，原定为以requestAnimationFrame()函数进行定时递归调用，但由于在不同刷新率电脑上会导致人物行为速度（由帧率决定）的不同，故改为setTimeout()进行定时递归调用。主循环中包含了每帧canvas重渲染，时间检测（可挪至Timer.js中），npc及人物行为更新，位置及自动交互检测功能，实现了架构主干的搭建。

### 地图及事件

OverworldMap类构造函数的参数由参数表改为config键值对，避免了后续扩展模块时频繁更改参数表导致不可预测的问题，拥有更强的解耦合性；

Cutscene意指交互事件，根据触发方式分为三类ActionCutscene、FootstepCutscene、ForcedCutscene。

ActionCutscene监控键盘Space输入，触发后检测玩家前方是否有交互对象，并根据条件对交互对象的事件列表进行筛选，对第一个符合条件的事件簇events执行startCutscene函数；

FootstepCutscene监听由Person发出的PersonWalkingComplete事件广播，广播发出时检测地图的CutsceneSpace成员，对匹配当前玩家坐标的空间根据条件筛选其事件列表，对第一个符合条件的事件簇执行startCutscene函数；

ForcedCutscene在每个step中监控window.playerState.storyFlags键值对状态，并匹配筛选符合当前flag条件的第一个事件并执行startCutscene函数，实现在满足条件时不需要玩家移动或操作而进行自动触发的强制事件；

startCutscene函数首先判断传入事件簇有无背景图片（img）需求，如有则设置游戏状态为暂停保留当前游戏进程，清空canvas并重绘为背景图片（img），接着在此基础上对事件簇events中的每个event按顺序创建OverworldEvent实例，由该实例异步处理事件，用await及promise实现上一个事件执行结束后切换下一个事件，实现事件簇高自由度定义，为流程组提供了更大的发挥空间；

OverworldEvent不同于以往的单纯对事件代码进行执行，转而采用了

`return new Promise(resolve => {this[this.event.type](resolve)})`的代码块，在目标事件函数的回调函数`resolve()`执行后抛出promise给上层startCutscene函数进行下一步；该方式实现了resolve回调函数的层层传递，在`choose(resolve)`及`pause(resolve)`等需要嵌套不同类的实例的情况下，只需将resolve回调函数作为onComplete回调函数传入所需的类即可完成线程安全的嵌套，是本项目中高解耦合性的重要体现。

### 玩家控制

与OverworldMap类似，Person及GameObject类的构造函数同样传入一个config键值对参数表进行初始化。Person的行走动画根据当前行走状态，由Sprite类对图像素材进行不同方式的裁剪实现；

movingProgressRemaining是角色行动的关键属性，startBehavior、updatePosition、updateSprite等函数通过对movingProressRemaining的检测判断当前人物是否在运动，进而执行不同的更新逻辑。碰撞体积及检测通过检测intentPosition上是否存在有碰撞体积的物体实现。

startBehavior中仅有两个动作walk及stand，通过发布事件"PersonStandComplete"、"PersonWalkingComplete"实现与OverworldEvent模块的通讯；控制上由`document.addEventListener("keydown",...)`封装在KeyPressListener实现，键盘输入作为state.arrow参数输入Person.update函数；

### 时间轴及StoryFlags系统

StoryFlags为一个窗口下的全局键值对字典，标志了游戏进程和玩家已满足的条件，通过required和excepts两个事件簇的附加参数，startCutscene函数能自动匹配满足条件的事件，从而实现对同一npc或在相同地图的相同坐标下完成不同的交互，在window.OverworldMaps中呈现了高度解耦合的类似if else的功能；

window.playerState.StoryFlags可以通过addStoryFlags和deleteStoryFlags事件进行修改；

Timer类为游戏特色的时间轴系统的逻辑实现，通过检测day的值向StoryFlags中自动添加和移除天数标签，实现游戏在相同空间下能够完成线性的剧情流程而不需要频繁切换大背景，同时允许流程组给玩家提供额外通关路径和自由探索能力，增强了游戏的沉浸感和玩法多样性。

## 致谢

感谢 你怎么知道我买了黑猴 组全体小组成员，感谢北京理工大学互联网应用基础课目提供的开发机会及基础的前端技术培训；

感谢 YouTube博主 Drew Conley的Let's build an RPG with JavaScript视频；

感谢往届作品《再见》《西红柿传奇》等优秀作品为我们提供的设计思路。

