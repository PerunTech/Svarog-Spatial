// Import all publishable modules.
import * as core from './core/index';
import * as data from './data/index';
import * as hooks from './Hooks'

// Assemble plugin. 
const Spatial = core.util.create({
    // Set prototype properties.
    ...core,
    ...data,
    ...hooks
})
// Set instance properties.
core.util.clone(Spatial, {
    version: '0.0.1',
    init (token) { alert(token); }
})
console.log(Spatial)
// Register on global scope.
window.Spatial = Spatial;