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
import { forkJoin } from "rxjs/observable/forkJoin";
import * as firebase from 'firebase';

import { ToastController } from 'ionic-angular';


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
  imageList: any[] = [];
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

  uploadPromises: Promise<any>[];

  // audioFile: Promise<MediaFile[]>;

  tags = ['positively', 'negatively', 'willingly', 'reluctantly', 'with encouragement', 'independently', 'riskily', 'half-heartedly', 'intensively', 'defiantly', 'proudly'];

  // let options: CaptureImageOptions = { limit: 3 };
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, public media: Media, private file: File, public platform: Platform, db: AngularFireDatabase, private afStorage: AngularFireStorage, private camera: Camera, private toastCtrl: ToastController) {

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
    // this.audioList = [];
    // this.recordingList = [];
    // this.recordingList = [];
    this.imageList = [];
    // this.imageNameList = [];
    // localStorage.setItem("audiolist", JSON.stringify(this.audioList));
    for (var f in this.audioList) {
      this.deleteFile(this.audioList[f].fileName, f, "aud");
    }
    // for (var f in this.imageList) {
    //   this.deleteFile(this.imageList[f].fileName, f, "photo");
    // }


  }

  getAudioList() {
    console.log("getting audio list");
    if(localStorage.getItem("audiolist")) {
      this.audioList = JSON.parse(localStorage.getItem("audiolist"));
      // console.log(this.audioList);
    }
  }

  ionViewWillEnter() {
    console.log("entering ion view");

    // this.audioList = [];
    // this.recordingList = [];
    // this.recordingList = [];
    // this.imageList = [];
    // this.imageNameList = [];
    // localStorage.setItem("audiolist", JSON.stringify(this.audioList));

    // this.getAudioList();
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
        console.log(this.imageList);
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
    console.log(this.audioList);

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

  public deleteFile(fName, index, ftype) {
    console.log("deleting file");
    var fPath = this.file.externalDataDirectory;
    console.log(fName);
    if (this.platform.is('ios')) {
      fPath = this.file.documentsDirectory;      
    }

    if (ftype == "aud") {
      this.file.removeFile(fPath, fName).then( (res) => {
        console.log("successful audio remove"); 
        console.log(this.audioList);
        this.audioList = this.audioList.splice(0, index).concat(this.audioList.splice(index + 1, ));
        console.log(this.audioList);
        localStorage.setItem("audiolist", JSON.stringify(this.audioList));
      }).catch((err) => {
        console.log(err);
        console.log(this.audioList);
      });
      // for (a in this.audioList) {
      //   if (this.audioList[a].fileName == fName) {
      //     this.audioList.splice(a, 1);
      //   }
      // }
    } else if (ftype == "photo") {
      this.imageList = this.imageList.splice(0, index).concat(this.imageList.splice(index + 1, ));
    }
  }

  removePic(filePath, fileName) {
    
  }

  // private startUpload() {

  // }

  public checkUploads() {
    console.log("checking Uploads");
  }

  public presentToast(msgText){
    let toast = this.toastCtrl.create({
      message: msgText,
      duration: 3000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }
  
  onSubmit(value: any): void { 
    // console.log("button click");
    console.log(value);
    var actKey = "";
    // console.log(this.recordingList);
    console.log(this.audioList);
    this.eventNotes.push({
      "theme": this.theme, 
      "event": this.eventID, 
      "epoch": Date.now(),
      "act": this.item, 
      "notes": value["notes"], 
      "tags": value["tags"],
      "audioList": this.audioList,
      "imageList": this.imageList
    }).then( (item) => { 
      actKey = item.key; 
      this.presentToast("note uploaded");
    } );
    //*** DO VALIDATION TO CHECK THAT THEMES HAS SOMETHING SELECTED

    //*** GO TO NEXT PAGE WITH REORDERED LIST OPTIONS
    console.log(this.audioList);

    // Observable.forkJoin()
    var deleted = 0;

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

      var fPath = this.file.externalDataDirectory;
      if (this.platform.is('ios')) {
        fPath = this.file.documentsDirectory;
        console.log(this.audioList[f].fileName);
      }
      deleted = 0;
      this.file.readAsDataURL(fPath, this.audioList[f].fileName).then( function (audioText) {
        // console.log(audioText);
        // console.log("reading audio data");
        uploadRef.putString(audioText, firebase.storage.StringFormat.DATA_URL).then( 
          (snapshot) => {
            console.log("audio successful upload");
            // this.presentToast("audio uploaded");
          }).catch ((err) => {console.log("firebase upload " + err)});
      }).catch((err) => {
        console.log("read data " + err);
      });
      console.log("deleting file before call");
      // this.deleteFile(this.audioList[f].fileName, f, "aud");
      this.getAudioList();
      // this.uploadPromises.push(up);
    }

    for (var i in this.imageList) {
      console.log("uploading image list");
      var path = this.eventID + "/" + this.imageList[i].fileName;
      const customMetadata = { 
        theme: this.theme,
        event: this.eventID, 
        uploadEpoch: String(Date.now()),
        act: this.item, 
        activityKey: actKey
      };
      this.storageRef = firebase.storage().ref();
      var uploadRef = this.storageRef.child(path);
      uploadRef.putString(this.imageList[i].image, firebase.storage.StringFormat.DATA_URL).then((snapshot) => {
        console.log("successful upload");
        this.presentToast("picture uploaded");
        // this.deleteFile(this.imageList[i].fileName, f, "photo");
      });
      // this.deleteFile(this.imageList[i].fileName, f, "photo");
      // this.uploadPromises.push(up);
    }
    
    // for (var f in this.audioList) {
    //   this.deleteFile(this.audioList[f].fileName, f, "aud");
    // }
    // for (var f in this.imageList) {
    //   this.deleteFile(this.imageList[f].fileName, f, "photo");
    // }

    // console.log(this.uploadPromises);
    // forkJoin(this.uploadPromises).subscribe(results => {
    //   console.log(results); 
    //   console.log("uploading forkjoin done");
    //   this.audioList = [];
    //   localStorage.setItem("audiolist", JSON.stringify(this.audioList));
    // });

    


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
