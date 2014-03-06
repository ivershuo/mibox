#小米盒子遥控js sdk

>小米盒子远程控制js版SDK，可用来遥控家里的小米盒子。
>可在浏览器或Node.js运行

```shell
npm install mibox
```

##MI.getTvs()
获取局域网可用的小米设备
```javascript
var MI = require('mibox'); //in Node.js
MI.getTvs().then(function(tvs){
    console.log('家里的小米盒子们：', tvs.join('、'));
});
```


## new MI(srv, keyes)
**创建一个小米盒子实例**

*@string srv    小米盒子服务接口地址*  
*@array  keyes  添加可接受的控制键值，默认接受如下键值:*  
``menu``,``right``, ``left``, ``down``, ``up``, ``enter``, ``volumeup``, ``volumedown``, ``home``, ``back``。

```javascript
var mi = new MI('192.168.1.105:6095');
```

##mi.play(video, name)
**发送一个播放指令**

*@string video 视频地址*  
*@string name  视频名*

##mi.menu()
**发送打开菜单指令**

##mi.right()
**发送向右指令**

##mi.left()
**发送向左指令**

##mi.down()
**发送向下指令**

##mi.up()
**发送向上指令**

##mi.enter()
**发送确定指令**

##mi.volumeup()
**发送音量增加指令**

##mi.volumedown()
**发送音量减小指令**

##mi.home()
**发送返回主界面指令**

##mi.back()
**发送返回指令**

##mi.power()
**发送关闭小米盒子设备指令**

##mi.imequery()
**获取小米盒子当前聚焦输入框文字**

##mi.text()
**发送文字到小米盒子当前聚焦输入框**

##mi.isActive()
**查询当前盒子设备是否可用**


该SDK代码仅供小米盒子爱好者方便控制自家盒子电视，请勿基于该代码发布恶意性应用。
