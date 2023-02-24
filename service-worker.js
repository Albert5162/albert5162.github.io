const OFFLINE_VERSION = 1;
const CACHE_NAME = "v1";
const OFFLINE_URL = "offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll([
          "/",
          "/index.html",
          "/offline.html",
          "/images/Icon512x512.png",
          "/service-worker.js",
          "/manifest.json"
      ]);
    })()
  );
});

// self.addEventListener("activate", (event) => {
//   event.waitUntil(
//     (async () => {
//       // Включение предварительной загрузки при переходе между страницами, если эта функция поддерживается.
//       // См. сведения по ссылке https://developers.google.com/web/updates/2017/02/navigation-preload
//       if ("navigationPreload" in self.registration) {
//         await self.registration.navigationPreload.enable();
//       }
//     })()
//   );
//
//   // Сообщаем активному служебному сценарию, что необходимо немедленно получить контроль над страницей.
//   self.clients.claim();
// });

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
          if (response) {
            // console.log("Found response in cache:", response);
            return response;
          }
          console.log("No response found in cache. About to fetch from network…");

          return fetch(event.request)
            .then((response) => {
              // console.log("Response from network is:", response);

              return response;
            })
            .catch((error) => {
              // console.error(`Fetching failed: ${error}`);
              throw error;
            });
        })
    );
  // if (event.request.mode === "navigate") {
  //   event.respondWith(
  //     (async () => {
  //       try {
  //         // Прежде всего попытаемся использовать ответ предварительной загрузки при переходе между страницами, если эта функция поддерживается.
  //         const preloadResponse = await event.preloadResponse;
  //         if (preloadResponse) {
  //           return preloadResponse;
  //         }
  //
  //         // Всегда сначала проверяйте сеть.
  //         const networkResponse = await fetch(event.request);
  //         return networkResponse;
  //       } catch (error) {
  //         // Событие catch появляется только при возникновении исключения, которое, вероятно,
  //         // вызвано ошибкой сети.
  //         // Если функция fetch() возвращает допустимый ответ HTTP с кодом ответа в
  //         // диапазоне 4xx или 5xx, функция catch() НЕ будет вызвана.
  //         console.log("Не удалось получить данные; вместо этого возвращаем страницу для автономного режима.", error);
  //
  //         const cache = await caches.open(CACHE_NAME);
  //         const cachedResponse = await cache.match(OFFLINE_URL);
  //         return cachedResponse;
  //       }
  //     })()
  //   );
  // }

  // Если выражение в условии if() ложно, то этот обработчик операции получения данных не перехватит
  // запрос. Если зарегистрированы любые другие обработчики операций получения данных, они
  // смогут вызвать метод event.respondWith(). Если ни один обработчик операций получения данных не вызовет метод
  // event.respondWith(), браузер обработает запрос таким образом, как если бы
  // не были задействованы никакие служебные сценарии.
});

async function showPosition(position) {
    console.log("pfghjc")
    await fetch('https://location.dev-tms.tn-dl.ru/api/coordinates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
            "number": "тест",
            "latitude": position.latitude,
            "longitude": position.longitude
        })
    })
}
self.addEventListener('sync', event_sync => {
    if (event_sync.tag === 'my-tag-name') {
        const db_req = indexedDB.open("positions", 1);

        db_req.onupgradeneeded = async (event) => {
          const db = event.target.result;
          const objectStore = await db.createObjectStore("coord", { keyPath: "id" });
        }
        db_req.addEventListener('success', (event) => {
          const db = event.target.result;
          let transaction = db.transaction('coord'); // (1)
          let coord = transaction.objectStore("coord");
          const request = coord.get(1);
          request.onsuccess = () => {
              console.log(request.result)
              event_sync.waitUntil(showPosition(request.result));
          };
        })

    }
});
// self.addEventListener('periodicsync', event => {
//     if (event.tag === 'get-daily-news') {
//         console.log("asd")
//         event.waitUntil(getLocation());
//     }
// });
