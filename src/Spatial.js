// Import all publishable modules.
import * as core from './core';
import * as data from './data';
import * as hooks from './Hooks'

// Assemble plugin. 
const Spatial = core.util.create(
{ // Set instance properties.
    version: '0.0.1',
    init (token) { alert(token); }
}, 
{ // Set prototype properties.
    ...core,
    ...data,
    ...hooks
});

// Register on global scope. Export default.
window.Spatial = Spatial;
export default Spatial;




























////////////////
///// TEST /////
////////////////
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, MapContainer } from './core'

ReactDOM.render(<Provider children={<MapContainer />} />, document.getElementById('app'))

/*
import { factory, CRS } from './core'
const test = factory.crs(
    'EPSG: 4326',
    '+proj=utm +zone=38 +ellps=WGS84 +datum=WGS84 +units=m +no_defs'
)
console.log(test)
console.log(test instanceof CRS)
*/

// import { marker } from './tools/Marker'
// markerCreator.enable()
// console.log(marker);
