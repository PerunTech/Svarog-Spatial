import { React, PropTypes, elements} from 'perun-core';

const DD = elements.ReactBootstrap.Dropdown;

export const Dropdown = ({variant, size, ...props}) => 
    <DD {...props} variant={variant} size={size} />;

Dropdown.Toggle = DD.Toggle
Dropdown.Menu = DD.Menu;
Dropdown.Item = DD.Item;

Dropdown.defaultProps = {
    variant: 'light',
    size: 'sm'
}
Dropdown.propTypes = {
    variant: PropTypes.string,
    size: PropTypes.string,
};