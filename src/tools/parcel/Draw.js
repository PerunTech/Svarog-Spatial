import { drawHandler } from '..';
import { control, Map } from '../../core';
import { Form } from '../../ui';
import { DRAW_PARCEL, MOCK_FORM } from '../../config';

export function drawParcel (opt) {
    // Add map event, on enable (drawStart) => register activity
    // on disable (shape created?) => disable handler, disable form, unhook event etc...
    return control(Form, MOCK_FORM, {position: 'bottomright'}),
        Map.setView(Map.getCenter(), 12).setMinZoom(12),
        drawHandler.polygon({...DRAW_PARCEL, ...opt});
}