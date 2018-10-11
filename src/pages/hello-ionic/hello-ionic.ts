import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { NavController, NavParams } from 'ionic-angular';
import { EventLoggerPage } from '../event-logger/event-logger';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {
  authForm: FormGroup;
  events: Observable<any[]>;
  eventList: AngularFireList<any>;

  constructor(public viewCtrl: ViewController, public nav: NavController, public navParams: NavParams, public db: AngularFireDatabase, public formBuilder: FormBuilder) {
    this.nav = nav;  
    this.eventList = db.list('EventsDebug1/EventList');
    this.events = this.eventList.snapshotChanges();
    console.log(this.events);
    // this.events = this.eventList.snapshotChanges().pipe(
    //   map(changes => 
    //     changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
    //   )
    // );
    // this.eventList.push({"eventOrganizer": "why won't this work"}, function (err));
    // const a = db;
    // console.log(a);

    this.authForm = formBuilder.group({
        // username: ['', Validators.compose([Validators.required, Validators.pattern('[a-zA-Z]*'), Validators.minLength(8), Validators.maxLength(30)])],
        // password: ['', Validators.compose([Validators.required, Validators.minLength(8)])]
        event: [],
        name: [],
        themes: [],
        activities: []
    });
  }

  log(val) { console.log(val); }

  // private handleError(error) {
  //   console.log(error);
  // }

  chooseEvent(themes, eventKey) {
    console.log(themes, eventKey);
    this.nav.push(EventLoggerPage, {"themes": themes, "eventID": eventKey});
  }

  onSubmit(value: any): void { 
    console.log(this.events);
    var pushkey = "";
    this.eventList.push({
      "eventCode": value.event,
      "eventOrganizer": value.name,
      "themes": value.themes,
      "activities": value.activities
    }).then( (item) => { 
      pushkey = item.key; 
      this.nav.push(EventLoggerPage, {"themes": value.themes, "eventID": pushkey});
    } );
    // .catch(error => this.handleError(error));

    console.log(value.name);
    //*** DO VALIDATION TO CHECK THAT THEMES HAS SOMETHING SELECTED

    //*** GO TO NEXT PAGE WITH REORDERED LIST OPTOINS
    
  }
}
