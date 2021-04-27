<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script>
// Font awesome setup 字体设置
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { faLayerGroup, faGlobeAfrica, faMobileAlt, faHammer, faEye, faRedo, faInfo, faBell,faChartBar,faSignal, } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
library.add(faLayerGroup, faGlobeAfrica, faMobileAlt, faHammer, faEye, faRedo, faInfo, faBell, faChartBar,faSignal, faGithub);
dom.watch();

import "buefy/dist/buefy.css";
import "cesium/Widgets/widgets.css";
import "./css/main.css";

export default {
};
</script>
