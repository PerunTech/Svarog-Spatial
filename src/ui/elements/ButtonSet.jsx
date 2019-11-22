import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '..';

export function ButtonSet ({buttons}) {
    return <div id='buttonSet' >
        {buttons.map((props, i) => <Button key={i} {...props} />)}
    </div>
}

ButtonSet.propTypes = {
    buttons: PropTypes.array,
};
