import { React, PropTypes } from 'perun-core';
import { PROCESS_ENUM } from '../../../config';
import { ButtonGroup, ToolbarButton,
    length as lengthTool, 
    area as areaTool, 
    angle as angleTool, 
    eraser as eraserTool } from '../..';
import { Dialog } from './Dialog';

const { length, area, angle, erase } = PROCESS_ENUM

export const Measurement = props =>
    <ButtonGroup id='measurement' >
        <ToolbarButton id={length} onClick={() => lengthTool.enable()} />
        <ToolbarButton id={area} onClick={() => areaTool.enable()} />
        <ToolbarButton id={angle} onClick={() => angleTool.enable()} />
        <ToolbarButton id={erase} onClick={() => eraserTool.clearMeasurements()} />
    </ButtonGroup>;

Measurement.propTypes = {
    activeId: PropTypes.string,
    dispatch: PropTypes.func
}

/* {[length, area, angle].includes(props.activeId) && <Dialog title='Измерена Површина' handler={areaTool} /> } */