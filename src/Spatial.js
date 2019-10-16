(function () {
    let S = {
        version: '0.0.1',
        test_clue: 'run test page [@ ./dist/test.html] find me in global window.S via browser console'
    }

    window.S = S
})()

// class
export { CRS } from './core/proj/CRS';
export { Factory } from './Factory';
export { Map } from './core/map/Map';
export { Projection } from './core/proj/Proj';
export * from './TestReducers'
// export { MapContainer } from './MapControl'

////////////////
///// TEST /////
////////////////
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from './core/model/Provider'
import { MapControl } from './core/map/MapControl'

ReactDOM.render(<Provider children={<MapControl />} />, document.getElementById('app'))
