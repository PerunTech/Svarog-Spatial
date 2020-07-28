import { React, PropTypes } from 'perun-core';
import { connect } from '../../../core';
import { Ellipser } from '../..';

export const _StatusIndicator = ({isActive}) =>
    isActive 
        ? <Ellipser ellipseCount={12} /> 
        : <Ellipser ellipseCount={0} />;

_StatusIndicator.propTypes = {
    isActive: PropTypes.bool
}

export const StatusIndicator = connect(({app}) => 
    ({isActive: app.processID.length > 0}))(_StatusIndicator);