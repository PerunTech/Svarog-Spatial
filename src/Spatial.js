(function () {
    let S = {
        version: '0.0.1',
        test_clue: 'run test page [@ ./dist/test.html] find me in global window.S via browser console'
    }

    window.S = S
})()

// class
export { CRS } from './class/CRS';
export { Factory } from './class/Factory';
export { Map } from './class/Map';
export { Projection } from './class/Proj';

////////////////
///// TEST /////
////////////////
import {Factory} from './class/Factory'

let t1 = Factory.projection(undefined, 'EPSG:3857',
            '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m'
            + '+nadgrids=@null +wktext +no_defs',
);
console.log(t1)