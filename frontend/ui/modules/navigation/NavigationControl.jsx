import { React } from 'perun-core';
import { NAVIGATE_VIEW } from '../../../config';
import { control, Map, factory, store } from '../../../core';
import { draw } from '../../../tools';
import { Button, Icon, StatusIndicator } from '../..';

const bboxZoom = () => {
    Map.on('new_shape', function fn ({layer}) {
        Map.fitBounds(layer.getBounds()).off('new_shape', fn).removeLayer(layer);
    });

    return draw.rectangle.enable(NAVIGATE_VIEW);
};

const origin = () => 
    Map.fitBounds(factory.boundingBox(store.getState().map.origin));

export const NavigationControl = () =>
    <>
        <Button className='home' title='Оди на почеток' onClick={() => origin()} >
            <Icon name='home' size='16px' />
        </Button>
        <Button className='zoom-in' title='Намали размер' onClick={() => Map.zoomIn()} >
            <Icon name='zoom-in' size='16px' />
        </Button>
        <Button className='zoom-out' title='Зголеми размер' onClick={() => Map.zoomOut()} >
            <Icon name='zoom-out' size='16px' />
        </Button>
        <Button className='bbox-zoom' title='Оди до рамка' onClick={() => bboxZoom()} >
            <Icon name='bbox-zoom' size='20px' />
        </Button>
        <Button className='dummy' >
            <Icon name='dummy' />
        </Button>
        <StatusIndicator />
    </>;

control(NavigationControl, {}, {position: 'bottomright'});