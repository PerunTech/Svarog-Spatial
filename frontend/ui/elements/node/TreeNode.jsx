import { React, PropTypes } from 'perun-core';
import { Button } from '../..';

/**
 * Represents a single node in a hierarchical data view (tree).
 * 
 * Intentionally devoid of any structure, data transformation
 * and tree assembly deferred to the caller.
 * 
 * @param {*} props
 */
export function TreeNode ({ id, label, isOpen = true, onClick, children, ..._props  }) {
    return <div id={id} className='tree-node' >
        <div className='tree-node-item' >
            <div {..._props}
                className={'tree-node-arrow ' + (!isOpen ? 'tree-node-arrow-collapsed' : '')}
                onClick={() => onClick(id)} />
            <Button className='tree-node-label' onClick={() => onClick(id)} >{label}</Button>
        </div>
        <div className={isOpen ? 'tree-node-children' : 'tree-node-children-collapsed'}>
            {isOpen ? children : null}
        </div>
    </div>;
}

TreeNode.propTypes = {
    id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number]),
    label: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.node]),
    isOpen: PropTypes.bool,
    onClick: PropTypes.func,
    children: PropTypes.node,
}