import { storageDriver } from "../storage-driver";

// Background service workers
// https://developer.chrome.com/docs/extensions/mv3/service_workers/

// chrome.runtime.onInstalled.addListener(() => {
//     storageDriver.get().then(console.log);
// });

// NOTE: If you want to toggle the side panel from the extension's action button,
// you can use the following code:
// chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
//    .catch((error) => console.error(error));
