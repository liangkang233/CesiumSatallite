# 基于cesium平台的卫星轨迹可视化
## `后端配置：`
最好新建python虚拟环境Venv操作,跳转至satvis_api中
```
pip install XXX
```
XXX代表./satvis_api/requirements.txt中python中包版本

接着运行代码
```
python app.py
```
效果：
![1592099860903](../satvis/assets/1592099860903.png)
## `前端配置：`
官网下载安装Node.js,之后跳转至satvis中终端输入
国内下载速度慢换用阿里的镜像：
```
npm config set registry https://registry.npm.taobao.org 
``` 
安装依赖包：
```
npm install
```
运行：
```
npm run start
```
效果：
![1592100082449](../satvis/assets/1592100082449.png)
![预览图](./satvis/1.png)

