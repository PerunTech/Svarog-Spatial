import { store } from '..'
import { MAP_CONFIG, SYS_CENTER, MAP_CONTAINER } from '../../config';

/**
 * The application state tree.
 * 
 * `To be kept flat, deterministic and simple as long as possible.`
 * Derivative values are to be computed in selectors (for listeners),
 * and action creators before they are dispatched here.
 * 
 * This object (with the specified values) is provided as the initial state
 * to the application. Each state.key is managed by a different reducer,
 * generated automatically and combined on store creation.
 */
export const state = {
    app: {
        processID: '',
        selectedWmsFeature: undefined,
    },
    data: {
        layers: {}
    },
    /* Web service requests configuration */
    http: {
        default: {},
    },
    /* Initialization data */
    init: {
        token: ''
    },
    /* Map properties */
    map: {
        id: MAP_CONTAINER,
        zoom: MAP_CONFIG.zoom,
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
        center: SYS_CENTER,
        origin: '',
        bbox: '',
        sid: 0,
    },
    measurement: {
        totalLength: '0 m',
        totalArea: '0 m²'
    },
    layerList: {
        collapsed: false,
        position: 'topright'
    }
};
Object.keys(state).map(key => store.addState(key, state[key]));
