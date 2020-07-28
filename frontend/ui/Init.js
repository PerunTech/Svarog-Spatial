import { React } from 'perun-core';
import { store, Provider, MapContainer } from '../core';

/**
 * 
 */
const _appBuilder = {
    render: () => <Provider children={<MapContainer />} />
}
_appBuilder.render.displayName = 'spatial-root';

/**
 * 
 */
export const init = token =>
    (store.dispatch({token: token}), _appBuilder);