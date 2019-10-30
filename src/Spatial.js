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

// import {renderCycle} from './core/map/RenderCycle'
// renderCycle.fetch()