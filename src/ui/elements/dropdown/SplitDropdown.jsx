import React from 'react';
import PropTypes from 'prop-types'
import { SplitButton } from 'react-bootstrap';

export const SplitDropdown = ({variant, size, ...props}) => <SplitButton {...props} variant={variant} size={size} />;

SplitDropdown.defaultProps = {
    variant: 'light',
    size: 'sm'
}
SplitDropdown.propTypes = {
    variant: PropTypes.string,
    size: PropTypes.string,
};