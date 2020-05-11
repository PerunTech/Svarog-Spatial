import { React } from 'perun-core';
import { PROCESS_ENUM } from '../../../config';
import { Map } from '../../../core';
import { navigation } from '../../../tools';
import { ButtonGroup, ToolbarButton } from '../..';

export const Navigation = props => 
    <ButtonGroup id='navigation' >
        <ToolbarButton id='zoom-in' onClick={() => Map.zoomIn()} />
        <ToolbarButton id='zoom-out' onClick={() => Map.zoomOut()} />
        <ToolbarButton id='search' onClick={navigation.search} />
        <ToolbarButton id='origin' onClick={navigation.origin} />
        <ToolbarButton id='location' onClick={navigation.point} />
        <ToolbarButton id={PROCESS_ENUM.view} onClick={navigation.boxZoom} />
    </ButtonGroup>
