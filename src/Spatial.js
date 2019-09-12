(function () {
    let S = {
        version: '0.0.1',
        test_clue: 'run test page [@ ./dist/test.html] find me in global window.S via browser console'
    }

    window.S = S
})()

export {Util} from './core/Util'
export {Core} from './core/Core'
export {IRender} from './interface/IRender'
export {Proj} from './core/proj/Proj'

import {CRS} from './core/proj/CRS'
let test_crs = CRS.crs('EPSG:32638',
'+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs',
{
    origin: [-180, +90],
    scales: [
        5000000,
        2500000,
        1000000, // 10 km
        750000,
        500000,
        250000,
        100000, // 1000m or 1 km
        75000,
        50000,
        25000,
        10000, // 100m
        7500,
        5000,
        2500,
        1000, // 1000 cm = 10 m
        750,
        500,
        250,
        100 // 1m
    ]
})

console.log(test_crs)