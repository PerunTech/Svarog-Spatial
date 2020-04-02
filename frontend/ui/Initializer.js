import React from 'react';
import { store, Provider, MapContainer } from '../core';

export const initializer = {
    init (token) {
        return store.dispatch({token: token}),
            <Provider children={<MapContainer />} />;
    }
}