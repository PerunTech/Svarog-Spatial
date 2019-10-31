(function () {
    let S = {
        version: '0.0.1',
        test_clue: 'run test page [@ ./dist/test.html] find me in global window.S via browser console'
    }

    window.S = S
})()

// Core

export * from './core/index';

////////////////
///// TEST /////
////////////////
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, MapContainer } from './core/index'

ReactDOM.render(<Provider children={<MapContainer />} />, document.getElementById('app'))


