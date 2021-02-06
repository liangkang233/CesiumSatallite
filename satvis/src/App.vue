<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script>
// Font awesome setup
import * as Cesium from "cesium/Cesium";
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { faLayerGroup, faGlobeAfrica, faMobileAlt, faHammer, faEye, faRedo, faInfo, faBell,faChartBar } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
library.add(faLayerGroup, faGlobeAfrica, faMobileAlt, faHammer, faEye, faRedo, faInfo, faBell,faChartBar, faGithub);
dom.watch();

import "buefy/dist/buefy.css";
import "cesium/Widgets/widgets.css";
import "./css/main.css";

export default {
  sockets:{
    connect: function(){  // socketio初始化后前端会主动调用connect函数
      this.id=this.$socket.id
      alert('flask建立连接')
      //Cesium前端初始化socketio连接成功后先暂停时间等待Exata发送卫星初始化命令
      var start = Cesium.JulianDate.fromIso8601('2021-01-23T12:00:00Z');
      var end = Cesium.JulianDate.fromIso8601('2021-01-23T16:00:00Z');
      cc.viewer.timeline.zoomTo(start, end);
      cc.viewer.timeline.updateFromClock();
      cc.viewer.clock.multiplier = 50;        //时间运行倍数，若设置86400 现实1s等于界面显示1天 
      cc.viewer.clock.currentTime = Cesium.JulianDate.fromIso8601('2021-01-23T12:00:00Z'); 
      cc.viewer.clock.shouldAnimate = false;  //时间暂停
      sessionStorage.setItem("dst", null);
      this.$socket.emit('Initialize_event',"2021-01-23 12:00:00");
      // 显示连接卫星等各项值默认为空
    },
    disconnect: function(){
      alert('falsk断开连接')
    },
    reconnect: function(){
      console.log('重新连接flask')
      this.$socket.emit('conect')
    },
    Satellite_Initialize: function(data){     //初始化各卫星数据，流动时间
      var start = Cesium.JulianDate.fromIso8601('2021-01-23T12:00:00Z');
      var end = Cesium.JulianDate.fromIso8601('2021-01-23T16:00:00Z');
      cc.viewer.timeline.zoomTo(start, end);
      cc.viewer.clock.currentTime = Cesium.JulianDate.fromIso8601('2021-01-23T12:00:00Z'); 
      cc.viewer.clock.shouldAnimate = true;  //时间开始流动
      cc.viewer.timeline.zoomTo(start, end);
      console.log(JSON.parse(data))
      let signal=JSON.parse(data);
      sessionStorage.setItem("dst",signal.dst);
    },
    Satellite_Accomplish : function(data){     //仿真结束，暂停时间
      cc.viewer.clock.shouldAnimate = false;    
      sessionStorage.setItem("dst", null);
    },
    Satellite_Switch: function(data){
      console.log(JSON.parse(data))
      let signal=JSON.parse(data);
      sessionStorage.setItem("dst",signal.dst);
    },
  }
};
</script>
