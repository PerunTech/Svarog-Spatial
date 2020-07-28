import { React } from 'perun-core';
import { NAVIGATE_VIEW } from '../../../config';
import { Map, factory, store } from '../../../core';
import { draw } from '../../../tools';
import { Button, Icon, StatusIndicator } from '../..';

const bboxZoom = () => {
    store.dispatch({processID: 'bbox-zoom'});
    
    Map.on('new_shape', function fn ({layer}) {
        store.dispatch({processID: ''})
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
            <Icon name='bbox-zoom' size='18px' />
        </Button>
        <Button className='geolocation' title='Оди на мојата локација' onClick={() => Map.locate({setView: true})} >
            <Icon name='geolocation' size='18px' />
        </Button>
        <StatusIndicator />
    </>;