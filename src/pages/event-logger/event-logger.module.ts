import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventLoggerPage } from './event-logger';

@NgModule({
  declarations: [
    EventLoggerPage,
  ],
  imports: [
    IonicPageModule.forChild(EventLoggerPage),
  ],
})
export class EventLoggerPageModule {}
