import { React } from 'perun-core';
import { ButtonGroup, Button, Icon } from '..';

export const Import = () => 
    <ButtonGroup id='io' >
        <Button >
            <Icon name='shapefile' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>SHP датотека</span>
        </Button>
        <Button >
            <Icon name='geojson' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>GeoJSON датотека</span>
        </Button>
    </ButtonGroup>;