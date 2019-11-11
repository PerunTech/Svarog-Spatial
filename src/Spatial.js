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



import { drawMarker } from './tools/draw/Marker'
console.log(drawMarker);
// drawMarker.enable()
