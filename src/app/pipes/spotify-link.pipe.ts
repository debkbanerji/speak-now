import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Pipe({
    name: 'spotifyLink'
})
export class SpotifyLinkPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) {
    }

    transform(songId: any, args?: any): any {
        return this.sanitizer.bypassSecurityTrustResourceUrl('https://open.spotify.com/embed?uri=spotify:track:' + songId + '&theme=white');
    }

}
