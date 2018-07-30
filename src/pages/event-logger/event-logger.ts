import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { EventDetailsPage } from '../event-details/event-details';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';

/**
 * Generated class for the EventLoggerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

// @IonicPage()
@Component({
  selector: 'page-event-logger',
  templateUrl: 'event-logger.html',
})
export class EventLoggerPage {
  // events: Observable<any[]>;
  themes;
  eventID;
  logList: AngularFireList<any>;
  actions = [];

  // themes = [
  //   'Engagement',
  //   'Initiative',
  //   'Social',
  // ];

//  allActions = 
//  {
//     'Engagement': [
//       {'act': 'Spending time tinkering'},
//       {'act': 'Trying something over and over'},
//       {'act':'Showing emotions related to making'},
//       {'act':'Finishing one \"project\" and starting another'},
//       {'act':'Stopping or abandoning a \"project\" and coming back'}
//   ],
//     'Initiative': [
//       {'act':'Setting a goal or posing a problem'},
//       {'act':'Planning steps or strategies for outcomes'},
//       {'act':'Stating intention to do this again'},
//       {'act':'Seeking and responding to feedback'}, 
//       {'act':'Persisting towards their goal in face of setback'},
//       {'act':'Problem solving with new strategy'},
//       {'act':'Disagreeing with another\'s strategy'}, 
//       {'act':'Taking a risk to try when unsure'}
//     ],
//     'Social Scaffolding': [
//       {'act':'Requesting or offering help or explanations'},
//       {'act':'Offering tools or materials to another'},
//       {'act':'Talking about another\'s work'},
//       {'act':'Being inspired by another to change their own work'},
//       {'act':'Physically connecting to another\'s work'},
//       {'act':'Leaving something behind to share'}
//     ],
//     'Development of Understanding': [
//       {'act':'Expressing a realization or ah ha moment'},
//       {'act':'Offering an explanation for a strategy, tool, or outcome'},
//       {'act':'Connecting to prior knowledge'},
//       {'act':'Complexifying a set task'},
//       {'act':'Indicating not knowing something and remaining to explore'}
//     ]
// };

 allActions = 
 {
    'Engagement': [
      'Spending time tinkering',
      'Trying something over and over',
      'Showing emotions related to making',
      'Finishing one \"project\" and starting another',
      'Stopping or abandoning a \"project\" and coming back'
  ],
    'Initiative': [
      'Setting a goal or posing a problem',
      'Planning steps or strategies for outcomes',
      'Stating intention to do this again',
      'Seeking and responding to feedback', 
      'Persisting towards their goal in face of setback',
      'Problem solving with new strategy',
      'Disagreeing with another\'s strategy', 
      'Taking a risk to try when unsure'
    ],
    'Social Scaffolding': [
      'Requesting or offering help or explanations',
      'Offering tools or materials to another',
      'Talking about another\'s work',
      'Being inspired by another to change their own work',
      'Physically connecting to another\'s work',
      'Leaving something behind to share'
    ],
    'Development of Understanding': [
      'Expressing a realization or ah ha moment',
      'Offering an explanation for a strategy, tool, or outcome',
      'Connecting to prior knowledge',
      'Complexifying a set task',
      'Indicating not knowing something and remaining to explore'
    ]
};


  // actions = [
  //   {
  //     'theme': 'Engagement',
  //     'acts': [
  //       'Spending Time', 
  //       'Displaying Motivation'
  //   ] },
  //   {
  //     'theme': 'Initiative',
  //     'acts': [
  //       'Setting own goals',
  //       'Seeking feedback',
  //       'Persisting at goals',
  //   ] },
  //   {
  //     'theme': 'Social Scaffolding',
  //     'acts': [
  //       'Requesting help',
  //       'Inspiring ideas',
  //       'Relating with others work'
  //   ] }
  // ];


  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public db: AngularFireDatabase) {
    this.navCtrl = navCtrl;
    var themes = navParams.data.themes;
    this.eventID = navParams.data.eventID;
    this.logList = db.list('EventsDebug1/LogClicks');
    // this.
    // console.log(this.themes);
    for (var t in themes){
      console.log(themes[t]);
      var them = themes[t];
      var acts = this.allActions[themes[t]];
      this.actions.push({"theme": them, "acts": acts});
    }
    console.log("acions here " + this.actions);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventLoggerPage');
  }

  addEvent(act: string, actTheme: string) {
    console.log("adding " + act);
    this.logList.push({
      "event": this.eventID,
      "epoch": Date.now(),
      "timestamp": Date(),
      "action": act,
      "theme": actTheme
    });
    this.navCtrl.push(EventDetailsPage, {item: act, "theme": actTheme, "event": this.eventID});
  }

}
