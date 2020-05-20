import { React } from 'perun-core';
import { ButtonGroup, Length, Area, Angle, Eraser } from '../..';

export const Measurement = () =>
    <ButtonGroup id='measurement' >
        <Length />
        <Area />
        <Angle disabled />
        <Eraser />
    </ButtonGroup>;