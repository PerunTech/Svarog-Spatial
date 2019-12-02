import React from 'react';
import { Navigation, Digitization, Measurement } from '..';
import { control } from '../../core';

export function Toolbar () {
    return <div>
        <Navigation />
        <Digitization />
        <Measurement />
    </div>
}
control(Toolbar, {}, {position: 'topleft'});

