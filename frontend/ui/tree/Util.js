/**
 * Builds the necessary properties for each node instance in our data trees.
 * 
 * @private
 * @param {*} rootProps 
 * @param {*} props 
 * @param {*} ancestor 
 * @param {*} isRootNode 
 * @param {*} childIndex 
 */
export const getNodeProps = function (rootProps, props, ancestor, isRootNode, childIndex) {

    const { classNamePrefix, collapseIconClass, expandIconClass,
        collapsible, stateful, labelFilter, checkboxFactory, labelFactory } = rootProps

    return {
        ancestor: ancestor,
        onClick: rootProps.onTreeNodeClick,
        onCheckChange: rootProps.onTreeNodeCheckChange,
        onSelectChange: rootProps.onTreeNodeSelectChange,
        onCollapseChange: rootProps.onTreeNodeCollapseChange,
        id: generateNodeId(rootProps, props, childIndex),
        key: "tree-node-" + ancestor.join(".") + childIndex,
        classNamePrefix,
        collapseIconClass,
        expandIconClass,
        collapsible, 
        stateful,
        labelFilter,
        checkboxFactory,
        labelFactory,
    }
}

/**
 * Generates a node id.
 *  
 * @param {*} rootProps 
 * @param {*} props 
 * @param {*} childIndex 
 */
export const generateNodeId = function (rootProps, props, childIndex) {
    return rootProps.identifier && props[rootProps.identifier] 
        ? props[rootProps.identifier] 
        : childIndex;
}


var TreeMenuUtils = {

    /**
     * //TODO: use immutable API here..this function mutates!
     *
     * @param lineage
     * @param prevState
     * @param mutatedProperty
     * @param identifier optional
     * @returns {*}
     */
    getNewTreeState: function (lineage, prevState, mutatedProperty, identifier) {
  
      function setPropState(node, value) {
        node[mutatedProperty] = value;
        var children = node.children;
        if (children) {
          node.children.forEach(function (childNode, ci) {
            setPropState(childNode, value);
          });
        }
      }
  
      function getUpdatedTreeState(state) {
        state = state || prevState;
        var id = lineage.shift();
        state.forEach(function (node, i) {
          var nodeId = identifier ? state[i][identifier] : i;
          if (nodeId === id) {
            if (!lineage.length) {
              setPropState(state[i], !state[i][mutatedProperty]);
            } else {
              state[i].children = getUpdatedTreeState(state[i].children);
            }
          }
        });
  
        return state;
  
      }
  
      return getUpdatedTreeState();
  
    }
  
  };
  
  module.exports = TreeMenuUtils;