import { React } from 'perun-core';
import { ButtonGroup, Button, Icon } from '../..';

export const Export = () => 
    <ButtonGroup id='io' >
        <Button >
            <Icon name='shapefile' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>SHP датотека</span>
        </Button>
        <Button >
            <Icon name='geojson' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>GeoJSON датотека</span>
        </Button>
        <Button >
            <Icon name='csv' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>CSV датотека</span>
        </Button>
        <Button >
            <Icon name='xsl' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>XSL датотека</span>
        </Button>
        <Button >
            <Icon name='pdf' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>PDF датотека</span>
        </Button>
        <Button >
            <Icon name='map-report' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Картографски извештај</span>
        </Button>
        <Button >
            <Icon name='print' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Испечати</span>
        </Button>
    </ButtonGroup>;