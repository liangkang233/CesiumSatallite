# 修改记录日志

## 2020/12/16
1. 建立python与Exata外部接口数据的http连接，文件之后存储于mydata中，通信flask IP地址为其形参，默认不输入为10.16.43.47
2. Exata运行在虚拟机无法于物理机通信问题
    + 首先确保虚拟机网络编辑器为桥接至物理机，虚拟机类似于一台主机与物理机在同一局域网内(此处为10.16.0.1/16子网)。
    + 防火墙开启ICMPV4后可以使用ping物理主机IP地址来测试是否在同一局域网。
    + 物理机和虚拟机的防火墙关闭(记住日常使用要及时开启)`或者`编辑虚拟机和物理机防火墙入站规则:设置tcp、端口、IP子网规则通信等（要确保远程IP地址子网包含虚拟机本地IP）
    <center>  

    ![配置截图](/mydata/配置截图/QQ截图20201216181530.png)</center>
3. flask主函数修改为广播
```
    if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port='5000')
```
## 2020/12/19
1. 暂时性添加返回接受get post路由信息函数仿照此get、post请求的[抓包信息](/mydata/test_get_post)模拟了一个http请求的函数
2. 与原Exata套接字导出数据部分融合,中间测试用的get、post文件请求也放在上面介绍的目录中

## 2020/12/23
1. 明确Vue与后端的exata数据交互方式，记录于[切换流程文件](./切换流程.drawio)中
2. 给Node.js及python添加socketio模块，使得后端可以主动发送数据给前端 

```
nodejs: npm install socket.io --save
python: pip install flask-socketio
```

## 2021/1/23
1. Exata的lte切换导入flask后端测试成功，现对接前端交互测试。后端flask已经可以与前端vue建立通信，测试是否将数据导入切换动画效果中
2. 暂定exata使用get传输切换等命令，post传输相关数据。flask发送给cesium的各项初始化数据记录在[initialize](/satvis_api/initialize.json)中
3.测试中发现vue-socket.io版本虽然为3.0.10但其对应内核为js的2.X的socketio，所以要将flasksocketio和pythonsocketio版本降到4.x才可以正常交互

## 2021/1/26
1. 完善cesium与exata联动时同步过程，添加了开始、结束仿真以及系统初始化信令。(改变cc.viewer参数)确保Exata仿真前cesium保持时间运动轨迹不变直到exata仿真运行后cesium才会调用json里的初始化参数。
2. 尝试原保存在sessionStorage的dst数据转为其他js调用的全局变量

## 2021/2/4
1. 继续使用sessionStorage，之后多终端改数据格式后再改变。
2. 设置SatelliteManager.js默认启用以下数据，地面终端问题设置问题先搁置待解决
```
this.enabledComponents = ["Point", "Label", "Orbit", "Ground station link"];
```

3. 之后任务中Exata加入48星场景测试，传输其中信令数据仅仅后端存储不展示至Cesium。