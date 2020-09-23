import { React, PropTypes } from 'perun-core';

/**
 * Represents a single node in a hierarchical data view (tree).
 * 
 * Intentionally devoid of any structure, data transformation
 * and tree assembly deferred to the caller.  
 * 
 * @param {*} props
 */
export function TreeNode ({ label, collapsed = true, onClick, children, ..._props  }) {
    const [ isOpen, open ] = React.useState(!collapsed);

    return <div className='tree-node' >
        <div className='tree-node-item' >
            <div {..._props}
                className={isOpen ? 'tree-node-arrow' : 'tree-node-arrow collapsed'}
                onClick={(...args) => {
                    open(c => !c);
                    onClick && onClick(...args); 
                }} />
            {label}
        </div>
        <div className={isOpen ? 'tree-node-children' : 'tree-node-children-collapsed'}>
            {isOpen ? null : children}
        </div>
    </div>;
}

TreeNode.propTypes = {
    label: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.node]),
    collapsed: PropTypes.bool,
    onClick: PropTypes.func,
    children: PropTypes.node,
}