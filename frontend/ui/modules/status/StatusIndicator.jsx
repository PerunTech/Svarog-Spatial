import { React, PropTypes } from 'perun-core';
import { connect } from '../../../core';
import { Ellipser, Button, Icon } from '../..';

export const _StatusIndicator = ({isActive}) =>
    isActive 
        ? <Ellipser ellipseCount={12} /> 
        : <>
            <Ellipser ellipseCount={0} />
            <Button disabled className='country as-label' >
                <Icon name='country' size='42px' />
            </Button>
        </>;

_StatusIndicator.propTypes = {
    isActive: PropTypes.bool
}

export const StatusIndicator = connect(({app}) => 
    ({isActive: app.processID.length > 0}))(_StatusIndicator);