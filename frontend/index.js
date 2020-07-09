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
export const spatial = core.util.assemble(
{ // Set instance properties.
    name: name,
    version: version,
    description: description,
    init: ui.initializer.init,
    routes: [{
        name: 'spatial',
        path: '/main/spatial',
        render: ui.initializer.render,
        isExact: true
    }]
}, 
{ // Set prototype properties.
    config,
    core,
    data,
    tools,
    ui,
});