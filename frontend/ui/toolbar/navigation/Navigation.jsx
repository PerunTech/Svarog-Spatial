import { React } from 'perun-core';
import { PROCESS_ENUM } from '../../../config';
import { Map } from '../../../core';
import { navigation } from '../../../tools';
import { ButtonGroup, ProcessButton } from '../..';

export const Navigation = props => 
    <ButtonGroup id='navigation' >
        <ProcessButton id='zoom-in' onClick={() => Map.zoomIn()} />
        <ProcessButton id='zoom-out' onClick={() => Map.zoomOut()} />
        <ProcessButton id='search' onClick={navigation.search} />
        <ProcessButton id='origin' onClick={navigation.origin} />
        <ProcessButton id='location' onClick={navigation.point} />
        <ProcessButton id={PROCESS_ENUM.view} onClick={navigation.boxZoom} />
    </ButtonGroup>
