import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './features/app/app.config';
import { App } from './features/app/containers/app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
