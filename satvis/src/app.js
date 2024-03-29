import Vue from "vue";
import App from "./App.vue";
import router from "./components/Router";
// import { Workbox } from "workbox-window";
import * as Sentry from "@sentry/browser";

Sentry.init({ dsn: "https://0c7d1a82eedb48ee8b83d87bf09ad144@sentry.io/1541793" });

const app = new Vue({
  el: "#app",
  router,
  components: { App },
  template: "<App/>"
});

// Export Vue for debugger
window.app = app;

/* global $cc */
//$cc.sats.addFromTleUrl("data/tle/norad/active.txt", ["Active"]);
// $cc.sats.addFromTleUrl("data/tle/norad/planet.txt", ["Planet"]);
// $cc.sats.addFromTleUrl("data/tle/norad/starlink.txt", ["Starlink"]);
$cc.sats.addFromTleUrl("data/tle/norad/my_globalstar4.txt", ["Globalstar1"]);
$cc.sats.addFromTleUrl("data/tle/norad/globalstar_exta.txt", ["Globalstar"]);
// $cc.sats.addFromTleUrl("data/tle/norad/resource.txt", ["Resource"]);
// $cc.sats.addFromTleUrl("data/tle/norad/science.txt", ["Science"]);
// $cc.sats.addFromTleUrl("data/tle/norad/stations.txt", ["Stations"]);
// $cc.sats.addFromTleUrl("data/tle/norad/weather.txt", ["Weather"]);
// $cc.sats.addFromTleUrl("data/tle/norad/tle-new.txt", ["New"]);

// $cc.sats.addFromTleUrl("data/tle/ext/move.txt", ["MOVE"]);
if ($cc.sats.enabledTags.length === 0) {
  $cc.sats.enableTag("Globalstar1");
}

// Register service worker
// 检测浏览器是否支持 Service Worker。所以通常在注册之前需要进行嗅探处理
// if ("serviceWorker" in navigator) {
//   const wb = new Workbox("sw.js");
//   wb.addEventListener("controlling", (evt) => {
//     if (evt.isUpdate) {
//       console.log("Reloading page for latest content");
//       window.location.reload();
//     }
//   });
//   wb.register();
// }
