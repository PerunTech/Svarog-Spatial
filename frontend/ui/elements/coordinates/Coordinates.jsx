import { React } from 'perun-core';
import { limits } from '../../../tools';
import { Input } from '../..';
import { getLabel } from '../../utils/labels';

export function Coordinates({ coordinates, onChange, ...props }) {
    const { projected, validated, onBlur, ...inputProps } = props;

    const format = React.useCallback(e => {
        return e.target.value = Array.from(e.target.value).filter(c =>
            '0123456789'.split('').includes(c)).join(''), e;
    }, []);

    const isValid = (coordinate, idx) =>
        limits.isBounded(coordinate, idx, projected)
            ? { isValid: true }
            : { isInvalid: true };

    return Object.values(coordinates).map((coordinate, idx) => {
        return <div key={idx} className='coordinate' onBlur={onBlur} >
            <Input {...inputProps}
                id={String(idx)}
                value={String(coordinate)}
                onChange={e => onChange(format(e))}
                placeholder={idx === 0 ? `${getLabel('abscissa_x')}` : `${getLabel('ordinate_y')}`}
                {...((validated && coordinate.length > 4) && isValid(coordinate, idx))} />
            <div className='invalid-feedback' >{limits.getRange(idx, projected)}</div>
        </div>
    })
}

Coordinates.defaultProps = {
    projected: true,
    validated: true
};