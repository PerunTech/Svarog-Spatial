import { React } from 'perun-core';
import { ButtonGroup, Button, Icon } from '../..';

export const Selection = () => 
    <ButtonGroup id='selection' >
        <Button >
            <Icon name='informer' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Информатор</span>
        </Button>
        <Button >
            <Icon name='selection' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Избери геометрија</span>
        </Button>
        <Button >
            <Icon name='selection-polygon' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Избери со полигон</span>
        </Button>
        <Button >
            <Icon name='selection-frame' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Избери со рамка</span>
        </Button>
        <Button >
            <Icon name='selection-radius' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Избери со радиус</span>
        </Button>
    </ButtonGroup>;