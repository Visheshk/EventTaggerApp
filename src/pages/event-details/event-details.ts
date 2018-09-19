import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Media, MediaObject } from '@ionic-native/media';
import { File } from '@ionic-native/file';
// import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions } from '@ionic-native/media-capture';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';

import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase';

/**
 * Generated class for the EventDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

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
  // recordingList: any[];
  imageList: any[];
  imageNameList: any[];
  audio: MediaObject;
  audioList: any[] = [];
  uploadProgress: Observable<number>;
  // downloadURL: string;
  // mediaCapture: MediaCapture;
  percentage: Observable<number>;
  downloadURL: Observable<string>;
  snapshot: Observable<any>;
  storage: AngularFireStorage;
  storageRef: any;
  task: AngularFireUploadTask;

  // audioFile: Promise<MediaFile[]>;

  tags = ['positively', 'negatively', 'willingly', 'reluctantly', 'with encouragement', 'independently', 'riskily', 'half-heartedly'];

  // let options: CaptureImageOptions = { limit: 3 };
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, public media: Media, private file: File, public platform: Platform, db: AngularFireDatabase, private afStorage: AngularFireStorage, private camera: Camera) {

    this.item = navParams.data.item;
    this.theme = navParams.data.theme;
    this.eventID = navParams.data.event;
    this.storage =  afStorage;

    this.eventNotes = db.list('EventsDebug1/ActionList');
    this.navCtrl = navCtrl;
    // this.mediaCapture = mediaCapture;
    


    this.detailsForm = formBuilder.group({
      notes: [],
      tags: [],
    })
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad EventDetailsPage');
  }

  ionViewDidLeave() {
    console.log("leaving ion view");

    //** add a verifier if things not uploaded before exiting view

    //actually delete files on exiting view
    this.audioList = [];
    // this.recordingList = [];
    // this.recordingList = [];
    this.imageList = [];
    this.imageNameList = [];
    localStorage.setItem("audiolist", JSON.stringify(this.audioList));
  }

  getAudioList() {
    if(localStorage.getItem("audiolist")) {
      this.audioList = JSON.parse(localStorage.getItem("audiolist"));
      // console.log(this.audioList);
    }
  }

  ionViewWillEnter() {
    console.log("entering ion view");

    this.audioList = [];
    // this.recordingList = [];
    // this.recordingList = [];
    this.imageList = [];
    this.imageNameList = [];
    localStorage.setItem("audiolist", JSON.stringify(this.audioList));

    this.getAudioList();
  }

  takePicture() {
    var fileName = 'photo-'+ this.eventID + "-theme-" + this.theme + "-act-" + this.item + "-time-" + new Date().getDate()+new Date().getMonth()+new Date().getFullYear()+new Date().getHours()+new Date().getMinutes()+new Date().getSeconds()+'.jpg';
    this.camera.getPicture({
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }).then(
      (imageData) => {
        this.imageList.push({"image": "data:image/jpeg;base64," + imageData, "fileName": fileName});
        this.imageNameList.push({"fileName": fileName});
      }, 
      (err) => {console.log(err)});
  }

  removePicture(file, idx) {
    
  }

  startRecord() {
    // this.mediaCapture.captureImage({ "limit": 3 })
      // .then( (data: MediaFile[]) => console.log(data), (err: CaptureError) => console.error(err) );
    if (this.platform.is('ios')) {
      this.fileName = 'record'+new Date().getDate()+new Date().getMonth()+new Date().getFullYear()+new Date().getHours()+new Date().getMinutes()+new Date().getSeconds()+'.wav';
      this.filePath = this.file.documentsDirectory.replace(/file:\/\//g, '') + this.fileName;
      
    } 
    // else if (this.platform.is('android')) {
    else {
      this.fileName = 'record'+new Date().getDate()+new Date().getMonth()+new Date().getFullYear()+new Date().getHours()+new Date().getMinutes()+new Date().getSeconds()+'.wav';
      this.filePath = this.file.externalDataDirectory.replace(/file:\/\//g, '') + this.fileName;

    }
    this.audio = this.media.create(this.filePath);
    // this.fileName = 'record-'+ this.eventID + "-theme-" + this.theme + "-act-" + this.item + "-time-" + new Date().getDate()+new Date().getMonth()+new Date().getFullYear()+new Date().getHours()+new Date().getMinutes()+new Date().getSeconds();

    // this.filePath = this.file.externalDataDirectory.replace(/file:\/\//g, '') + this.fileName;
    // this.filePath = this.file.externalDataDirectory + this.fileName;
    // if (this.platform.is('ios')) {  
    
    // }

    this.audio = this.media.create(this.filePath);
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
    this.audio.release();
    let data = { "fileName": this.fileName };
    this.audioList.push(data);
    localStorage.setItem("audiolist", JSON.stringify(this.audioList));
    this.recording = false;
    // this.recordingList.push({"filename": this.fileName, "filePath": this.filePath});
    this.getAudioList();
    // this.upload(this.audio);

  }

  playAudio(file,idx) {
    if (this.platform.is('ios')) {
      this.filePath = this.file.documentsDirectory.replace(/file:\/\//g, '') + file;
    // } else if (this.platform.is('android')) {
    } else {
      this.filePath = this.file.externalDataDirectory.replace(/file:\/\//g, '') + file;
    }
    // this.audio = this.media.create(this.filePath);
    // console.log("playing audio");
    // this.filePath = this.file.externalDataDirectory + file;
    this.audio = this.media.create(this.filePath);
    this.audio.play();
    console.log(this.audioList);
    // this.audio.setVolume(0.8);
  }

  removeAudio(file, idc) {

  }

  // private startUpload() {

  // }
  
  onSubmit(value: any): void { 
    // console.log(value);
    var actKey = "";
    // console.log(this.recordingList);
    this.eventNotes.push({
      "theme": this.theme, 
      "event": this.eventID, 
      "epoch": Date.now(),
      "act": this.item, 
      "notes": value["notes"], 
      "tags": value["tags"],
      "audioList": this.audioList,
      "imageList": this.imageNameList
    }).then( (item) => { actKey = item.key; } );
    //*** DO VALIDATION TO CHECK THAT THEMES HAS SOMETHING SELECTED

    //*** GO TO NEXT PAGE WITH REORDERED LIST OPTIONS
    console.log(this.audioList);
    for (var f in this.audioList) {
      console.log("uploading audio list");
      // console.log(this.audioList);
      // var path = this.eventID + "/" + actKey + "/" + this.audioList[f].filename;
      var path = this.eventID + "/" + this.audioList[f].fileName;

      
      // const customMetadata = { 
      //   theme: this.theme,
      //   event: this.eventID, 
      //   uploadEpoch: String(Date.now()),
      //   act: this.item, 
      //   activityKey: actKey
      // };

      // const customMetadata = { theme: this.theme, event: this.eventID, epoch: Date.now(),};
      // this.storageRef = this.storage.ref(path);
      this.storageRef = firebase.storage().ref();
      // var uploadRef = this.storageRef.child(`${this.eventID}/${this.audioList[f].filename}`);
      var uploadRef = this.storageRef.child(path);

      // console.log()
      let file = new File();
      var fPath = this.file.externalDataDirectory;
      if (this.platform.is('ios')) {
        fPath = this.file.documentsDirectory.replace(/file:\/\//g, '');
        // fPath = this.file.documentsDirectory;
      }

      this.file.readAsDataURL(fPath, this.audioList[f].filename).then( function (audioText) {
          // console.log(audioText);
          console.log("reading audio data");
          uploadRef.putString(audioText, firebase.storage.StringFormat.DATA_URL).then( (snapshot) => {console.log("audio successful upload")});  
      });
      
      // this.storageRef.putString("asdasd");
      
      // console.log(var a = this.audioList);
      // this.storageRef.put(this.audioList[f]).then;
      // Progress monitoring
      // this.percentage = this.task.percentageChanges();
      // this.snapshot   = this.task.snapshotChanges();

      // The file's download URL
      // this.downloadURL = this.task.downloadURL(); 

    }

    for (var i in this.imageList) {
      console.log("uploading image list");
      // console.log(this.imageList);

      // var path = this.eventID + "/" +  actKey + "/" + this.imageList[i].fileName;
      var path = this.eventID + "/" + this.imageList[i].fileName;
      const customMetadata = { 
        theme: this.theme,
        event: this.eventID, 
        uploadEpoch: String(Date.now()),
        act: this.item, 
        activityKey: actKey
      };
      // this.storageRef = this.storage.ref(path);
      this.storageRef = firebase.storage().ref();
      var uploadRef = this.storageRef.child(path);
      // console.log(this.imageList[i].image);
      // console.log(this.imageList[i].fileName);
      uploadRef.putString(this.imageList[i].image, firebase.storage.StringFormat.DATA_URL).then((snapshot) => {console.log("successful upload")});
    }
    
    this.audioList = [];
    localStorage.setItem("audiolist", JSON.stringify(this.audioList));
    // this.navCtrl.pop();
    // startUpload();

  }

  isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes
  }


  // const file: MediaObject = this.media.create('file.mp3');
  // file.onStatusUpdate.subscribe(status => console.log(status)); // fires when file status changes
  // file.onSuccess.subscribe(() => console.log('Action is successful'));
  // file.onError.subscribe(error => console.log('Error!', error));
  




}
