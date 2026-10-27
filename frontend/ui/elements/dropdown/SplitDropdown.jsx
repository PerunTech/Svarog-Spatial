import { React, PropTypes, elements} from 'perun-core';

export const SplitDropdown = ({variant = 'light', size = 'sm', ...props}) => 
    <elements.ReactBootstrap.SplitButton {...props} variant={variant} size={size} />;

SplitDropdown.propTypes = {
    variant: PropTypes.string,
    size: PropTypes.string,
};