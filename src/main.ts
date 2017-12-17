import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

const readyEvent = 'deviceready';

document.addEventListener(readyEvent, function () {
  platformBrowserDynamic().bootstrapModule(AppModule).catch((err) => {
    console.log(err);
  });
}, false);

if (environment.production) {
  const head = document.querySelector('head');
  const cordovaScript = document.createElement('script');
  cordovaScript.src = 'cordova.js';
  cordovaScript.type = 'text/javascript';
  head.appendChild(cordovaScript);
  enableProdMode();
} else {
  document.dispatchEvent(new Event(readyEvent));
}
