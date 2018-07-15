import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Media, MediaObject } from '@ionic-native/media';
import { File } from '@ionic-native/file';

import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireStorage } from 'angularfire2/storage';

import { Observable } from 'rxjs/Observable';

/**
 * Generated class for the EventDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-event-details',
  templateUrl: 'event-details.html',
})
export class EventDetailsPage {
  item;
  theme;
  eventID;
  eventNotes: AngularFireList<any>;

  detailsForm: FormGroup;
  recording: boolean = false;
  filePath: string;
  fileName: string;
  audio: MediaObject;
  audioList: any[] = [];
  uploadProgress: Observable<number>;
  downloadURL: string;

  tags = ['positively', 'negatively', 'willingly', 'reluctantly', 'with encouragement', 'independently', 'riskily', 'half-heartedly'];
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, public media: Media, private file: File, public platform: Platform, db: AngularFireDatabase, private afStorage: AngularFireStorage) {

    this.item = navParams.data.item;
    this.theme = navParams.data.theme;
    this.eventID = navParams.data.event;

    this.eventNotes = db.list('EventsDebug1/EventList');
    this.navCtrl = navCtrl;

    this.detailsForm = formBuilder.group({
      notes: [],
      tags: [],
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventDetailsPage');
  }

  getAudioList() {
    if(localStorage.getItem("audiolist")) {
      this.audioList = JSON.parse(localStorage.getItem("audiolist"));
      console.log(this.audioList);
    }
  }

  ionViewWillEnter() {
    this.getAudioList();
  }

  startRecord() {
    if (this.platform.is('ios')) {
      this.fileName = 'record'+new Date().getDate()+new Date().getMonth()+new Date().getFullYear()+new Date().getHours()+new Date().getMinutes()+new Date().getSeconds()+'.3gp';
      this.filePath = this.file.documentsDirectory.replace(/file:\/\//g, '') + this.fileName;
      this.audio = this.media.create(this.filePath);
    } else if (this.platform.is('android')) {
      this.fileName = 'record'+new Date().getDate()+new Date().getMonth()+new Date().getFullYear()+new Date().getHours()+new Date().getMinutes()+new Date().getSeconds()+'.3gp';
      this.filePath = this.file.externalDataDirectory.replace(/file:\/\//g, '') + this.fileName;
      this.audio = this.media.create(this.filePath);
    }
    this.audio.startRecord();
    this.recording = true;
  }

  upload(audioFile) {
    const randomId = Math.random().toString(36).substring(2);
    const ref = this.afStorage.ref(randomId);
    const task = ref.put(audioFile);
    this.uploadProgress = task.percentageChanges();
    //this.uploadProgress = this.task.snapshotChanges()
    //  .pipe(map(s => (s.bytesTransferred / s.totalBytes) * 100));
    //this.downloadURL = task.downloadURL();
  }

  stopRecord() {
    this.audio.stopRecord();
    let data = { filename: this.fileName };
    this.audioList.push(data);
    localStorage.setItem("audiolist", JSON.stringify(this.audioList));
    this.recording = false;
    this.getAudioList();
    this.upload(this.audio);
  }

  playAudio(file,idx) {
    if (this.platform.is('ios')) {
      this.filePath = this.file.documentsDirectory.replace(/file:\/\//g, '') + file;
      this.audio = this.media.create(this.filePath);
    } else if (this.platform.is('android')) {
      this.filePath = this.file.externalDataDirectory.replace(/file:\/\//g, '') + file;
      this.audio = this.media.create(this.filePath);
    }
    this.audio.play();
    this.audio.setVolume(0.8);
  }
  
  onSubmit(value: any): void { 
    console.log(value);
    this.eventNotes.push({"theme": this.theme, "event": this.eventID, "act": this.item, "notes": value["notes"], "tags": value["tags"]})
    //*** DO VALIDATION TO CHECK THAT THEMES HAS SOMETHING SELECTED

    //*** GO TO NEXT PAGE WITH REORDERED LIST OPTOINS
    this.navCtrl.pop();
  }

  // const file: MediaObject = this.media.create('file.mp3');
  // file.onStatusUpdate.subscribe(status => console.log(status)); // fires when file status changes
  // file.onSuccess.subscribe(() => console.log('Action is successful'));
  // file.onError.subscribe(error => console.log('Error!', error));
  




}
