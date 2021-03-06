require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Selection~Selection} kind.
* @module enyo/Selection
*/

var
	kind = require('./kind');
var
	Component = require('./Component');

/**
* The extended {@glossary event} [object]{@glossary Object} that is provided
* when the [onSelect]{@link module:enyo/Selection~Selection#onSelect} and
* [onDeselect]{@link module:enyo/Selection~Selection#onDeselect} events are fired.
*
* @typedef {Object} module:enyo/Selection~Selection~SelectionEvent
* @property {Number|String} key The key that was used to register the
*	[selection]{@link module:enyo/Selection~Selection} (usually a row index).
* @property {Object} data - References data registered with the key by the code
* that made the original selection.
*/

/**
* Fires when an item is selected.
* 
* ```javascript
* var
* 	kind = require('enyo/kind'),
* 	Selection = require('enyo/Selection');
*
* {kind: Selection, onSelect: 'selectRow', ... }
*
* selectRow: function(inSender, inEvent) {
* 	...
* }
* ```
*
* @event module:enyo/Selection~Selection#onSelect
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {module:enyo/Selection~Selection~SelectionEvent} event - An [object]{@glossary Object}
*	containing event information.
* @public
*/

/**
* Fires when an item is deselected.
* 
* ```javascript
* var
* 	kind = require('enyo/kind'),
* 	Selection = require('enyo/Selection');
*
* {kind: Selection, onSelect: 'deselectRow', ... }
*
* deselectRow: function(inSender, inEvent) {
* 	...
* }
* ```
*
* @event module:enyo/Selection~Selection#onDeselect
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {module:enyo/Selection~Selection~SelectionEvent} event - An [object]{@glossary Object}
*	containing event information.
* @public
*/

/**
* Fires when selection changes (but not when selection is cleared).
*
* @event module:enyo/Selection~Selection#onChange
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* {@link module:enyo/Selection~Selection} is used to manage row selection state for lists. It provides
* selection state management for both single-select and multi-select lists.
*
* ```javascript
* // The following code is excerpted from layout/FlyweightRepeater.
*
* var
* 	kind = require('enyo/kind'),
* 	Selection = require('enyo/Selection');
*
* module.exports = kind({
* 	components: [
* 		{kind: Selection, onSelect: 'selectDeselect', onDeselect: 'selectDeselect'},
* 		...
* 	],
* 	tap: function(inSender, inEvent) {
* 		...
* 		if (this.toggleSelected) {
* 			this.$.selection.toggle(event.index);
* 		} else {
* 			this.$.selection.select(event.index);
* 		}
* 	},
* 	selectDeselect: function(inSender, inEvent) {
* 		// this is where a row selection highlight might be applied
* 		this.renderRow(inEvent.key);
* 	}
* 	...
* });
* ```
*
* @class Selection
* @extends module:enyo/Component~Component
* @public
*/
module.exports = kind(
	/** @lends module:enyo/Selection~Selection.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Selection',

	/**
	* @private
	*/
	kind: Component,

	/**
	* @private
	*/
	published: 
		/** @lends module:enyo/Selection~Selection.prototype */ {

		/**
		* If `true`, multiple selections are allowed.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		multi: false
	},

	/**
	* @private
	*/
	events: {
		onSelect: '',
		onDeselect: '',
		onChange: ''
	},
	
	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function() {
			this.clear();
			sup.apply(this, arguments);
		};
	}),

	/**
	* @private
	*/
	multiChanged: function () {
		if (!this.multi) {
			this.clear();
		}
		this.doChange();
	},

	/**
	* @private
	*/
	highlander: function () {
		if (!this.multi) {
			this.deselect(this.lastSelected);
		}
	},

	/**
	* Removes all selections.
	* 
	* @public
	*/
	clear: function () {
		this.selected = {};
	},

	/**
	* Determines whether a particular row is selected.
	*
	* @param {Number|String} key - The unique identifier of the row.
	* @returns {Boolean} `true` if the specified row is selected; otherwise, `false`.
	* @public
	*/
	isSelected: function (key) {
		return this.selected[key];
	},

	/**
	* Manually sets a row's state to selected or unselected.
	*
	* @param {Number|String} key - The unique identifier of the row.
	* @param {Boolean} sel - `true` if the row should be selected; `false` if the row
	* should be unselected.
	* @param {Object} [data] - An optional data [object]{@glossary Object} to store
	*	in the selection for the key that will be sent with the
	*	[onSelect]{@link module:enyo/Selection~Selection#onSelect} or
	*	[onDeselect]{@link module:enyo/Selection~Selection#onDeselect} {@glossary event}. If
	*	not used, the `data` will be set to `true`.
	* @fires module:enyo/Selection~Selection#onChange
	* @public
	*/
	setByKey: function (key, sel, data) {
		if (sel) {
			this.selected[key] = (data || true);
			this.lastSelected = key;
			this.doSelect({key: key, data: this.selected[key]});
		} else {
			var was = this.isSelected(key);
			delete this.selected[key];
			this.doDeselect({key: key, data: was});
		}
		this.doChange();
	},

	/**
	* Deselects a row.
	*
	* @param {Number|String} key - The unique identifier of the row.
	* @public
	*/
	deselect: function (key) {
		if (this.isSelected(key)) {
			this.setByKey(key, false);
		}
	},

	/**
	* Selects a row. If the [multi]{@link module:enyo/Selection~Selection#multi} property is set to `false`,
	* this will also deselect the previous [selection]{@link module:enyo/Selection~Selection}.
	*
	* @param {Number|String} key - The unique identifier of the row.
	* @param {Object} [data] - An optional data [object]{@glossary Object} to store
	* in the selection for the key that will be sent with the
	*	[onSelect]{@link module:enyo/Selection~Selection#onSelect} or
	*	[onDeselect]{@link module:enyo/Selection~Selection#onDeselect} {@glossary event}. If
	*	not used, the `data` will be set to `true`.
	* @public
	*/
	select: function (key, data) {
		if (this.multi) {
			this.setByKey(key, !this.isSelected(key), data);
		} else if (!this.isSelected(key)) {
			this.highlander();
			this.setByKey(key, true, data);
		}
	},

	/**
	* Toggles [selection]{@link module:enyo/Selection~Selection} state for a row. If the
	* [multi]{@link module:enyo/Selection~Selection#multi} property is set to `false`, toggling a
	* selection "on" will deselect the previous selection.
	*
	* @param {Number|String} key - The unique identifier of the row.
	* @param {Object} [data] - An optional data [object]{@glossary Object} to store
	* in the selection for the key that will be sent with the
	*	[onSelect]{@link module:enyo/Selection~Selection#onSelect} or
	*	[onDeselect]{@link module:enyo/Selection~Selection#onDeselect} {@glossary event}. If
	*	not used, the `data` will be set to `true`.
	* @public
	*/
	toggle: function (key, data) {
		if (!this.multi && this.lastSelected != key) {
			this.deselect(this.lastSelected);
		}
		this.setByKey(key, !this.isSelected(key), data);
	},

	/**
	* Retrieves the current [selection]{@link module:enyo/Selection~Selection}.
	*
	* @returns {Object} The selection as a [hash]{@glossary Object} in which each
	* selected item has a value; unselected items are [undefined]{@glossary undefined}.
	* @public
	*/
	getSelected: function () {
		return this.selected;
	},

	/**
	* Removes a row that's included in the [selection]{@link module:enyo/Selection~Selection} set.
	* If this row is selected, it will be unselected.  Any rows above this row
	* will have their keys value reduced by one.
	*
	* @param {Number|String} key - The unique identifier of the row.
	* @public
	*/
	remove: function (key) {
		var newSelected = {};
		for (var row in this.selected) {
			if (row < key) {
				newSelected[row] = this.selected[row];
			} else if (row > key) {
				newSelected[row - 1] = this.selected[row];
			}
		}
		this.selected = newSelected;
	}
});
