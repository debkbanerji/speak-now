import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import {Router} from '@angular/router';

import {AngularFireDatabase} from 'angularfire2/database';

import {AuthService} from '../providers/auth.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit, OnDestroy {
    private userDataSubscription: Subscription;
    public LOGO_URL: string;

    constructor(public authService: AuthService, private db: AngularFireDatabase, private router: Router, private ngZone: NgZone) {
    }

    ngOnInit() {
        // TODO: Replace
        this.LOGO_URL = '/assets/images/logo.png';
    }

    loginWithGoogle() {
        const component = this;
        this.authService.loginWithGoogle().then((loginData) => {
            this.authService.afAuth.auth.onAuthStateChanged((auth) => {
                if (auth != null) {
                    const userObject = this.db.object('/user-profiles/' + auth.uid);
                    userObject.set({
                        'uid': auth.uid,
                        'email': auth.email,
                        'display-name': auth.displayName,
                        'photo-url': auth.photoURL
                    }).then(_ => {
                        component.ngZone.run(function () {
                            component.router.navigate(['']);
                        });
                    });
                }
            });
        });
    }

    ngOnDestroy() {
        if (this.userDataSubscription) {
            this.userDataSubscription.unsubscribe();
        }
    }
}
