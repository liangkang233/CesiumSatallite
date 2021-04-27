import Vue from "vue";
import App from "./App.vue";
import router from "./components/Router";
import { Workbox } from "workbox-window";
// app.js文件内容包含这些 感觉是测试文件
const app = new Vue({
  el: "#app",
  router,
  components: { App },
  template: "<App/>"
});

// Export Vue for debugger
window.app = app;

/* global $cc */
$cc.sats.addFromTleUrl("data/tle/ext/move.txt", ["MOVE"]);
if ($cc.sats.enabledTags.length === 0) {
  $cc.sats.enableTag("MOVE");
}

// Register service worker
// if ("serviceWorker" in navigator) {
//   const wb = new Workbox("sw.js");
//   wb.addEventListener("waiting", () => {
//     wb.addEventListener("controlling", () => {
//       console.log("Reloading page for latest content");
//       window.location.reload();
//     });
//     wb.messageSW({type: "SKIP_WAITING"});
//     // Old serviceworker message for migration, can be removed in the future
//     wb.messageSW("SKIP_WAITING");
//   });
//   wb.register();
// }
