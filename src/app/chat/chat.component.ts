import {Component, OnInit, OnDestroy} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import {Subscription} from 'rxjs/Subscription';
import {AuthService} from '../providers/auth.service';
import {ActivatedRoute} from '@angular/router';
import {NgForm} from '@angular/forms';

import * as firebase from 'firebase';

declare let audioInterface: any;
declare let audioBlob: any;

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
    private userUID: string;
    private userPhotoURL: string;
    private friendUID: string;
    private userDisplayName: string;
    public friendDisplayName: string;
    public friendPhotoURL: string;
    private chatKey: string;
    private paramSubscription: Subscription;

    private uid1Subscription: Subscription;
    private uid2Subscription: Subscription;
    private friendSubscription: Subscription;

    public shouldDeleteOldMessages = true; // Set to true if you want to save space by not maintaining message history
    private totalMessages = 0; // NOTE: Only updated if shouldDeleteOldMessages is set to true
    private PAGE_SIZE = 10;
    private limit: BehaviorSubject<number> = new BehaviorSubject<number>(this.PAGE_SIZE); // import 'rxjs/BehaviorSubject';
    public messageListArray: FirebaseListObservable<any>;
    private messageListArraySubscription: Subscription;

    private lastKeySubscription: Subscription;
    private lastKey: string;
    private canLoadMoreData: boolean;

    public isRecording: boolean;
    public recordingStartTime: Date;
    public recordingTimeText: string;
    public isLoading = false;

    formatTimeStamp(millis) {
        const date = new Date(millis);
        date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
        return date.toLocaleString();
    }

    constructor(public authService: AuthService, private db: AngularFireDatabase, private route: ActivatedRoute) {
    }

    formatDate(millis) {
        const date = new Date(millis);
        date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
        return date.toLocaleString();
    }

    ngOnInit() {
        audioInterface.initialize();
        this.authService.afAuth.auth.onAuthStateChanged((auth) => {
            if (auth != null) {
                this.userUID = auth.uid;
                this.userDisplayName = auth.displayName;
                this.userPhotoURL = auth.photoURL;
                this.paramSubscription = this.route.params.subscribe(params => {
                    this.chatKey = params['chat-key'];

                    this.findFriendDisplayName();

                    // asyncronously find the last item in the list
                    this.lastKeySubscription = this.db.list('chats/' + this.chatKey + '/messages', {
                        query: {
                            orderByChild: 'post-time',
                            limitToFirst: 1
                        }
                    }).subscribe((data) => {
                        // Found the last key
                        if (data.length > 0) {
                            this.lastKey = data[0].$key;
                        } else {
                            this.lastKey = '';
                        }
                    });

                    this.messageListArray = this.db.list('chats/' + this.chatKey + '/messages', {
                        query: {
                            orderByChild: 'post-time',
                            limitToLast: this.limit // Start at this.PAGE_SIZE newest items
                        }
                    });

                    if (this.shouldDeleteOldMessages) {
                        // Keep track of number of messages to know when to delete old ones
                        this.messageListArray.$ref.on('child_added', (child) => {
                            this.totalMessages += 1;
                        });
                        this.messageListArray.$ref.on('child_removed', (child) => {
                            this.totalMessages -= 1;
                        });
                    }

                    this.messageListArraySubscription = this.messageListArray.subscribe((data) => {
                        this.updateCanLoadState(data);
                    });

                });
            }
        });
    }

    private updateCanLoadState(data) {
        if (data.length > 0) {
            // If the first key in the list equals the last key in the database
            const oldestItemIndex = 0; // remember that the array is displayed in reverse
            this.canLoadMoreData = data[oldestItemIndex].$key !== this.lastKey;
        }
    }

    public startRecoding() {
        audioInterface.startRecording();
        this.recordingTimeText = null;
        this.isRecording = true;
        this.recordingStartTime = new Date();
    }

    public finishRecording() {
        audioInterface.finishRecording();
        const currDate = new Date();
        let timeDifference = currDate.getTime() - this.recordingStartTime.getTime();
        timeDifference = Math.trunc(timeDifference / 1000);
        const minutes = Math.floor(timeDifference / 60);
        const seconds = timeDifference - minutes * 60;
        this.recordingTimeText = '' + minutes + ':' + (seconds < 10 ? '0' : '') + '' + seconds;
        this.isRecording = false;
    }

    private findFriendDisplayName() {
        this.uid1Subscription = this.db.object('chats/' + this.chatKey + '/uid1').subscribe((uid1) => {
            this.uid2Subscription = this.db.object('chats/' + this.chatKey + '/uid2').subscribe((uid2) => {
                this.friendUID = uid1.$value === this.userUID ? uid2.$value : uid1.$value;
                this.friendSubscription = this.db.object('user-profiles/' + this.friendUID).subscribe((friendData) => {
                    this.friendDisplayName = friendData['display-name'];
                    this.friendPhotoURL = friendData['photo-url'];
                    let currDate: Date;
                    currDate = new Date();
                    currDate.setTime(currDate.getTime() + currDate.getTimezoneOffset() * 60 * 1000);
                    let lastInteractedObject: FirebaseObjectObservable<any>;
                    lastInteractedObject = this.db.object('/friend-lists/' + this.userUID + '/' + this.friendUID + '/last-interacted');
                    lastInteractedObject.set(currDate.getTime());
                });
            });
        });
    }

    private tryToLoadMoreData(): void {
        if (this.canLoadMoreData) {
            this.limit.next(this.limit.getValue() + this.PAGE_SIZE);
        }
    }

    public sendMessage(form: NgForm): void {
        if (form.valid && audioBlob !== null) {
            const component = this;
            let currDate: Date;
            currDate = new Date();
            currDate.setTime(currDate.getTime() + currDate.getTimezoneOffset() * 60 * 1000);
            const audioRef = firebase.storage().ref().child('/users/' + component.userUID + '/' + currDate.getTime() + '.wav');
            if (audioInterface.isRecording()) {
                component.finishRecording();
            }
            audioRef.put(audioBlob).then(function (snapshot) {
                const audioURL = snapshot.downloadURL;
                component.messageListArray.push(
                    {
                        'audio-url': audioURL,
                        'poster-display-name': component.userDisplayName,
                        'poster-uid': component.userUID,
                        'post-time': currDate.getTime() // For internationalization purposes
                    });
                form.resetForm();

                if (component.shouldDeleteOldMessages) {
                    component.deleteOldMessages();
                }
                component.isLoading = false;
                component.recordingStartTime = null;
                component.recordingTimeText = null;
                audioBlob = null;
            });
        } else {
            this.recordingTimeText = 'No audio to send';
        }
    }

    private deleteOldMessages() {
        const component = this;
        if (this.totalMessages > component.PAGE_SIZE) {
            const lastMessageRef = component.db.object('chats/' + this.chatKey + '/messages/' + this.lastKey);
            lastMessageRef.subscribe((data) => {
                const storage = firebase.storage();
                if (data['audio-url']) {
                    const imageReference = storage.refFromURL(data['audio-url']);
                    imageReference.delete().then(function () {
                        // File deleted successfully
                        lastMessageRef.set(null).then(function () {
                            component.deleteOldMessages();
                        });
                    }).catch(function (error) {
                        console.log(error);
                    });
                }
            });
        }
    }

    ngOnDestroy() {
        this.paramSubscription.unsubscribe();
        this.lastKeySubscription.unsubscribe();
        this.messageListArraySubscription.unsubscribe();
        this.uid1Subscription.unsubscribe();
        this.uid2Subscription.unsubscribe();
    }
}
