# Speak Now

*I am not the kind of app*

*That could be just as cool as Facebook on every occasion*

*But you are not the kind of boy*

*Who should be using only cool apps*

![Logo](src/assets/images/logo.png)

Speak Now is a social network in which you communicate using your voice rather than text

Idea by Griffin Dufek

The name, color scheme and tagline were ~~stolen from~~ inspired by the 2010 Taylor Swift song and album of the same name


## Setup

### Dependencies

In order to build the project, you will need both [Node.js](https://nodejs.org/en/) and the Node Package Manager (which can be installed alongside Node.js).

You will also need the [Angular CLI](https://github.com/angular/angular-cli) which can be installed through npm by running the following command:

```
npm install -g @angular/cli
```

Using `-g` will install the command line interface globally, allowing you to use the `ng` command, which is required to run the development server, as well as build the project.

After you have installed npm, run `npm install` in order to install the remaining dependencies.

### Firebase Setup

In order to run the project, you will need to create a Firebase project from the [Firebase console](https://console.firebase.google.com/)
You will also need to enable Google authentication. You can also alter the code if you want to use another sign in provider.
Note that if you are running the application anywhere other than `localhost` you will need to allow login from other URLS through the Firebase Console.

Then fill out `src/app/config/firebase-config.ts` according to the credentials taken from the Firebase console. You can get the config object by clicking "Add Firebase to your web app"

The contents of the file should look similar to this:
```
export const config = {
  apiKey: 'YOUR_API_KEY_HERE',
  authDomain: 'YOUR_AUTH_DOMAIN_HERE',
  databaseURL: 'YOUR_DATABASE_URL_HERE',
  projectId: 'YOUR_PROJECT_ID_HERE',
  storageBucket: 'YOUR_STORAGE_BUCKET_HERE',
  messagingSenderId: 'YOUR_MESSENGER_SENDER_ID_HERE'
};
```
#### Publishing Rules

##### Realtime Database

The default Firebase realtime database rules are as follows:
```
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```
For increased security and performance, it is recommended that you replace these rules with those defined in `firebase-database-rules.json`.

For faster (albeit less secure) development, you can also replace the rules with:
```
{
  "rules": {
    ".read": "true",
    ".write": "true"
  }
}
```

##### Storage

The default Firebase storage rules are as follows:

```
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

For increased security, it is recommended that you replace these rules with those defined in `firebase-storage-rules`.

For faster (albeit less secure) development, you can also replace the rules with:
```
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write;
    }
  }
}
```

## Starting The Application in a Development Environment

You can start a development server by running `npm run develop` and navigating to `http://localhost:4200/` The app will automatically reload if you change any of the source files.
Note that this is simply a wrapper around `ng serve`.

## Building The Application

You can create a production build of the application in the `dist` folder by running the `build` npm script:

`npm run build`

This is a wrapper around the `ng build -prod` command which creates a production build of the application. It also copies over both a `package.json` file (for npm) and a `server.js` file.
This server file will run the application on `http://localhost:3000/`.

You can use `npm run messy-build` in order to build the application without the production flag, which may be necessary if you are running into errors while building.

If you only want the static files, without the server and package files, you can simply run `ng build` yourself. If you do this, you can also run `node distribution-server.js` in order to test the build.

Note: On Windows, you will have to copy over the files in  `dist-utility-files` manually, as the `cp` command is not supported.

## Deploying The Application

If you are deploying the application to a production environment, it is recommended for you to build the application and deploy the static files of the built version (optionally using the 2 files in `dist-utility-files`).

## Using The Angular CLI

You can use the [Angular CLI](https://github.com/angular/angular-cli) to aid development by running the `ng` command.

### Development server

Run `ng serve` for a development server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Other Information

This application was initialized using [Angular Firebase Initializer](http://generator.debkbanerji.com/) on 10/28/2017, 7:05:35 PM

Made with ♥ by [Deb Banerji](http://debkbanerji.com/)
