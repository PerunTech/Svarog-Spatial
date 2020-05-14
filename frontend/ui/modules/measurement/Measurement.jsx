import { React } from 'perun-core';
import { ButtonGroup, Length, Area, Angle, Eraser } from '../..';

export const Measurement = () =>
    <ButtonGroup id='measurement' >
        <Length />
        <Area />
        <Angle disabled />
        <Eraser />
    </ButtonGroup>;

/* {[length, area, angle].includes(props.activeId) && <Dialog title='Измерена Површина' handler={areaTool} /> } */