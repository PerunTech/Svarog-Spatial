import { store } from '../model/Store'

// map state
store.createReducer('mapState', {
    bbox: '',
    geomSID: 0,
    refreshMap: false,
    zoom: 0,
})



