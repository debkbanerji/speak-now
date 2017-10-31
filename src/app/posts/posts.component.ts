import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';

import {AngularFireDatabase, FirebaseObjectObservable, FirebaseListObservable} from 'angularfire2/database';
import * as firebase from 'firebase';

import {AuthService} from '../providers/auth.service';
import {Subscription} from 'rxjs/Subscription';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Ng2FileInputComponent} from 'ng2-file-input';

declare let audioInterface: any;
declare let audioBlob: any;

@Component({
    selector: 'app-text-posts',
    templateUrl: './posts.component.html',
    styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit, OnDestroy {
    @ViewChild(Ng2FileInputComponent) fileInputComponent: Ng2FileInputComponent;

    private PAGE_SIZE = 10;
    private limit: BehaviorSubject<number> = new BehaviorSubject<number>(this.PAGE_SIZE); // import 'rxjs/BehaviorSubject';
    private feedLocation: string;
    public postsArray: FirebaseListObservable<any>;
    private postsArraySubscription: Subscription;
    private lastKey: String;
    private lastKeySubscription: Subscription;
    public numPostsObject: FirebaseObjectObservable<any>;
    public canLoadMoreData: boolean;
    public submitText: String;
    private userDisplayName: String;
    private userUID: String;
    public isRecording: boolean;
    public recordingStartTime: Date;
    public recordingTimeText: string;
    public isLoading = false;

    formatDate(millis) {
        const date = new Date(millis);
        date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
        return date.toLocaleString();
    }

    constructor(public authService: AuthService, private db: AngularFireDatabase) {
    }

    ngOnInit() {
        audioInterface.initialize();
        this.submitText = '';
        this.feedLocation = '/posts';
        this.numPostsObject = this.db.object(this.feedLocation + '/num-posts');

        // Set up file input component
        this.fileInputComponent.showPreviews = false; // Set to true to show previews of uploaded images
        this.fileInputComponent.extensions = ['jpg', 'jpeg', 'png', 'svg', 'img'];
        this.fileInputComponent.multiple = true;
        this.fileInputComponent.dropText = 'Drop Image to Upload';
        this.fileInputComponent.invalidFileText = 'Please upload an image file';

        // asyncronously find the last item in the list
        this.lastKeySubscription = this.db.list(this.feedLocation + '/posts', {
            query: {
                orderByChild: 'datetime',
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


        this.postsArray = this.db.list(this.feedLocation + '/posts', {
            query: {
                orderByChild: 'datetime',
                limitToLast: this.limit // Start at this.PAGE_SIZE newest items
            }
        });


        this.postsArraySubscription = this.postsArray.subscribe((data) => {
            this.updateCanLoadState(data);
        });


        this.authService.afAuth.auth.onAuthStateChanged((auth) => {
            if (auth == null) {
                // not logged in
                this.userDisplayName = '';
                this.userUID = '';
            } else {
                // logged in
                this.userDisplayName = auth.displayName;
                this.userUID = auth.uid;
            }
        });

        // // automatically try to load more data when scrolling down
        // window.onscroll = () => {
        //     if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        //         // Reached the bottom of the page
        //         this.tryToLoadMoreData();
        //     }
        // };

        // // Use this code to debug time zone differences
        // console.log((new Date()).getTimezoneOffset());
        // Date.prototype.getTimezoneOffset = function () {
        //     return -330;
        // };
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

    private updateCanLoadState(data) {
        if (data.length > 0) {
            // If the first key in the list equals the last key in the database
            const oldestItemIndex = 0;
            this.canLoadMoreData = data[oldestItemIndex].$key !== this.lastKey;
        }
    }


    public tryToLoadMoreData(): void {
        if (this.canLoadMoreData) {
            this.limit.next(this.limit.getValue() + this.PAGE_SIZE);
        }
    }

    public onSubmit(form: NgForm) {
        if (audioBlob == null) {
            this.submitText = 'Please record audio to post';

        } else if (form.valid) {
            this.isLoading = true;
            let currDate: Date;
            currDate = new Date();
            currDate.setTime(currDate.getTime() + currDate.getTimezoneOffset() * 60 * 1000); // For internationalization purposes
            const timestamp = currDate.getTime();


            const component = this; // For accessing within promise

            const audioRef = firebase.storage().ref().child('/users/' + this.userUID + '/' + timestamp + '.wav');
            if (audioInterface.isRecording()) {
                component.finishRecording();
            }
            audioRef.put(audioBlob).then(function (snapshot) {
                const audioURL = snapshot.downloadURL;

                const post = {
                    'title': form.value.title,
                    // 'text': form.value.text,
                    'audio-url': audioURL,
                    // 'audio-text': component.recordingTimeText,
                    'poster-display-name': component.userDisplayName,
                    'poster-uid': component.userUID,
                    'datetime': timestamp
                };

                if (component.fileInputComponent.currentFiles.length > 0) {
                    const image = component.fileInputComponent.currentFiles[0]; // Input is limited to one file - can be changed in view
                    const imageRef = firebase.storage().ref().child('/users/' + component.userUID + '/' + timestamp);
                    // Unique path as one user cannot upload multiple files at the exact same time

                    imageRef.put(image).then(function (imageSnapshot) {
                        // Remove image from form
                        component.removeImage(image);
                        // Add image URL, then push post
                        post['image-url'] = imageSnapshot.downloadURL;
                        component.postsArray.push(post);
                        component.onPostSuccess(form);
                    }).catch(function (error) {
                        console.log(error);
                    });
                } else {
                    // Push without uploading image
                    component.postsArray.push(post);
                    component.onPostSuccess(form);
                }
            }).catch(function (error) {
                console.log(error);
            });


        } else {
            this.submitText = 'Please fill out the required data';
        }
    }

    private onPostSuccess(form: NgForm) {
        this.numPostsObject.$ref.transaction(data => {
            return data + 1;
        });
        form.resetForm();
        this.submitText = 'Successfully made post';
        this.isLoading = false;
        this.recordingStartTime = null;
        this.recordingTimeText = null;
        audioBlob = null;
    }

    private removeImage(file) {
        this.fileInputComponent.removeFile(file);
    }

    public removePost(post) {
        this.postsArray.remove(post.$key);
        if (post['image-url']) {
            // There is an associated image that needs to be deleted
            const storage = firebase.storage();
            const imageReference = storage.refFromURL(post['image-url']);
            imageReference.delete().then(function () {
                // File deleted successfully
            }).catch(function (error) {
                console.log(error);
            });
        }
        if (post['audio-url']) {
            // There is an associated audio file that needs to be deleted
            const storage = firebase.storage();
            const audioReference = storage.refFromURL(post['audio-url']);
            audioReference.delete().then(function () {
                // File deleted successfully
            }).catch(function (error) {
                console.log(error);
            });
        }
        this.numPostsObject.$ref.transaction(data => {
            return data - 1;
        });
    }

    ngOnDestroy() {
        if (this.lastKeySubscription) {
            this.lastKeySubscription.unsubscribe();
        }
        if (this.postsArraySubscription) {
            this.postsArraySubscription.unsubscribe();
        }
        // window.onscroll = () => {
        //     // Clearing onscroll implementation (may not be necessary)
        // };
    }
}
