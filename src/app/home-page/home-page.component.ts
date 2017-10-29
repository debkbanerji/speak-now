import {Component, OnInit} from '@angular/core';
import {AuthService} from '../providers/auth.service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

    public displayName: string;
    public LOGO_URL: string;

    constructor(public authService: AuthService, private router: Router) {
    }

    ngOnInit() {
        this.LOGO_URL = '/assets/images/logo.png';
        this.authService.afAuth.auth.onAuthStateChanged((auth) => {
            if (auth != null) {
                this.displayName = auth.displayName;
            }
        });
    }

    public openAboutPage() {
        console.log('yoo');
        this.router.navigate(['about']);
    };

}
