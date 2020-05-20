import { React } from 'perun-core';
import { control } from '../../../core';
import { Button, Icon, StatusIndicator } from '../..';

export const NavigationControl = () =>
    <>
        <Button className='home' >
            <Icon name='home' size='16px' />
        </Button>
        <Button className='zoom-in' >
            <Icon name='zoom-in' size='16px' />
        </Button>
        <Button className='zoom-out' >
            <Icon name='zoom-out' size='16px' />
        </Button>
        <Button className='bbox-zoom' >
            <Icon name='bbox-zoom' size='20px' />
        </Button>
        <Button className='dummy' >
            <Icon name='dummy' />
        </Button>
        <StatusIndicator />
    </>;

control(NavigationControl, {}, {position: 'bottomright'});