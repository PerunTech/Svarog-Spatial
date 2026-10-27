import { React, PropTypes, elements} from 'perun-core';

const DD = elements.ReactBootstrap.Dropdown;

export const Dropdown = ({variant = 'light', size = 'sm', ...props}) => 
    <DD {...props} variant={variant} size={size} />;

Dropdown.Toggle = DD.Toggle
Dropdown.Menu = DD.Menu;
Dropdown.Item = DD.Item;

Dropdown.propTypes = {
    variant: PropTypes.string,
    size: PropTypes.string,
};