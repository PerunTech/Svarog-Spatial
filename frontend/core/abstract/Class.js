import { util } from '..';

/**
 * Base class of the module
 * 
 * @abstract
 * @class Class
 */
export function Class () {}

/**
 * [Extends the current class](#class-inheritance) given the properties to be included.
 * Returns a Javascript function that is a class constructor (i.e. to be called with `new`).
 * 
 * &nbsp;
 * 
 * @function extend (props: Object): Class
 *
 * @param {Object} props - The properties to be included in the class.
 *
 * @return `Class`;
 */
Class.extend = function (props) {
	// The (`magic`) word init is similar to a constructor function.
	// If the class that is extended contains a method `init`, it will execute on initialization.
	// Do the conventional actions in the init constructor (set options/props, designate methods, assemble object).
	// Custom code (for an assembled class/object) executes in the hooks. Thats the fn namespace for extension (exit).
	let Class = function () {
		//call constructor
		if (this.init) { this.init.apply(this, arguments); }

		// check if class implements required interface methods
		if (!util.isComplete(this)) { 
			throw new Error('Failed instantiation. Class does not correctly implements required methods.')
		}

		// call hooks
		this.initHooks();
	}

	let parentProto = Class.__super__ = this.prototype;
	let proto = util.inherit(parentProto);

	proto.constructor = Class;
	Class.prototype = proto;

	// inherit parent's statics
	for (let i in this) {
		if (util.hasProp(this, i) && i !== 'prototype' && i !== '__super__') {
			Class[i] = this[i];
		}
	}

	// mix static properties into the class
	if (props.statics) {
		util.cloneDeep(Class, props.statics);
		delete props.statics;
	}

	// mix includes into the prototype
	if (props.includes) {
		util.cloneDeep.apply(null, [proto].concat(props.includes));
		delete props.includes;
	}

	// merge options
	if (proto.options) { props.options = util.cloneDeep(util.inherit(proto.options), props.options); }

	// mix given properties into the prototype
	util.cloneDeep(proto, props);

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
 * [Includes a mixin](#class-includes) into the current class.
 * 
 * &nbsp;
 * 
 * @function include (properties: Object): this
 *
 * @param {Object} props - The properties to be included in `this`.
 *
 * @return `this`;
 */
Class.include = function (props) {
	util.cloneDeep(this.prototype, props);
	
	return this;
};

/**
 * [Merges `options`](#class-options) into the defaults of the class.
 * 
 * &nbsp;
 * 
 * @function mergeOptions (options: Object): this
 *
 * @param {Object} options - Configuration object.
 *
 * @return `this`;
 */
Class.mergeOptions = function (options) {
	util.cloneDeep(this.prototype.options, options);

	return this;
};

/**
 * Adds a [constructor hook](#class-constructor-hooks) to the class.
 * 
 * &nbsp;
 * 
 * @function addHook (fn: Function, ...args: any[]): this
 *
 * @param {Function} fn - Function to be added as hook.
 * @param {[*]} args - Arguments to be passed to the hook function.
 *
 * @return `this`;
 */
Class.addHook = function (fn) { // (Function) || (String, args...)
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
