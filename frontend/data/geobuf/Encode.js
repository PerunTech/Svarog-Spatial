let keys, keysNum, keysArr, dim, e,
    maxPrecision = 1e6;

const geometryTypes = {
    'Point': 0,
    'MultiPoint': 1,
    'LineString': 2,
    'MultiLineString': 3,
    'Polygon': 4,
    'MultiPolygon': 5,
    'GeometryCollection': 6
};

export function encode(obj, pbf) {
    keys = {};
    keysArr = [];
    keysNum = 0;
    dim = 0;
    e = 1;

    _analyze(obj);

    e = Math.min(e, maxPrecision);
    var precision = Math.ceil(Math.log(e) / Math.LN10);

    for (var i = 0; i < keysArr.length; i++) pbf.writeStringField(1, keysArr[i]);
    if (dim !== 2) pbf.writeVarintField(2, dim);
    if (precision !== 6) pbf.writeVarintField(3, precision);

    if (obj.type === 'FeatureCollection') pbf.writeMessage(4, _writeFeatureCollection, obj);
    else if (obj.type === 'Feature') pbf.writeMessage(5, _writeFeature, obj);
    else pbf.writeMessage(6, _writeGeometry, obj);

    keys = null;

    return pbf.finish();
}

function _analyze(obj) {
    var i, key;

    if (obj.type === 'FeatureCollection') {
        for (i = 0; i < obj.features.length; i++) _analyze(obj.features[i]);

    } else if (obj.type === 'Feature') {
        if (obj.geometry !== null) _analyze(obj.geometry);
        for (key in obj.properties) _saveKey(key);

    } else if (obj.type === 'Point') _analyzePoint(obj.coordinates);
    else if (obj.type === 'MultiPoint') _analyzePoints(obj.coordinates);
    else if (obj.type === 'GeometryCollection') {
        for (i = 0; i < obj.geometries.length; i++) _analyze(obj.geometries[i]);
    }
    else if (obj.type === 'LineString') _analyzePoints(obj.coordinates);
    else if (obj.type === 'Polygon' || obj.type === 'MultiLineString') _analyzeMultiLine(obj.coordinates);
    else if (obj.type === 'MultiPolygon') {
        for (i = 0; i < obj.coordinates.length; i++) _analyzeMultiLine(obj.coordinates[i]);
    }

    for (key in obj) {
        if (!_isSpecialKey(key, obj.type)) _saveKey(key);
    }
}

function _analyzeMultiLine(coords) {
    for (var i = 0; i < coords.length; i++) _analyzePoints(coords[i]);
}

function _analyzePoints(coords) {
    for (var i = 0; i < coords.length; i++) _analyzePoint(coords[i]);
}

function _analyzePoint(point) {
    dim = Math.max(dim, point.length);

    // find max precision
    for (var i = 0; i < point.length; i++) {
        while (Math.round(point[i] * e) / e !== point[i] && e < maxPrecision) e *= 10;
    }
}

function _saveKey(key) {
    if (keys[key] === undefined) {
        keysArr.push(key);
        keys[key] = keysNum++;
    }
}

function _writeFeatureCollection(obj, pbf) {
    for (var i = 0; i < obj.features.length; i++) {
        pbf.writeMessage(1, _writeFeature, obj.features[i]);
    }
    _writeProps(obj, pbf, true);
}

function _writeFeature(feature, pbf) {
    if (feature.geometry !== null) pbf.writeMessage(1, _writeGeometry, feature.geometry);

    if (feature.id !== undefined) {
        if (typeof feature.id === 'number' && feature.id % 1 === 0) pbf.writeSVarintField(12, feature.id);
        else pbf.writeStringField(11, feature.id);
    }

    if (feature.properties) _writeProps(feature.properties, pbf);
    _writeProps(feature, pbf, true);
}

function _writeGeometry(geom, pbf) {
    pbf.writeVarintField(1, geometryTypes[geom.type]);

    var coords = geom.coordinates;

    if (geom.type === 'Point') _writePoint(coords, pbf);
    else if (geom.type === 'MultiPoint') _writeLine(coords, pbf, true);
    else if (geom.type === 'LineString') _writeLine(coords, pbf);
    else if (geom.type === 'MultiLineString') _writeMultiLine(coords, pbf);
    else if (geom.type === 'Polygon') _writeMultiLine(coords, pbf, true);
    else if (geom.type === 'MultiPolygon') _writeMultiPolygon(coords, pbf);
    else if (geom.type === 'GeometryCollection') {
        for (var i = 0; i < geom.geometries.length; i++) pbf.writeMessage(4, _writeGeometry, geom.geometries[i]);
    }

    _writeProps(geom, pbf, true);
}

function _writeProps(props, pbf, isCustom) {
    var indexes = [],
        valueIndex = 0;

    for (var key in props) {
        if (isCustom && _isSpecialKey(key, props.type)) {
            continue;
        }
        pbf.writeMessage(13, _writeValue, props[key]);
        indexes.push(keys[key]);
        indexes.push(valueIndex++);
    }
    pbf.writePackedVarint(isCustom ? 15 : 14, indexes);
}

function _writeValue(value, pbf) {
    if (value === null) return;

    var type = typeof value;

    if (type === 'string') pbf.writeStringField(1, value);
    else if (type === 'boolean') pbf.writeBooleanField(5, value);
    else if (type === 'object') pbf.writeStringField(6, JSON.stringify(value));
    else if (type === 'number') {
        if (value % 1 !== 0) pbf.writeDoubleField(2, value);
        else if (value >= 0) pbf.writeVarintField(3, value);
        else pbf.writeVarintField(4, -value);
    }
}

function _writePoint(point, pbf) {
    var coords = [];
    for (var i = 0; i < dim; i++) coords.push(Math.round(point[i] * e));
    pbf.writePackedSVarint(3, coords);
}

function _writeLine(line, pbf) {
    var coords = [];
    _populateLine(coords, line);
    pbf.writePackedSVarint(3, coords);
}

function _writeMultiLine(lines, pbf, closed) {
    var len = lines.length,
        i;
    if (len !== 1) {
        var lengths = [];
        for (i = 0; i < len; i++) lengths.push(lines[i].length - (closed ? 1 : 0));
        pbf.writePackedVarint(2, lengths);
        // TODO faster with custom writeMessage?
    }
    var coords = [];
    for (i = 0; i < len; i++) _populateLine(coords, lines[i], closed);
    pbf.writePackedSVarint(3, coords);
}

function _writeMultiPolygon(polygons, pbf) {
    var len = polygons.length,
        i, j;
    if (len !== 1 || polygons[0].length !== 1) {
        var lengths = [len];
        for (i = 0; i < len; i++) {
            lengths.push(polygons[i].length);
            for (j = 0; j < polygons[i].length; j++) lengths.push(polygons[i][j].length - 1);
        }
        pbf.writePackedVarint(2, lengths);
    }

    var coords = [];
    for (i = 0; i < len; i++) {
        for (j = 0; j < polygons[i].length; j++) _populateLine(coords, polygons[i][j], true);
    }
    pbf.writePackedSVarint(3, coords);
}

function _populateLine(coords, line, closed) {
    var i, j,
        len = line.length - (closed ? 1 : 0),
        sum = new Array(dim);
    for (j = 0; j < dim; j++) sum[j] = 0;
    for (i = 0; i < len; i++) {
        for (j = 0; j < dim; j++) {
            var n = Math.round(line[i][j] * e) - sum[j];
            coords.push(n);
            sum[j] += n;
        }
    }
}

function _isSpecialKey(key, type) {
    if (key === 'type') return true;
    else if (type === 'FeatureCollection') {
        if (key === 'features') return true;
    } else if (type === 'Feature') {
        if (key === 'id' || key === 'properties' || key === 'geometry') return true;
    } else if (type === 'GeometryCollection') {
        if (key === 'geometries') return true;
    } else if (key === 'coordinates') return true;
    return false;
}