import { encode as _encode } from './Encode';
import { decode as _decode } from './Decode';

export const geobuf = {
    encode (obj, pbf) {
        return _encode(obj, pbf);
    },

    decode (pbf) {
        return _decode(pbf);
    }
}