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
export { Map } from './Map';
export { Projection } from './core/proj/Proj';
export * from './TestReducers'
// export { MapContainer } from './MapControl'

////////////////
///// TEST /////
////////////////
import React from 'react'
import ReactDOM from 'react-dom'
import { Loading } from './ui/loading/Loading'

ReactDOM.render(<Loading messageList={['aaa', 'bbb', 'ccc']} />,
    document.getElementById('mapContainer'))
