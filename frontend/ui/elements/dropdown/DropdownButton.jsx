import { React, PropTypes, elements} from 'perun-core';

export const DropdownButton = ({variant = 'light', size = 'sm', ...props}) => 
    <elements.ReactBootstrap.DropdownButton {...props} variant={variant} size={size} />;

DropdownButton.propTypes = {
    variant: PropTypes.string,
    size: PropTypes.string,
};