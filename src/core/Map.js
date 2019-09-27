import { Core } from "./Core";
import { iMap } from "../interface/IMap";

export const Map = Core.extend({
    includes: iMap,
    init: function () {
        this.test = 'I am a test member';
    },
    
    getCenter () {
        console.log(' I have succesfully overriden map mixin .getCenter(), which is stupid');
        return super.getCenter(); //eslint-disable-line
    }
})   
