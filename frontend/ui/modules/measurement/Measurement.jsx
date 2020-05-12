import { React } from 'perun-core';
import { PROCESS_ENUM } from '../../../config';
import { ButtonGroup, ToolbarButton, Length, Area, Eraser,
    angle as angleTool } from '../..';

const { angle } = PROCESS_ENUM

export const Measurement = () =>
    <ButtonGroup id='measurement' >
        <Length />
        <Area />
        <ToolbarButton id={angle} onClick={() => angleTool.enable()} />
        <Eraser />
    </ButtonGroup>;

/* {[length, area, angle].includes(props.activeId) && <Dialog title='Измерена Површина' handler={areaTool} /> } */