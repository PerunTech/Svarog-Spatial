import { factory } from '../../core';
import { R } from '../../config';

export const Scale = factory.Control.extend({
    options: {
        position: 'bottomleft',
        maxWidth: 150,
        metric: (window.measurementSystem && window.measurementSystem === 'metric'),
        imperial: (window.measurementSystem && window.measurementSystem === 'metric'),
        updateWhenIdle: !1
    },

    onAdd: function (map) {
        this._map = map;
        let e = 'leaflet-control-better-scale',
            i = factory.DomUtil.create('div', e),
            n = this.options,
            c = factory.DomUtil.create('div', 'compass', i),
            s = factory.DomUtil.create('div', e + '-ruler', i);

        factory.DomUtil.create('div', 'wind-rose', c);
        factory.DomUtil.create('div', e + '-ruler-block ' + e + '-upper-first-piece', s);
        factory.DomUtil.create('div', e + '-ruler-block ' + e + '-upper-second-piece', s);
        factory.DomUtil.create('div', e + '-ruler-block ' + e + '-lower-first-piece', s);
        factory.DomUtil.create('div', e + '-ruler-block ' + e + '-lower-second-piece', s);

        return this._addScales(n, e, i),
            this.ScaleContainer = i,
            map.on(n.updateWhenIdle ? 'moveend' : 'move', this._update, this),
            map.whenReady(this._update, this),
            i;
    },

    onRemove: function (map) {
        map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
    },

    _addScales: function (t, e, i) {
        this._iScale = factory.DomUtil.create('div', e + '-label-div', i),
            this._iScaleLabel = factory.DomUtil.create('div', e + '-label', this._iScale),
            this._iScaleFirstNumber = factory.DomUtil.create('div', e + '-label ' + e + '-first-number', this._iScale),
            this._iScaleSecondNumber = factory.DomUtil.create('div', e + '-label ' + e + '-second-number', this._iScale)
    },

    _update: function () {
        let t = this._map.getBounds(),
            e = t.getCenter().lat,
            i = R * Math.PI * Math.cos(e * Math.PI / 180),
            n = i * (t.getNorthEast().lng - t.getSouthWest().lng) / 180,
            o = this._map.getSize(),
            s = this.options,
            a = 0;

        o.x > 0 && (a = n * (s.maxWidth / o.x))

        this._updateScales(s, a);
    },

    _updateScales: function (map, e) {
        map.metric && e && this._updateMetric(e);
        map.imperial && e && this._updateImperial(e);
    },

    _updateMetric_old: function (t) {
        let e = this._getRoundNum(t);
        this._iScale.style.width = this._getScaleWidth(e / t) + 'px', this._iScaleLabel.innerHTML = 1e3 > e ? e + ' m' : e / 1e3 + ' km';
    },

    _updateMetric: function (t) {
        let e, i, n, o, s, a = t,
            r = this._iScaleFirstNumber,
            h = this._iScaleSecondNumber,
            l = this._iScale,
            u = this._iScaleLabel;

        u.innerHTML = '0',

            a > 500
                ? (e = a / 1000,
                    i = this._getRoundNum(e),
                    o = this._getRoundNum(e / 2),
                    l.style.width = this._getScaleWidth(i / e) + 'px',
                    r.innerHTML = o,
                    h.innerHTML = i + 'km')
                : (n = this._getRoundNum(a),
                    s = this._getRoundNum(a / 2),
                    l.style.width = this._getScaleWidth(n / a) + 'px',
                    r.innerHTML = s,
                    h.innerHTML = n + 'm');
    },

    _updateImperial: function (t) {
        let e, i, n, o, s, a = 3.2808399 * t,
            r = this._iScaleFirstNumber,
            h = this._iScaleSecondNumber,
            l = this._iScale,
            u = this._iScaleLabel;

        u.innerHTML = '0',

            a > 2640
                ? (e = a / 5280,
                    i = this._getRoundNum(e),
                    o = this._getRoundNum(e / 2),
                    l.style.width = this._getScaleWidth(i / e) + 'px',
                    r.innerHTML = o,
                    h.innerHTML = i + 'mi')
                : (n = this._getRoundNum(a),
                    s = this._getRoundNum(a / 2),
                    l.style.width = this._getScaleWidth(n / a) + 'px',
                    r.innerHTML = s,
                    h.innerHTML = n + 'ft');
    },

    _getScaleWidth: function (t) {
        return Math.round(this.options.maxWidth * t) - 10;
    },

    _getRoundNum: function (t) {
        if (t >= 2) {
            let e = Math.pow(10, (Math.floor(t) + '').length - 1),
                i = t / e;

            return i = i >= 10 ? 10 : i >= 5 ? 5 : i >= 3 ? 3 : i >= 2 ? 2 : 1, e * i
        }

        return (Math.round(100 * t) / 100).toFixed(1)
    }
});

export const scale = function (options) {
    return new Scale(options)
};