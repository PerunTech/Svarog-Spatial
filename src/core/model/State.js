import { store } from '../index'

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
    /** Map properties */
    map: {
        zoom: 0,
        center: {lat: 0, lng: 0},
        origin: '',
        bbox: '',
        sid: 0,
        refreshMap: false
    }, 
    /** Web service requests configuration */
    http: {
        origin: {
            url: '/sws/origin',
            method: 'get',
            responseType: 'text'
        },
    }
}
Object.keys(state).map(key => { store.addState(key, state[key]); })



