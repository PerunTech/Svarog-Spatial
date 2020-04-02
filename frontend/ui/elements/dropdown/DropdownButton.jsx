import React from 'react';
import PropTypes from 'prop-types'
import { DropdownButton as DB } from 'react-bootstrap';

export const DropdownButton = ({variant, size, ...props}) => 
    <DB {...props} variant={variant} size={size} />;

DropdownButton.defaultProps = {
    variant: 'light',
    size: 'sm'
}
DropdownButton.propTypes = {
    variant: PropTypes.string,
    size: PropTypes.string,
};