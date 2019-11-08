import { name, version, description } from '../package.json';
// Import all publishable modules.
import * as core from './core';
import * as data from './data';
import * as hooks from './Hooks';

// Assemble plugin. 
const plugin = core.util.create(
{ // Set instance properties.
    name: name,
    version: version,
    description: description,
    init (token) { alert(token); }
}, 
{ // Set prototype properties.
    ...core,
    ...data,
    ...hooks
});

// Register on global scope. Export default.
window[name] = plugin;
export default plugin;




























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

import { drawMarker } from './tools/draw/Marker'
console.log(drawMarker);
// drawMarker.enable()
