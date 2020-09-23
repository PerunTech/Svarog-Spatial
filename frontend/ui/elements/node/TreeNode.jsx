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
    const [ isCollapsed, setCollapsed ] = React.useState(collapsed);

    return <div className='tree-node ' >
        <div className='tree-node-item' >
            <div {..._props}
                className={isCollapsed ? 'tree-node-arrow' : 'tree-view-arrow-collapsed'}
                onClick={(...args) => {
                    setCollapsed(c => !c);
                    onClick && onClick(...args); 
                }} />
            {label}
        </div>
        <div className={isCollapsed ? 'tree-node-children' : 'tree-node-children-collapsed'}>
            {isCollapsed ? null : children}
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