import { getLabel } from "../ui/utils/labels";

export const getProcessTitle = id => {
    const PROCESS_TITLE = {
        'zoom-in': `${getLabel('zoom_in')}`,
        'zoom-out': `${getLabel('zoom_out')}`,
        search: `${getLabel('search')}`,
        origin: `${getLabel('go_to_origin')}`,
        location: `${getLabel('go_to_location')}`,
        view: 'Оди на рамка',
        draw: `${getLabel('draw')}`,
        edit: `${getLabel('edit')}`,
        cut: `${getLabel('cut')}`,
        split: `${getLabel('split')}`,
        merge: `${getLabel('merge')}`,
        landscape: `${getLabel('landscape')}`,
        length: `${getLabel('length')}`,
        area: `${getLabel('area')}`,
        radius: `${getLabel('radius')}`,
        angle: `${getLabel('angle')}`,
        erase: `${getLabel('erase')}`,
        'finish-shape': `${getLabel('finish_shape')}`,
        'delete-last-vertex': `${getLabel('delete_last_vertex')}`,
        'cancel-draw': `${getLabel('cancel')}`
    }

    return PROCESS_TITLE[id] || '';
};

export const getDrawTooltip = type => {
    const tooltips = {
        'placeMarker': `${getLabel('place_marker')}`,
        'firstVertex': `${getLabel('place_first_vertex')}`,
        'continueLine': `${getLabel('continue_line')}`,
        'finishLine': `${getLabel('finish_line')}`,
        'finishPoly': `${getLabel('finish_polygon')}`,
        'finishRect': `${getLabel('finish_rect')}`,
        'startCircle': `${getLabel('start_circle')}`,
        'finishCircle': `${getLabel('finish_circle')}`,
        'placeCircleMarker': `${getLabel('place_circle_marker')}`
    };

    return tooltips[type] || '';
};