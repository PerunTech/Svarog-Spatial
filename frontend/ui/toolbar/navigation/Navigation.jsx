import { React } from 'perun-core';
import { PROCESS_ENUM } from '../../../config';
import { Map, control } from '../../../core';
import { navigation } from '../../../tools';
import { ButtonGroup, ProcessButton } from '../..';

export function Navigation () {
    return <div>
        {<div style={{height: '25px'}} /> }
        <ButtonGroup id='navigation' >
            <ProcessButton id='zoom-in' onClick={() => Map.zoomIn()} />
            <ProcessButton id='zoom-out' onClick={() => Map.zoomOut()} />
            <ProcessButton id='search' onClick={navigation.search} />
            <ProcessButton id='origin' onClick={navigation.origin} />
            <ProcessButton id='location' onClick={navigation.point} />
            <ProcessButton id={PROCESS_ENUM.view} onClick={navigation.boxZoom} />
            <ProcessButton id='zoom-in' onClick={() => Map.zoomIn()} />
            <ProcessButton id='zoom-out' onClick={() => Map.zoomOut()} />
            <ProcessButton id='search' onClick={navigation.search} />
            <ProcessButton id='origin' onClick={navigation.origin} />
            <ProcessButton id='location' onClick={navigation.point} />
            <ProcessButton id={PROCESS_ENUM.view} onClick={navigation.boxZoom} />
            <ProcessButton id='zoom-in' onClick={() => Map.zoomIn()} />
            <ProcessButton id='zoom-out' onClick={() => Map.zoomOut()} />
            <ProcessButton id='search' onClick={navigation.search} />
            <ProcessButton id='origin' onClick={navigation.origin} />
            <ProcessButton id='location' onClick={navigation.point} />
            <ProcessButton id={PROCESS_ENUM.view} onClick={navigation.boxZoom} />
        </ButtonGroup>
    </div> 


}

control(Navigation, {}, {position: 'top'})

/*
        <ProcessButton id='zoom-in' onClick={() => Map.zoomIn()} />
        <ProcessButton id='zoom-out' onClick={() => Map.zoomOut()} />

        <ProcessButton id='origin' onClick={navigation.origin} />
        <ProcessButton id='location' onClick={navigation.point} />
        <ProcessButton id={PROCESS_ENUM.view} onClick={navigation.boxZoom} />
*/
