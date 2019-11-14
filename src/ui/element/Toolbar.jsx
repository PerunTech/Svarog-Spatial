import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../index';

export function Toolbar ({buttons}) {
    return <div id='drawTools' >
        {buttons.map((props, i) => <Button key={i} {...props} />)}
    </div>
}

Toolbar.propTypes = {
    buttons: PropTypes.array,
};
