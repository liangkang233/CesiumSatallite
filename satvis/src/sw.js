import { skipWaiting, clientsClaim } from "workbox-core";
import { registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

// 使用workbox缓存资源，
// Cache Cesium runtime dependencies 缓存Cesium运行时依赖项
registerRoute(
  /dist\/(Assets|Widgets|Workers)\/.*\.(css|js|json)$/,
  new CacheFirst({
    cacheName: "cesium-cache",
  })
);

// Cache high res map tiles 缓存高分辨率地图图块
registerRoute(
  /data\/cesium-assets\/imagery\/.*\.(jpg|xml)$/,
  new CacheFirst({
    cacheName: "cesium-tile-cache",
    plugins: [
      new ExpirationPlugin({
        // 最多保留20000个条目
        maxEntries: 20000,
        maxAgeSeconds: 7 * 24 * 60 * 60,
        // / 如果超过浏览器配额，则自动清除
        purgeOnQuotaError: true,
      })
    ]
  })
);

cleanupOutdatedCaches();
precacheAndRoute(self.__precacheManifest || self.__WB_MANIFEST);
// 直接激活跳过等待阶段
skipWaiting();
clientsClaim();
