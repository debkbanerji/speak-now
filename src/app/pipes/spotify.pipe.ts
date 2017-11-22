import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'spotify'
})
export class SpotifyPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        const spotifyLinkRegex = /(http(s|):\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+$)|(spotify:track:[a-zA-Z0-9]+$)/g;

        if (!value || !value.match(spotifyLinkRegex)) {
            return null;
        }

        const splitValue = value.split(/:|\//);
        return splitValue[splitValue.length - 1];
    }

}
