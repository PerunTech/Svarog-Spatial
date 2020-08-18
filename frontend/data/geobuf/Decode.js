let keys, values, lengths, dim, e;

const geometryTypes = [
    'Point', 'MultiPoint', 'LineString', 'MultiLineString',
    'Polygon', 'MultiPolygon', 'GeometryCollection'];

export function decode(pbf) {
    dim = 2;
    e = Math.pow(10, 6);
    lengths = null;

    keys = [];
    values = [];
    var obj = pbf.readFields(_readDataField, {});
    keys = null;

    return obj;
}

function _readDataField(tag, obj, pbf) {
    if (tag === 1) keys.push(pbf.readString());
    else if (tag === 2) dim = pbf.readVarint();
    else if (tag === 3) e = Math.pow(10, pbf.readVarint());

    else if (tag === 4) _readFeatureCollection(pbf, obj);
    else if (tag === 5) _readFeature(pbf, obj);
    else if (tag === 6) _readGeometry(pbf, obj);
}

function _readFeatureCollection(pbf, obj) {
    obj.type = 'FeatureCollection';
    obj.features = [];
    return pbf.readMessage(_readFeatureCollectionField, obj);
}

function _readFeature(pbf, feature) {
    feature.type = 'Feature';
    var f = pbf.readMessage(_readFeatureField, feature);
    if (!('geometry' in f)) f.geometry = null;
    return f;
}

function _readGeometry(pbf, geom) {
    geom.type = 'Point';
    return pbf.readMessage(_readGeometryField, geom);
}

function _readFeatureCollectionField(tag, obj, pbf) {
    if (tag === 1) obj.features.push(_readFeature(pbf, {}));

    else if (tag === 13) values.push(_readValue(pbf));
    else if (tag === 15) _readProps(pbf, obj);
}

function _readFeatureField(tag, feature, pbf) {
    if (tag === 1) feature.geometry = _readGeometry(pbf, {});

    else if (tag === 11) feature.id = pbf.readString();
    else if (tag === 12) feature.id = pbf.readSVarint();

    else if (tag === 13) values.push(_readValue(pbf));
    else if (tag === 14) feature.properties = _readProps(pbf, {});
    else if (tag === 15) _readProps(pbf, feature);
}

function _readGeometryField(tag, geom, pbf) {
    if (tag === 1) geom.type = geometryTypes[pbf.readVarint()];

    else if (tag === 2) lengths = pbf.readPackedVarint();
    else if (tag === 3) _readCoords(geom, pbf, geom.type);
    else if (tag === 4) {
        geom.geometries = geom.geometries || [];
        geom.geometries.push(_readGeometry(pbf, {}));
    }
    else if (tag === 13) values.push(_readValue(pbf));
    else if (tag === 15) _readProps(pbf, geom);
}

function _readCoords(geom, pbf, type) {
    if (type === 'Point') geom.coordinates = _readPoint(pbf);
    else if (type === 'MultiPoint') geom.coordinates = _readLine(pbf, true);
    else if (type === 'LineString') geom.coordinates = _readLine(pbf);
    else if (type === 'MultiLineString') geom.coordinates = _readMultiLine(pbf);
    else if (type === 'Polygon') geom.coordinates = _readMultiLine(pbf, true);
    else if (type === 'MultiPolygon') geom.coordinates = _readMultiPolygon(pbf);
}

function _readValue(pbf) {
    var end = pbf.readVarint() + pbf.pos,
        value = null;

    while (pbf.pos < end) {
        var val = pbf.readVarint(),
            tag = val >> 3;

        if (tag === 1) value = pbf.readString();
        else if (tag === 2) value = pbf.readDouble();
        else if (tag === 3) value = pbf.readVarint();
        else if (tag === 4) value = -pbf.readVarint();
        else if (tag === 5) value = pbf.readBoolean();
        else if (tag === 6) value = JSON.parse(pbf.readString());
    }
    return value;
}

function _readProps(pbf, props) {
    var end = pbf.readVarint() + pbf.pos;
    while (pbf.pos < end) props[keys[pbf.readVarint()]] = values[pbf.readVarint()];
    values = [];
    return props;
}

function _readPoint(pbf) {
    var end = pbf.readVarint() + pbf.pos,
        coords = [];
    while (pbf.pos < end) coords.push(pbf.readSVarint() / e);
    return coords;
}

function _readLinePart(pbf, end, len, closed) {
    var i = 0,
        coords = [],
        p, d;

    var prevP = [];
    for (d = 0; d < dim; d++) prevP[d] = 0;

    while (len ? i < len : pbf.pos < end) {
        p = [];
        for (d = 0; d < dim; d++) {
            prevP[d] += pbf.readSVarint();
            p[d] = prevP[d] / e;
        }
        coords.push(p);
        i++;
    }
    if (closed) coords.push(coords[0]);

    return coords;
}

function _readLine(pbf) {
    return _readLinePart(pbf, pbf.readVarint() + pbf.pos);
}

function _readMultiLine(pbf, closed) {
    var end = pbf.readVarint() + pbf.pos;
    if (!lengths) return [_readLinePart(pbf, end, null, closed)];

    var coords = [];
    for (var i = 0; i < lengths.length; i++) coords.push(_readLinePart(pbf, end, lengths[i], closed));
    lengths = null;
    return coords;
}

function _readMultiPolygon(pbf) {
    var end = pbf.readVarint() + pbf.pos;
    if (!lengths) return [[_readLinePart(pbf, end, null, true)]];

    var coords = [];
    var j = 1;
    for (var i = 0; i < lengths[0]; i++) {
        var rings = [];
        for (var k = 0; k < lengths[j]; k++) rings.push(_readLinePart(pbf, end, lengths[j + 1 + k], true));
        j += lengths[j] + 1;
        coords.push(rings);
    }
    lengths = null;
    return coords;
}