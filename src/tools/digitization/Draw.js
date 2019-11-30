import { drawHandler } from '..';
import { control, Map } from '../../core';
import { Form } from '../../ui';
import { MIN_DIGI_SCALE, DRAW_PARCEL, MOCK_FORM, MAP_CONFIG } from '../../config';

export function drawParcel (opt) {
    return control(Form, MOCK_FORM, {position: 'bottomright'}),
        Map.setMinZoom(MIN_DIGI_SCALE).once('pm:create', () => Map.setMinZoom(MAP_CONFIG.minZoom)),
        drawHandler.polygon({...DRAW_PARCEL, ...opt});
}