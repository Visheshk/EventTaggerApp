import { Component, ViewChild } from '@angular/core';

import { HockeyApp } from 'ionic-hockeyapp';
import { Platform, App, MenuController, Nav } from 'ionic-angular';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  rootPage = HelloIonicPage;
  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    app:App,
    hockeyapp: HockeyApp
  ) {
    this.initializeApp();

    // set our app's pages
    this.pages = [
      { title: 'Hello Ionic', component: HelloIonicPage },
      { title: 'My First List', component: ListPage }
    ];

    platform.ready().then(() => {
          // The Android ID of the app as provided by the HockeyApp portal. Can be null if for iOS only.
      let androidAppId = '9e49aeddaa96488891f0a46b52b27618';
      // The iOS ID of the app as provided by the HockeyApp portal. Can be null if for android only.
      let iosAppId = 'aed7022b0e4340ef9281edfa888e9ae7';
      // Specifies whether you would like crash reports to be automatically sent to the HockeyApp server when the end user restarts the app.
      let autoSendCrashReports = false;
      // Specifies whether you would like to display the standard dialog when the app is about to crash. This parameter is only relevant on Android.
      let ignoreCrashDialog = true;
   
      hockeyapp.start(androidAppId, iosAppId, autoSendCrashReports, ignoreCrashDialog);
   
      //So app doesn't close when hockey app activities close
      //This also has a side effect of unable to close the app when on the rootPage and using the back button.
      //Back button will perform as normal on other pages and pop to the previous page.
      platform.registerBackButtonAction(() => {
        let nav = app.getRootNav();
        if (nav.canGoBack()) {
          nav.pop();
        } else {
          nav.setRoot(this.rootPage);
        }
      });
    })

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }
}
