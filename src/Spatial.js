import { name, version, description } from '../package.json';
// Import all assets
import './assets';
// Import all publishable modules.
import * as config from './config';
import * as core from './core';
import * as data from './data';
import * as tools from './tools';
import * as ui from './ui';

// Assemble plugin.
const spatial = core.util.assemble(
{ // Set instance properties.
    name: name,
    version: version,
    description: description,
    init (token) { alert(token); }
}, 
{ // Set prototype properties.
    config,
    core,
    data,
    tools,
    ui,
});

// Register on global scope. Export default.
window[name] = spatial;
export default spatial;





















////////////////
///// TEST /////
////////////////
import React from 'react'
import ReactDOM from 'react-dom'
const { Provider, MapContainer } = core

ReactDOM.render(<Provider children={<MapContainer />} />, document.getElementById('app'))