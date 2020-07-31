import { React } from 'perun-core';
import { ButtonGroup, Length, Area, Angle, Radius, Eraser } from '../..';

export const Measurement = () =>
    <ButtonGroup id='measurement' >
        <Length />
        <Area />
        <Angle disabled />
        <Radius />
        <Eraser />
    </ButtonGroup>;