import { draw } from '../../../tools';
import { control, http, store, Map } from '../../../core';
import { MIN_DIGI_SCALE, DRAW_PARCEL, MAP_CONFIG, PROCESS_ENUM } from '../../../config';
import { ParcelForm } from '../..';

export const drawParcel = {
    type: 'Polygon',

    enable (opt) {
        return this.generateForm()
            .setZoomControl()
            .setActiveProcess()
            .drawPolygon(opt);
    },

    disable () {

    },

    generateForm () {
        http.callConcurrently(['drawParcel_jsonSchema', 'drawParcel_uiSchema'])
            .then(response => {
                control(ParcelForm, 
                    { schema: _formatSchema(response[0].data), uiSchema: response[1].data}, 
                    {position: 'bottomright'})
            }).catch(err => console.log(err));
        
        return this;
    },

    setZoomControl () {
        return Map.setMinZoom(MIN_DIGI_SCALE)
            .once('new_shape', () => Map.setMinZoom(MAP_CONFIG.minZoom)),
            this;
    },

    drawPolygon (opt) { return draw.polygon.enable({...DRAW_PARCEL, ...opt}), this; },

    setActiveProcess () { return store.dispatch({processID: PROCESS_ENUM.draw}), this; }
}

function _formatSchema (schema) {
    const tmpl = [{ 
        "type":"object",
        "title":"Генералии",
        fields_tmpl: ['PARCEL_ID', 'LAND_USE_ID_1', 'COMMON_USE', 'CAD_MUNIC_ID', 'PHYSICAL_BLOCK_ID'],
        properties: {}
    }, { 
        "type":"object",
        "title":"Просторни податоци",
        fields_tmpl: ['AREA', 'ALLOWED_AREA', 'PERIMETER'],
        properties: {}
    }, { 
        "type":"object",
        "title":"Помошни информации",
        fields_tmpl: ['TERRACE', 'INVISIBLE_BORDER', 'CHANGE_BORDER', 'IRRIGATION', 'EXP_AVG', 'ALTITUDE_AVG', 'SLOPE_AVG'],
        properties: {}
    }];

    const props = {}
    tmpl.map(item => {
        item.fields_tmpl.map(f=> item.properties[f] = schema.properties[f])
        delete item.fields_tmpl
        return props[item.title] = item;
    })
    schema.properties = props

    return schema;
}