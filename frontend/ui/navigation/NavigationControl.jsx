import { React } from 'perun-core';
import { NAVIGATE_VIEW, SYS_CENTER } from '../../config';
import { Map, store } from '../../core';
import { draw } from '../../tools';
import { Button, Icon, StatusIndicator } from '..';
import { getLabel } from '../utils/labels';

const bboxZoom = () => {
    store.dispatch({ processID: 'bbox-zoom' });

    Map.on('new_shape', function fn({ layer }) {
        store.dispatch({ processID: '' })
        Map.fitBounds(layer.getBounds()).off('new_shape', fn).removeLayer(layer);
    });

    return draw.rectangle.enable(NAVIGATE_VIEW);
};

const origin = () =>
    Map.setView(SYS_CENTER, 3);

export const NavigationControl = () =>
    <>
        <Button className='home' title={getLabel('go_to_origin')} onClick={() => origin()} >
            <Icon name='map-home' size='20px' />
        </Button>
        <Button className='zoom-in' title={getLabel('zoom_in')} onClick={() => Map.zoomIn()} >
            <Icon name='zoom-in' size='16px' />
        </Button>
        <Button className='zoom-out' title={getLabel('zoom_out')} onClick={() => Map.zoomOut()} >
            <Icon name='zoom-out' size='16px' />
        </Button>
        <Button className='bbox-zoom' title={getLabel('bbox_zoom')} onClick={() => bboxZoom()} >
            <Icon name='bbox-zoom' size='18px' />
        </Button>
        <Button className='geolocation' title={getLabel('geolocation')} onClick={() => Map.locate({ setView: true })} >
            <Icon name='geolocation' size='18px' />
        </Button>
        <StatusIndicator />
    </>;