import { React } from 'perun-core';
import { store, Provider, MapContainer } from '../core';

export const initializer = {
    init (token) {
        return store.dispatch({token: token}),
            <Provider children={<MapContainer />} />;
    }
}