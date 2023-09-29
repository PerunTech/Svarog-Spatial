import { React } from 'perun-core';
import { ButtonGroup, Button, Icon, Divider } from '..';
import { getLabel } from '../utils/labels';

export const Selection = () =>
    <ButtonGroup id='selection' >
        <Button disabled >
            <Icon name='selection' size='30px' />
            <span style={{ display: 'block', marginTop: '5px' }}>{getLabel('select_geometry')}</span>
        </Button>
        <Divider />
        <Button disabled >
            <Icon name='selection-polygon' size='30px' />
            <span style={{ display: 'block', marginTop: '5px' }}>{getLabel('polygon_selection')}</span>
        </Button>
        <Button disabled >
            <Icon name='selection-frame' size='30px' />
            <span style={{ display: 'block', marginTop: '5px' }}>{getLabel('frame_selection')}</span>
        </Button>
        <Button disabled >
            <Icon name='selection-radius' size='30px' />
            <span style={{ display: 'block', marginTop: '5px' }}>{getLabel('radius_selection')}</span>
        </Button>
        <Divider />
        <Button disabled >
            <Icon name='informer' size='28px' />
            <span style={{ display: 'block', marginTop: '5px' }}>{getLabel('info')}</span>
        </Button>
    </ButtonGroup>;