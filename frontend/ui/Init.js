import { React } from 'perun-core';
import { store, Provider, MapContainer } from '../core';

/**
 * 
 */
const _builder = {
    render: () => <Provider children={<MapContainer />} />
}
_builder.render.displayName = 'spatial-root';

/**
 * 
 */
export const init = token =>
    (store.dispatch({token: token}), _builder);