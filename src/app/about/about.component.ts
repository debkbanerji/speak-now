import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

    public LOGO_URL: string;

    constructor() {
    }

    ngOnInit() {
        this.LOGO_URL = '/assets/images/logo.png';
    }

}
