import React from 'react';
import { PROCESS_ENUM } from '../../../config';
import { ButtonGroup, ProcessButton, length, area, angle, eraser, drawActions } from '../..';
import { control } from '../../../core';

export function Measurement () {
    return <ButtonGroup id='measurement' >
        <ProcessButton id={PROCESS_ENUM.length} onClick={() => length.enable()} children={drawActions(length)} />
        <ProcessButton id={PROCESS_ENUM.area} onClick={() => area.enable()} children={drawActions(area)} />
        <ProcessButton id={PROCESS_ENUM.angle} onClick={() => angle.enable()} />
        <ProcessButton id={PROCESS_ENUM.erase} onClick={()=> eraser.clearMeasurements()} />
    </ButtonGroup>
}

// control(Measurement, {}, {position: 'top'})