import {Util} from './Util';

/**
 * @class Core
 *
 * Template of the module
 */
export function Core() {}

/**
 * @function extend
 * (props: Object): Function
 *
 * [Extends the current class](#class-inheritance) given the properties to be included.
 * Returns a Javascript function that is a class constructor (i.e. to be called with `new`).
 *
 * @param {Object} props
 *
 * @return new `Class`
 */
Core.extend = function (props) {
	// The (`magic`) word init is similar to a constructor function.
	// If the class that is extended contains a method `init`, it will execute on initialization.
	// Do the conventional actions in the init constructor (set options/props, designate methods, assemble object).
	// Custom code (for an assembled class/object) executes in the hooks. Thats the fn namespace for extension (exit).
	let Class = function () {
		//call constructor
		if (this.init) { this.init.apply(this, arguments); }
		// call hooks
		this.initHooks();
	}

	let parentProto = Class.__super__ = this.prototype;
	let proto = Util.create(parentProto);

	proto.constructor = Class;
	Class.prototype = proto;

	// inherit parent's statics
	for (let i in this) {
		if (Util.hasProp(this, i) && i !== 'prototype' && i !== '__super__') {
			Class[i] = this[i];
		}
	}

	// mix static properties into the class
	if (props.statics) {
		Util.extend(Class, props.statics);
		delete props.statics;
	}

	// mix includes into the prototype
	if (props.includes) {
		Util.extend.apply(null, [proto].concat(props.includes));
		delete props.includes;
	}

	// merge options
	if (proto.options) { props.options = Util.extend(Util.create(proto.options), props.options); }

	// mix given properties into the prototype
	Util.extend(proto, props);

	// init hooks namespace, add method for calling all hooks
	proto._hooks = [];
	proto.initHooks = function () {
		if (this._hooksCalled) { return; }

		if (parentProto.initHooks) {
			parentProto.initHooks.call(this);
		}

		for (let i = 0, len = proto._hooks.length; i < len; i++) {
			proto._hooks[i].call(this);
		}

		this._hooksCalled = true;
	};

	return Class;
};

/**
 * @function include
 * (properties: Object): this
 *
 * [Includes a mixin](#class-includes) into the current class.
 *
 * @param {Object} props
 *
 * @return `this`
 */
Core.include = function (props) {
	Util.extend(this.prototype, props);
	return this;
};

/**
 * @function mergeOptions
 * (options: Object): this
 *
 * [Merges `options`](#class-options) into the defaults of the class.
 *
 * @param {Object} options
 *
 * @return `this`
 */
Core.mergeOptions = function (options) {
	Util.extend(this.prototype.options, options);
	return this;
};

/**
 * @function addHook
 * (fn: Function): this
 *
 * Adds a [constructor hook](#class-constructor-hooks) to the class.
 *
 * @param {Function} fn
 *
 * @return `this`
 */
Core.addHook = function (fn) { // (Function) || (String, args...)
	let args = Array.prototype.slice.call(arguments, 1);

	let init = typeof fn === 'function' ? fn : function () {
		this[fn].apply(this, args);
	};

	this.prototype._hooks = this.prototype._hooks || [];
	this.prototype._hooks.push(init);
	return this;
};

/**
 * Thanks to
 *  - Vladimir Agafonkin, Leaflet
 *  - John Resig, jQuery
 *  - Dean Edwards, Base.js, originator
 */
