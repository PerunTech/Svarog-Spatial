import { React, PropTypes } from 'perun-core';
import { PROCESS_ENUM } from '../../../config';
import { ButtonGroup, ToolbarButton, Length,  
    area as areaTool, 
    angle as angleTool, 
    eraser as eraserTool } from '../..';

const { area, angle, erase } = PROCESS_ENUM

export const Measurement = props =>
    <ButtonGroup id='measurement' >
        <Length />
        <ToolbarButton id={area} onClick={() => areaTool.enable()} />
        <ToolbarButton id={angle} onClick={() => angleTool.enable()} />
        <ToolbarButton id={erase} onClick={() => eraserTool.clearMeasurements()} />
    </ButtonGroup>;

Measurement.propTypes = {
    activeId: PropTypes.string,
    dispatch: PropTypes.func
}

/* {[length, area, angle].includes(props.activeId) && <Dialog title='Измерена Површина' handler={areaTool} /> } */