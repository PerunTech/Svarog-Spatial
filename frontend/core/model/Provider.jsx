import { React, PropTypes, Provider as StoreProvider} from 'perun-core';
import { store } from '..';

/**
 * Provides Redux store access to connected components.
 * To be used as wrapper of the root React element (so you don't need to spam it everywhere).
 * 
 * &nbsp;
 * 
 * @function Provider (children: ReactNode, context: ReactNode): Provider
 * 
 * @param {Object} props - Properties.
 * @param {React.ReactNode} props.children - The React element(s) to be rendered in the provider.
 * @param {React.ReactNode} [props.context] - Context of execution for the passed children. Think of HOCs.
 * 
 * @returns Provider; 
 */
export function Provider ({children, context}) {
    return <StoreProvider store={store} context={context}>
        {children}
    </StoreProvider>
}

Provider.propTypes = {
    children: PropTypes.node,
    // #revise_me, is context a ReactNode type?
    // ReactNode is the most broad react definition
    context: PropTypes.node 
}