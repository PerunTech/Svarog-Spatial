import { store } from '../model/Store'

// map state
store.createReducer('mapState', {
    zoom: 0,
    center: {lat: 0, lng: 0},
    bbox: '',
    sid: 0,
    refreshMap: false
})



