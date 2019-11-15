import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../index';

export function ButtonSet ({buttons}) {
    return <div id='drawTools' >
        {buttons.map((props, i) => <Button key={i} {...props} />)}
    </div>
}

ButtonSet.propTypes = {
    buttons: PropTypes.array,
};
