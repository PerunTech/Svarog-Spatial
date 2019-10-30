(function () {
    let S = {
        version: '0.0.1',
        test_clue: 'run test page [@ ./dist/test.html] find me in global window.S via browser console'
    }

    window.S = S
})()

// class
export { CRS } from './core/proj/CRS';
export { factory } from './Factory';
export { Map } from './core/map/Map';
export { Projection } from './core/proj/Proj';

// Reducers
export * from './core/model/State'


////////////////
///// TEST /////
////////////////
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from './core/model/Provider'
import { MapContainer } from './core/map/MapContainer'

ReactDOM.render(<Provider children={<MapContainer />} />, document.getElementById('app'))

/** Bounding box factory tests */
import { factory } from './Factory'

// string, primitives are coerced to number internally,
// any mixture of arrays of strings / numbers or plain strings / numbers should work.
console.log(factory.boundingBox('  41.32779361376413;21.501059532165527/  41.34355071838928;21.     54028415679932'))
console.log(factory.boundingBox('41.32779361376413,21.501059532165527', '41.34355071838928,21.54028415679932'))
console.log(factory.boundingBox('41.32779361376413', '21.501059532165527', '41.34355071838928', '21.54028415679932'))

// number, primitives are coerced to number internally,
// any mixture of arrays of strings / numbers or plain strings / numbers should work. 
console.log(factory.boundingBox(41.32779361376413, 21.501059532165527, 41.34355071838928, 21.54028415679932))
console.log(factory.boundingBox('41.32779361376413', 21.501059532165527, '41.34355071838928,21.54028415679932'))

// array combinations 
console.log(factory.boundingBox(['41.32779361376413', '21.501059532165527', '41.34355071838928', '21.54028415679932']))
console.log(factory.boundingBox(['41.32779361376413'], ['21.501059532165527'], ['41.34355071838928'], ['21.54028415679932']))
console.log(factory.boundingBox(['41.32779361376413', '21.501059532165527'], ['41.34355071838928', '21.54028415679932']))
console.log(factory.boundingBox([['41.32779361376413', '21.501059532165527'], ['41.34355071838928', '21.54028415679932']]))
console.log(factory.boundingBox([[['41.32779361376413', ['21.501059532165527']]], [[['41.34355071838928'], '21.54028415679932']]]))

// Objects
console.log(factory.boundingBox({x: '41.32779361376413,21.501059532165527,41.34355071838928,21.54028415679932'})) //should fail
