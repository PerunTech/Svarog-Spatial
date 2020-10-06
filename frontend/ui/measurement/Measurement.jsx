import { React } from 'perun-core';
import { ButtonGroup, Length, Area, Angle, Radius, Eraser, Divider } from '..';

export const Measurement = () =>
    <ButtonGroup id='measurement' >
        <Length />
        <Area />
        <Angle />
        <Radius />
        <Divider />
        <Eraser />
    </ButtonGroup>;