import { React } from 'perun-core';
import { PROCESS_ENUM } from '../../../config';
import { ButtonGroup, ToolbarButton, Length, Area,
    angle as angleTool, 
    eraser as eraserTool } from '../..';

const { angle, erase } = PROCESS_ENUM

export const Measurement = () =>
    <ButtonGroup id='measurement' >
        <Length />
        <Area />
        <ToolbarButton id={angle} onClick={() => angleTool.enable()} />
        <ToolbarButton id={erase} onClick={() => eraserTool.clearMeasurements()} />
    </ButtonGroup>;

/* {[length, area, angle].includes(props.activeId) && <Dialog title='Измерена Површина' handler={areaTool} /> } */