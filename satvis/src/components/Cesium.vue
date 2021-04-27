<template>
  <div class="cesium">
    <div v-if="showUI" id="toolbarLeft">
      <div class="toolbarButtons">
        <!-- 工具提示 -->
        <b-tooltip label="Satellite selection" position="is-right">
          <button type="button" class="cesium-button cesium-toolbar-button" @click="toggleMenu('cat')">
            <span class="icon fill-parent">
              <i class="svg-sat"></i>
            </span>
          </button>
        </b-tooltip>
        <b-tooltip label="Satellite elements" position="is-right">
          <button type="button" class="cesium-button cesium-toolbar-button" @click="toggleMenu('sat')">
            <span class="icon fill-parent">
              <i class="fas fa-layer-group fa-2x"></i>
            </span>
          </button>
        </b-tooltip>
        <b-tooltip label="Ground station" position="is-right">
          <button type="button" class="cesium-button cesium-toolbar-button" @click="toggleMenu('gs')">
            <span class="icon fill-parent">
              <i class="svg-groundstation"></i>
            </span>
          </button>
        </b-tooltip>
        <b-tooltip label="Map" position="is-right">
          <button type="button" class="cesium-button cesium-toolbar-button" @click="toggleMenu('map')">
            <span class="icon fill-parent">
              <i class="fas fa-globe-africa fa-2x"></i>
            </span>
          </button>
        </b-tooltip>
        <b-tooltip v-if="$cc.minimalUI" label="Mobile" position="is-right">
          <button type="button" class="cesium-button cesium-toolbar-button" @click="toggleMenu('ios')">
            <span class="icon fill-parent">
              <i class="fas fa-mobile-alt fa-2x"></i>
            </span>
          </button>
        </b-tooltip>
        <b-tooltip label="Debug" position="is-right">
          <button type="button" class="cesium-button cesium-toolbar-button" @click="toggleMenu('dbg')">
            <span class="icon fill-parent">
              <i class="fas fa-hammer fa-fw mfa-button-width"></i>
            </span>
          </button>
        </b-tooltip>
      </div>
      <!-- v-show条件展示 -->
      <div v-show="menu.cat" class="toolbarSwitches">
        <div class="toolbarTitle">
          Tracked satellite
        </div>
        <div class="toolbarContent">
          <satellite-select ref="SatelliteSelect" />
        </div>
        <div class="toolbarTitle">
          Enabled satellites
        </div>
        <div class="toolbarContent">
          <satellite-multi-select ref="SatelliteMultiSelect" />
        </div>
        <div class="toolbarTitle">
          Monitored satellites
        </div>
        <!-- <div class="toolbarContent">
          <satellite-notify-multi-select ref="SatelliteNotifyMultiSelect" />
        </div> -->
      </div>
      
      <div v-show="menu.sat" class="toolbarSwitches">
        <div class="toolbarTitle">
          Satellite elements
        </div>
        <label v-for="componentName in $cc.sats.components" :key="componentName" class="toolbarSwitch">
          <input v-model="enabledComponents" type="checkbox" :value="componentName">
          <!-- 用CSS创建“切换开关”（打开/关闭按钮） -->
          <span class="slider"></span>
          {{ componentName }}
        </label>
        <!--
        <label class="toolbarSwitch">
          <input type="button" @click="$cc.viewer.trackedEntity = undefined">
          Untrack Entity
        </label>
        -->
      </div>

      <div v-show="menu.gs" class="toolbarSwitches">
        <div class="toolbarTitle">
          Ground station
        </div>
        <label class="toolbarSwitch">
          <input v-model="groundStationPicker.enabled" type="checkbox">
          <span class="slider"></span>
          Pick on globe
        </label>
        <label class="toolbarSwitch">
          <input type="button" @click="$cc.setGroundStationFromGeolocation()">
          Set from geolocation
        </label>
        <label class="toolbarSwitch">
          <input type="button" @click="$cc.sats.focusGroundStation()">
          Focus
        </label>
      </div>
      <div v-show="menu.map" class="toolbarSwitches">
        <div class="toolbarTitle">
          Layers
        </div>
        <label v-for="name in $cc.imageryProviders" :key="name" class="toolbarSwitch">
          <input v-model="imageryProvider" type="radio" :value="name">
          <span class="slider"></span>
          {{ name }}
        </label>
        <div class="toolbarTitle">
          Terrain
        </div>
        <label v-for="name in $cc.terrainProviders" :key="name" class="toolbarSwitch">
          <input v-model="terrainProvider" type="radio" :value="name">
          <span class="slider"></span>
          {{ name }}
        </label>
        <div class="toolbarTitle">
          View
        </div>
        <label v-for="name in $cc.sceneModes" :key="name" class="toolbarSwitch">
          <input v-model="sceneMode" type="radio" :value="name">
          <span class="slider"></span>
          {{ name }}
        </label>
        <div class="toolbarTitle">
          Camera
        </div>
        <label v-for="name in $cc.cameraModes" :key="name" class="toolbarSwitch">
          <input v-model="cameraMode" type="radio" :value="name">
          <span class="slider"></span>
          {{ name }}
        </label>
      </div>
      <div v-show="menu.ios" class="toolbarSwitches">
        <div class="toolbarTitle">
          Mobile
        </div>
        <label class="toolbarSwitch">
          <input v-model="$cc.viewer.scene.useWebVR" type="checkbox">
          <span class="slider"></span>
          VR
        </label>
        <label class="toolbarSwitch">
          <input v-model="$cc.viewer.clock.shouldAnimate" type="checkbox">
          <span class="slider"></span>
          Play
        </label>
        <label class="toolbarSwitch">
          <input type="button" @click="$cc.viewer.clockViewModel.multiplier *= 2">
          Increase play speed
        </label>
        <label class="toolbarSwitch">
          <input type="button" @click="$cc.viewer.clockViewModel.multiplier /= 2">
          Decrease play speed
        </label>
        <label class="toolbarSwitch">
          <input type="button" @click="$router.go({path: '', force: true})">
          Reload
        </label>
      </div>
      <div v-show="menu.dbg" class="toolbarSwitches">
        <div class="toolbarTitle">
          Debug
        </div>
        <label class="toolbarSwitch">
          <input v-model="$cc.viewer.scene.debugShowFramesPerSecond" type="checkbox">
          <span class="slider"></span>
          FPS
        </label>
        <label class="toolbarSwitch">
          <input v-model="$cc.viewer.scene.requestRenderMode" type="checkbox">
          <span class="slider"></span>
          RequestRender
        </label>
        <label class="toolbarSwitch">
          <input v-model="$cc.viewer.scene.fog.enabled" type="checkbox">
          <span class="slider"></span>
          Fog
        </label>
        <label class="toolbarSwitch">
          <input v-model="$cc.viewer.scene.globe.enableLighting" type="checkbox">
          <span class="slider"></span>
          Lighting
        </label>
        <label class="toolbarSwitch">
          <input v-model="$cc.viewer.scene.highDynamicRange" type="checkbox">
          <span class="slider"></span>
          HDR
        </label>
        <label class="toolbarSwitch">
          <input v-model="$cc.viewer.scene.globe.showGroundAtmosphere" type="checkbox">
          <span class="slider"></span>
          Atmosphere
        </label>
        <label class="toolbarSwitch">
          <input type="button" @click="$cc.jumpTo('Everest')">
          Jump to Everest
        </label>
        <label class="toolbarSwitch">
          <input type="button" @click="$cc.jumpTo('HalfDome')">
          Jump to HalfDome
        </label>
      </div>
    </div>
    <div id="toolbarRight">
      <!-- <b-tooltip v-if="showUI" label="Github" position="is-left">
        <a class="cesium-button cesium-toolbar-button" href="https://github.com/Flowm/satvis/" target="_blank" rel="noopener">
          <span class="icon fill-parent">
            <i class="fab fa-github fa-2x"></i>
          </span>
        </a>
      </b-tooltip> -->
      <b-tooltip v-if="showUI" label="signal" position="is-left">
        <a class="cesium-button cesium-toolbar-button" href="../../data/satellite_base_station.html" target="_blank" rel="noopener">
          <span class="icon fill-parent">
            <i class="fas fa-signal  fa-fw mfa-button-width"></i>
          </span>
        </a>
      </b-tooltip>
      <b-tooltip label="Toggle UI" position="is-left">
        <button type="button" class="cesium-button cesium-toolbar-button" @click="toggleUI">
          <span class="icon fill-parent">
            <i class="fas fa-eye fa-2x"></i>
          </span>
        </button>
      </b-tooltip>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Tooltip from "buefy";
import SatelliteSelect from "./SatelliteSelect.vue";
import SatelliteMultiSelect from "./SatelliteMultiSelect.vue";
import * as Cesium from "cesium/Cesium";
// import SatelliteNotifyMultiSelect from "./SatelliteNotifyMultiSelect.vue";
import VueCesiumController from "./VueCesiumController.js";
import VueSocketIO from 'vue-socket.io';

Vue.use(new VueSocketIO({
  // debug: true,
  connection: 'http://127.0.0.1:5000/test'
}))
Vue.use(Tooltip);
Vue.use(VueCesiumController); /* global $cc */
var arr=[];

export default {
  components: {
    "satellite-select": SatelliteSelect,
    "satellite-multi-select": SatelliteMultiSelect,
    // "satellite-notify-multi-select": SatelliteNotifyMultiSelect,
  },
  data() {
    return {
      menu: {
        cat: false,
        sat: false,
        gs: false,
        map: false,
        ios: false,
        dbg: false,
      },
      showUI: true,
      imageryProvider: "OfflineHighres",
      terrainProvider: "None",
      sceneMode: "3D",
      cameraMode: "Fixed",
      enabledComponents: $cc.sats.enabledComponents,
      groundStationPicker: $cc.groundStationPicker,
    };
  },
  sockets:{
    // 通信的name
    //这里是监听connect事件
    connect: function(){
      this.id=this.$socket.id
      // alert('建立连接')
      //Cesium前端初始化socketio连接成功后先暂停时间等待Exata发送卫星初始化命令
      var start = Cesium.JulianDate.fromIso8601('2021-01-23T12:00:00Z');
      var end = Cesium.JulianDate.fromIso8601('2021-01-23T16:00:00Z');
      $cc.viewer.timeline.zoomTo(start, end);
      $cc.viewer.timeline.updateFromClock();
      $cc.viewer.clock.multiplier = 50;        //时间运行倍数，若设置86400 现实1s等于界面显示1天 
      $cc.viewer.clock.currentTime = Cesium.JulianDate.fromIso8601('2021-01-23T12:00:00Z'); 
      $cc.viewer.clock.shouldAnimate = false;  //时间暂停
      sessionStorage.setItem("dst", "25");
      sessionStorage.setItem("content","");
      this.$socket.emit('Initialize_event',"2021-01-23 12:00:00");
      // 显示连接卫星等各项值默认为空
    },

    disconnect: function(){
      alert('exta断开连接')
    },

    Satellite_Initialize: function(data){     
    //初始化各卫星数据，流动时间
    var start = Cesium.JulianDate.fromIso8601('2021-01-23T12:00:00Z');
    var end = Cesium.JulianDate.fromIso8601('2021-01-23T16:00:00Z');
    $cc.viewer.timeline.zoomTo(start, end);
    $cc.viewer.clock.currentTime = Cesium.JulianDate.fromIso8601('2021-01-23T12:00:00Z'); 
    $cc.viewer.clock.shouldAnimate = true;  //时间开始流动
    $cc.viewer.timeline.zoomTo(start, end);
    sessionStorage.setItem("dst", "");
    sessionStorage.setItem("content","");
    // console.log(JSON.parse(data))
  },
  Satellite_Accomplish : function(data){     //仿真结束，暂停时间
    $cc.viewer.clock.shouldAnimate = false;    
    sessionStorage.setItem("dst", "");
    sessionStorage.setItem("content","");
  },
  
  server_response: function(data){
    if(data.length!=0){
      arr.push(data)
      console.log(data)
      sessionStorage.setItem("content",JSON.stringify(arr));
      let content=sessionStorage.getItem("content")
      let datas= JSON.parse(content)
      const list = Object.keys(datas).map((item)=>{
        return datas[item];
      });
      list.map((item)=>{
        item=JSON.parse(item)
        if(item["type"]==="SGMF_SG_CONTEXT_RELEASE_COMLETE"){
            arr=[]
            sessionStorage.setItem("dst",item["dst"]);
            sessionStorage.setItem("content","");
          }    
        });
    }
  },

  },
  watch: {
    imageryProvider: function(newProvider) {
      $cc.imageryProvider = newProvider;
      if (this.$route.query.layers != newProvider) {
        this.$router.push({query: {...this.$route.query, layers: newProvider}});
      }
    },
    terrainProvider: function(newProvider) {
      $cc.terrainProvider = newProvider;
      if (this.$route.query.terrain != newProvider) {
        this.$router.push({query: {...this.$route.query, terrain: newProvider}});
      }
    },
    sceneMode: function(newMode) {
      $cc.sceneMode = newMode;
    },
    cameraMode: function(newMode) {
      $cc.cameraMode = newMode;
    },
    enabledComponents: function(newComponents, oldComponents) {
      let add = newComponents.filter(x => !oldComponents.includes(x));
      for (let component of add) {
        $cc.sats.enableComponent(component);
      }
      let del = oldComponents.filter(x => !newComponents.includes(x));
      for (let component of del) {
        $cc.sats.disableComponent(component);
      }
    },
  },
  mounted() {
    if (this.$route.query.bg) {
      $cc.enableTransparency();
    }
    if (this.$route.query.gs) {
      $cc.setGroundStationFromLatLon(this.$route.query.gs);
    }
    if (this.$route.query.layers) {
      const layers = this.$route.query.layers.split(",");
      if (layers.length === 1) {
        this.imageryProvider = layers[0];
      } else {
        $cc.clearImageryLayers();
        layers.forEach(layer => {
          const provider = layer.split("_");
          if (provider.length == 1) {
            $cc.addImageryLayer(provider[0]);
          } else {
            $cc.addImageryLayer(provider[0], provider[1]);
          }
        });
      }
    }
    if (this.$route.query.terrain) {
      this.terrainProvider = this.$route.query.terrain;
    }
    if (this.$route.query.tags) {
      const tags = this.$route.query.tags.split(",");
      $cc.sats.enableTag(tags);
    }
    if (this.$route.query.elements) {
      const elements = this.$route.query.elements.replace(/-/g, " ").split(",");
      this.enabledComponents = elements;
    }
    if (this.$route.query.time) {
      $cc.setTime(this.$route.query.time);
    }
    this.showUI = !$cc.minimalUIAtStartup;
    this.$root.$on("updateCat", this.updateCat);
  },
  beforeDestroy() {
    this.$root.$off("updateCat", this.updateCat);
  },
  methods: {
    toggleMenu: function(name) {
      const oldState = this.menu[name];
      Object.keys(this.menu).forEach(k => this.menu[k] = false);
      this.menu[name] = !oldState;

      if (this.menu.cat) {
        // Update multiselect data when it is displayed 更新选择数据
        this.updateCat();
      }
    },
    toggleUI: function() {
      this.showUI = !this.showUI;
      if (!$cc.minimalUI) {
        $cc.showUI = this.showUI;
      }
    },
    updateCat: function() {
      this.$refs.SatelliteSelect.update();
      this.$refs.SatelliteMultiSelect.update();
      // this.$refs.SatelliteNotifyMultiSelect.update();
    },
  },
};
</script>
