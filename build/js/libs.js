/*!
 * jQuery Migrate - v3.0.0 - 2016-06-09
 * Copyright jQuery Foundation and other contributors
 */
(function( jQuery, window ) {
"use strict";


jQuery.migrateVersion = "3.0.0";


( function() {

	// Support: IE9 only
	// IE9 only creates console object when dev tools are first opened
	// Also, avoid Function#bind here to simplify PhantomJS usage
	var log = window.console && window.console.log &&
			function() { window.console.log.apply( window.console, arguments ); },
		rbadVersions = /^[12]\./;

	if ( !log ) {
		return;
	}

	// Need jQuery 3.0.0+ and no older Migrate loaded
	if ( !jQuery || rbadVersions.test( jQuery.fn.jquery ) ) {
		log( "JQMIGRATE: jQuery 3.0.0+ REQUIRED" );
	}
	if ( jQuery.migrateWarnings ) {
		log( "JQMIGRATE: Migrate plugin loaded multiple times" );
	}

	// Show a message on the console so devs know we're active
	log( "JQMIGRATE: Migrate is installed" +
		( jQuery.migrateMute ? "" : " with logging active" ) +
		", version " + jQuery.migrateVersion );

} )();

var warnedAbout = {};

// List of warnings already given; public read only
jQuery.migrateWarnings = [];

// Set to false to disable traces that appear with warnings
if ( jQuery.migrateTrace === undefined ) {
	jQuery.migrateTrace = true;
}

// Forget any warnings we've already given; public
jQuery.migrateReset = function() {
	warnedAbout = {};
	jQuery.migrateWarnings.length = 0;
};

function migrateWarn( msg ) {
	var console = window.console;
	if ( !warnedAbout[ msg ] ) {
		warnedAbout[ msg ] = true;
		jQuery.migrateWarnings.push( msg );
		if ( console && console.warn && !jQuery.migrateMute ) {
			console.warn( "JQMIGRATE: " + msg );
			if ( jQuery.migrateTrace && console.trace ) {
				console.trace();
			}
		}
	}
}

function migrateWarnProp( obj, prop, value, msg ) {
	Object.defineProperty( obj, prop, {
		configurable: true,
		enumerable: true,
		get: function() {
			migrateWarn( msg );
			return value;
		}
	} );
}

if ( document.compatMode === "BackCompat" ) {

	// JQuery has never supported or tested Quirks Mode
	migrateWarn( "jQuery is not compatible with Quirks Mode" );
}


var oldInit = jQuery.fn.init,
	oldIsNumeric = jQuery.isNumeric,
	oldFind = jQuery.find,
	rattrHashTest = /\[(\s*[-\w]+\s*)([~|^$*]?=)\s*([-\w#]*?#[-\w#]*)\s*\]/,
	rattrHashGlob = /\[(\s*[-\w]+\s*)([~|^$*]?=)\s*([-\w#]*?#[-\w#]*)\s*\]/g;

jQuery.fn.init = function( arg1 ) {
	var args = Array.prototype.slice.call( arguments );

	if ( typeof arg1 === "string" && arg1 === "#" ) {

		// JQuery( "#" ) is a bogus ID selector, but it returned an empty set before jQuery 3.0
		migrateWarn( "jQuery( '#' ) is not a valid selector" );
		args[ 0 ] = [];
	}

	return oldInit.apply( this, args );
};
jQuery.fn.init.prototype = jQuery.fn;

jQuery.find = function( selector ) {
	var args = Array.prototype.slice.call( arguments );

	// Support: PhantomJS 1.x
	// String#match fails to match when used with a //g RegExp, only on some strings
	if ( typeof selector === "string" && rattrHashTest.test( selector ) ) {

		// The nonstandard and undocumented unquoted-hash was removed in jQuery 1.12.0
		// First see if qS thinks it's a valid selector, if so avoid a false positive
		try {
			document.querySelector( selector );
		} catch ( err1 ) {

			// Didn't *look* valid to qSA, warn and try quoting what we think is the value
			selector = selector.replace( rattrHashGlob, function( _, attr, op, value ) {
				return "[" + attr + op + "\"" + value + "\"]";
			} );

			// If the regexp *may* have created an invalid selector, don't update it
			// Note that there may be false alarms if selector uses jQuery extensions
			try {
				document.querySelector( selector );
				migrateWarn( "Attribute selector with '#' must be quoted: " + args[ 0 ] );
				args[ 0 ] = selector;
			} catch ( err2 ) {
				migrateWarn( "Attribute selector with '#' was not fixed: " + args[ 0 ] );
			}
		}
	}

	return oldFind.apply( this, args );
};

// Copy properties attached to original jQuery.find method (e.g. .attr, .isXML)
var findProp;
for ( findProp in oldFind ) {
	if ( Object.prototype.hasOwnProperty.call( oldFind, findProp ) ) {
		jQuery.find[ findProp ] = oldFind[ findProp ];
	}
}

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	migrateWarn( "jQuery.fn.size() is deprecated; use the .length property" );
	return this.length;
};

jQuery.parseJSON = function() {
	migrateWarn( "jQuery.parseJSON is deprecated; use JSON.parse" );
	return JSON.parse.apply( null, arguments );
};

jQuery.isNumeric = function( val ) {

	// The jQuery 2.2.3 implementation of isNumeric
	function isNumeric2( obj ) {
		var realStringObj = obj && obj.toString();
		return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
	}

	var newValue = oldIsNumeric( val ),
		oldValue = isNumeric2( val );

	if ( newValue !== oldValue ) {
		migrateWarn( "jQuery.isNumeric() should not be called on constructed objects" );
	}

	return oldValue;
};

migrateWarnProp( jQuery, "unique", jQuery.uniqueSort,
	"jQuery.unique is deprecated, use jQuery.uniqueSort" );

// Now jQuery.expr.pseudos is the standard incantation
migrateWarnProp( jQuery.expr, "filters", jQuery.expr.pseudos,
	"jQuery.expr.filters is now jQuery.expr.pseudos" );
migrateWarnProp( jQuery.expr, ":", jQuery.expr.pseudos,
	"jQuery.expr[\":\"] is now jQuery.expr.pseudos" );


var oldAjax = jQuery.ajax;

jQuery.ajax = function( ) {
	var jQXHR = oldAjax.apply( this, arguments );

	// Be sure we got a jQXHR (e.g., not sync)
	if ( jQXHR.promise ) {
		migrateWarnProp( jQXHR, "success", jQXHR.done,
			"jQXHR.success is deprecated and removed" );
		migrateWarnProp( jQXHR, "error", jQXHR.fail,
			"jQXHR.error is deprecated and removed" );
		migrateWarnProp( jQXHR, "complete", jQXHR.always,
			"jQXHR.complete is deprecated and removed" );
	}

	return jQXHR;
};


var oldRemoveAttr = jQuery.fn.removeAttr,
	oldToggleClass = jQuery.fn.toggleClass,
	rmatchNonSpace = /\S+/g;

jQuery.fn.removeAttr = function( name ) {
	var self = this;

	jQuery.each( name.match( rmatchNonSpace ), function( i, attr ) {
		if ( jQuery.expr.match.bool.test( attr ) ) {
			migrateWarn( "jQuery.fn.removeAttr no longer sets boolean properties: " + attr );
			self.prop( attr, false );
		}
	} );

	return oldRemoveAttr.apply( this, arguments );
};

jQuery.fn.toggleClass = function( state ) {

	// Only deprecating no-args or single boolean arg
	if ( state !== undefined && typeof state !== "boolean" ) {
		return oldToggleClass.apply( this, arguments );
	}

	migrateWarn( "jQuery.fn.toggleClass( boolean ) is deprecated" );

	// Toggle entire class name of each element
	return this.each( function() {
		var className = this.getAttribute && this.getAttribute( "class" ) || "";

		if ( className ) {
			jQuery.data( this, "__className__", className );
		}

		// If the element has a class name or if we're passed `false`,
		// then remove the whole classname (if there was one, the above saved it).
		// Otherwise bring back whatever was previously saved (if anything),
		// falling back to the empty string if nothing was stored.
		if ( this.setAttribute ) {
			this.setAttribute( "class",
				className || state === false ?
				"" :
				jQuery.data( this, "__className__" ) || ""
			);
		}
	} );
};


var internalSwapCall = false;

// If this version of jQuery has .swap(), don't false-alarm on internal uses
if ( jQuery.swap ) {
	jQuery.each( [ "height", "width", "reliableMarginRight" ], function( _, name ) {
		var oldHook = jQuery.cssHooks[ name ] && jQuery.cssHooks[ name ].get;

		if ( oldHook ) {
			jQuery.cssHooks[ name ].get = function() {
				var ret;

				internalSwapCall = true;
				ret = oldHook.apply( this, arguments );
				internalSwapCall = false;
				return ret;
			};
		}
	} );
}

jQuery.swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	if ( !internalSwapCall ) {
		migrateWarn( "jQuery.swap() is undocumented and deprecated" );
	}

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};

var oldData = jQuery.data;

jQuery.data = function( elem, name, value ) {
	var curData;

	// If the name is transformed, look for the un-transformed name in the data object
	if ( name && name !== jQuery.camelCase( name ) ) {
		curData = jQuery.hasData( elem ) && oldData.call( this, elem );
		if ( curData && name in curData ) {
			migrateWarn( "jQuery.data() always sets/gets camelCased names: " + name );
			if ( arguments.length > 2 ) {
				curData[ name ] = value;
			}
			return curData[ name ];
		}
	}

	return oldData.apply( this, arguments );
};

var oldTweenRun = jQuery.Tween.prototype.run;

jQuery.Tween.prototype.run = function( percent ) {
	if ( jQuery.easing[ this.easing ].length > 1 ) {
		migrateWarn(
			"easing function " +
			"\"jQuery.easing." + this.easing.toString() +
			"\" should use only first argument"
		);

		jQuery.easing[ this.easing ] = jQuery.easing[ this.easing ].bind(
			jQuery.easing,
			percent, this.options.duration * percent, 0, 1, this.options.duration
		);
	}

	oldTweenRun.apply( this, arguments );
};

var oldLoad = jQuery.fn.load,
	originalFix = jQuery.event.fix;

jQuery.event.props = [];
jQuery.event.fixHooks = {};

jQuery.event.fix = function( originalEvent ) {
	var event,
		type = originalEvent.type,
		fixHook = this.fixHooks[ type ],
		props = jQuery.event.props;

	if ( props.length ) {
		migrateWarn( "jQuery.event.props are deprecated and removed: " + props.join() );
		while ( props.length ) {
			jQuery.event.addProp( props.pop() );
		}
	}

	if ( fixHook && !fixHook._migrated_ ) {
		fixHook._migrated_ = true;
		migrateWarn( "jQuery.event.fixHooks are deprecated and removed: " + type );
		if ( ( props = fixHook.props ) && props.length ) {
			while ( props.length ) {
			   jQuery.event.addProp( props.pop() );
			}
		}
	}

	event = originalFix.call( this, originalEvent );

	return fixHook && fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
};

jQuery.each( [ "load", "unload", "error" ], function( _, name ) {

	jQuery.fn[ name ] = function() {
		var args = Array.prototype.slice.call( arguments, 0 );

		// If this is an ajax load() the first arg should be the string URL;
		// technically this could also be the "Anything" arg of the event .load()
		// which just goes to show why this dumb signature has been deprecated!
		// jQuery custom builds that exclude the Ajax module justifiably die here.
		if ( name === "load" && typeof args[ 0 ] === "string" ) {
			return oldLoad.apply( this, args );
		}

		migrateWarn( "jQuery.fn." + name + "() is deprecated" );

		args.splice( 0, 0, name );
		if ( arguments.length ) {
			return this.on.apply( this, args );
		}

		// Use .triggerHandler here because:
		// - load and unload events don't need to bubble, only applied to window or image
		// - error event should not bubble to window, although it does pre-1.7
		// See http://bugs.jquery.com/ticket/11820
		this.triggerHandler.apply( this, args );
		return this;
	};

} );

// Trigger "ready" event only once, on document ready
jQuery( function() {
	jQuery( document ).triggerHandler( "ready" );
} );

jQuery.event.special.ready = {
	setup: function() {
		if ( this === document ) {
			migrateWarn( "'ready' event is deprecated" );
		}
	}
};

jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		migrateWarn( "jQuery.fn.bind() is deprecated" );
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		migrateWarn( "jQuery.fn.unbind() is deprecated" );
		return this.off( types, null, fn );
	},
	delegate: function( selector, types, data, fn ) {
		migrateWarn( "jQuery.fn.delegate() is deprecated" );
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		migrateWarn( "jQuery.fn.undelegate() is deprecated" );
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );


var oldOffset = jQuery.fn.offset;

jQuery.fn.offset = function() {
	var docElem,
		elem = this[ 0 ],
		origin = { top: 0, left: 0 };

	if ( !elem || !elem.nodeType ) {
		migrateWarn( "jQuery.fn.offset() requires a valid DOM element" );
		return origin;
	}

	docElem = ( elem.ownerDocument || document ).documentElement;
	if ( !jQuery.contains( docElem, elem ) ) {
		migrateWarn( "jQuery.fn.offset() requires an element connected to a document" );
		return origin;
	}

	return oldOffset.apply( this, arguments );
};


var oldParam = jQuery.param;

jQuery.param = function( data, traditional ) {
	var ajaxTraditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;

	if ( traditional === undefined && ajaxTraditional ) {

		migrateWarn( "jQuery.param() no longer uses jQuery.ajaxSettings.traditional" );
		traditional = ajaxTraditional;
	}

	return oldParam.call( this, data, traditional );
};

var oldSelf = jQuery.fn.andSelf || jQuery.fn.addBack;

jQuery.fn.andSelf = function() {
	migrateWarn( "jQuery.fn.andSelf() replaced by jQuery.fn.addBack()" );
	return oldSelf.apply( this, arguments );
};


var oldDeferred = jQuery.Deferred,
	tuples = [

		// Action, add listener, callbacks, .then handlers, final state
		[ "resolve", "done", jQuery.Callbacks( "once memory" ),
			jQuery.Callbacks( "once memory" ), "resolved" ],
		[ "reject", "fail", jQuery.Callbacks( "once memory" ),
			jQuery.Callbacks( "once memory" ), "rejected" ],
		[ "notify", "progress", jQuery.Callbacks( "memory" ),
			jQuery.Callbacks( "memory" ) ]
	];

jQuery.Deferred = function( func ) {
	var deferred = oldDeferred(),
		promise = deferred.promise();

	deferred.pipe = promise.pipe = function( /* fnDone, fnFail, fnProgress */ ) {
		var fns = arguments;

		migrateWarn( "deferred.pipe() is deprecated" );

		return jQuery.Deferred( function( newDefer ) {
			jQuery.each( tuples, function( i, tuple ) {
				var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

				// Deferred.done(function() { bind to newDefer or newDefer.resolve })
				// deferred.fail(function() { bind to newDefer or newDefer.reject })
				// deferred.progress(function() { bind to newDefer or newDefer.notify })
				deferred[ tuple[ 1 ] ]( function() {
					var returned = fn && fn.apply( this, arguments );
					if ( returned && jQuery.isFunction( returned.promise ) ) {
						returned.promise()
							.done( newDefer.resolve )
							.fail( newDefer.reject )
							.progress( newDefer.notify );
					} else {
						newDefer[ tuple[ 0 ] + "With" ](
							this === promise ? newDefer.promise() : this,
							fn ? [ returned ] : arguments
						);
					}
				} );
			} );
			fns = null;
		} ).promise();

	};

	if ( func ) {
		func.call( deferred, deferred );
	}

	return deferred;
};



})( jQuery, window );
/*!
 * Simple jQuery Equal Heights
 *
 * Copyright (c) 2013 Matt Banks
 * Dual licensed under the MIT and GPL licenses.
 * Uses the same license as jQuery, see:
 * http://docs.jquery.com/License
 *
 * @version 1.5.1
 */
!function(a){a.fn.equalHeights=function(){var b=0,c=a(this);return c.each(function(){var c=a(this).innerHeight();c>b&&(b=c)}),c.css("height",b)},a("[data-equal]").each(function(){var b=a(this),c=b.data("equal");b.find(c).equalHeights()})}(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJsaWJzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxyXG4gKiBqUXVlcnkgTWlncmF0ZSAtIHYzLjAuMCAtIDIwMTYtMDYtMDlcclxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnNcclxuICovXHJcbihmdW5jdGlvbiggalF1ZXJ5LCB3aW5kb3cgKSB7XHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuXHJcbmpRdWVyeS5taWdyYXRlVmVyc2lvbiA9IFwiMy4wLjBcIjtcclxuXHJcblxyXG4oIGZ1bmN0aW9uKCkge1xyXG5cclxuXHQvLyBTdXBwb3J0OiBJRTkgb25seVxyXG5cdC8vIElFOSBvbmx5IGNyZWF0ZXMgY29uc29sZSBvYmplY3Qgd2hlbiBkZXYgdG9vbHMgYXJlIGZpcnN0IG9wZW5lZFxyXG5cdC8vIEFsc28sIGF2b2lkIEZ1bmN0aW9uI2JpbmQgaGVyZSB0byBzaW1wbGlmeSBQaGFudG9tSlMgdXNhZ2VcclxuXHR2YXIgbG9nID0gd2luZG93LmNvbnNvbGUgJiYgd2luZG93LmNvbnNvbGUubG9nICYmXHJcblx0XHRcdGZ1bmN0aW9uKCkgeyB3aW5kb3cuY29uc29sZS5sb2cuYXBwbHkoIHdpbmRvdy5jb25zb2xlLCBhcmd1bWVudHMgKTsgfSxcclxuXHRcdHJiYWRWZXJzaW9ucyA9IC9eWzEyXVxcLi87XHJcblxyXG5cdGlmICggIWxvZyApIHtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblxyXG5cdC8vIE5lZWQgalF1ZXJ5IDMuMC4wKyBhbmQgbm8gb2xkZXIgTWlncmF0ZSBsb2FkZWRcclxuXHRpZiAoICFqUXVlcnkgfHwgcmJhZFZlcnNpb25zLnRlc3QoIGpRdWVyeS5mbi5qcXVlcnkgKSApIHtcclxuXHRcdGxvZyggXCJKUU1JR1JBVEU6IGpRdWVyeSAzLjAuMCsgUkVRVUlSRURcIiApO1xyXG5cdH1cclxuXHRpZiAoIGpRdWVyeS5taWdyYXRlV2FybmluZ3MgKSB7XHJcblx0XHRsb2coIFwiSlFNSUdSQVRFOiBNaWdyYXRlIHBsdWdpbiBsb2FkZWQgbXVsdGlwbGUgdGltZXNcIiApO1xyXG5cdH1cclxuXHJcblx0Ly8gU2hvdyBhIG1lc3NhZ2Ugb24gdGhlIGNvbnNvbGUgc28gZGV2cyBrbm93IHdlJ3JlIGFjdGl2ZVxyXG5cdGxvZyggXCJKUU1JR1JBVEU6IE1pZ3JhdGUgaXMgaW5zdGFsbGVkXCIgK1xyXG5cdFx0KCBqUXVlcnkubWlncmF0ZU11dGUgPyBcIlwiIDogXCIgd2l0aCBsb2dnaW5nIGFjdGl2ZVwiICkgK1xyXG5cdFx0XCIsIHZlcnNpb24gXCIgKyBqUXVlcnkubWlncmF0ZVZlcnNpb24gKTtcclxuXHJcbn0gKSgpO1xyXG5cclxudmFyIHdhcm5lZEFib3V0ID0ge307XHJcblxyXG4vLyBMaXN0IG9mIHdhcm5pbmdzIGFscmVhZHkgZ2l2ZW47IHB1YmxpYyByZWFkIG9ubHlcclxualF1ZXJ5Lm1pZ3JhdGVXYXJuaW5ncyA9IFtdO1xyXG5cclxuLy8gU2V0IHRvIGZhbHNlIHRvIGRpc2FibGUgdHJhY2VzIHRoYXQgYXBwZWFyIHdpdGggd2FybmluZ3NcclxuaWYgKCBqUXVlcnkubWlncmF0ZVRyYWNlID09PSB1bmRlZmluZWQgKSB7XHJcblx0alF1ZXJ5Lm1pZ3JhdGVUcmFjZSA9IHRydWU7XHJcbn1cclxuXHJcbi8vIEZvcmdldCBhbnkgd2FybmluZ3Mgd2UndmUgYWxyZWFkeSBnaXZlbjsgcHVibGljXHJcbmpRdWVyeS5taWdyYXRlUmVzZXQgPSBmdW5jdGlvbigpIHtcclxuXHR3YXJuZWRBYm91dCA9IHt9O1xyXG5cdGpRdWVyeS5taWdyYXRlV2FybmluZ3MubGVuZ3RoID0gMDtcclxufTtcclxuXHJcbmZ1bmN0aW9uIG1pZ3JhdGVXYXJuKCBtc2cgKSB7XHJcblx0dmFyIGNvbnNvbGUgPSB3aW5kb3cuY29uc29sZTtcclxuXHRpZiAoICF3YXJuZWRBYm91dFsgbXNnIF0gKSB7XHJcblx0XHR3YXJuZWRBYm91dFsgbXNnIF0gPSB0cnVlO1xyXG5cdFx0alF1ZXJ5Lm1pZ3JhdGVXYXJuaW5ncy5wdXNoKCBtc2cgKTtcclxuXHRcdGlmICggY29uc29sZSAmJiBjb25zb2xlLndhcm4gJiYgIWpRdWVyeS5taWdyYXRlTXV0ZSApIHtcclxuXHRcdFx0Y29uc29sZS53YXJuKCBcIkpRTUlHUkFURTogXCIgKyBtc2cgKTtcclxuXHRcdFx0aWYgKCBqUXVlcnkubWlncmF0ZVRyYWNlICYmIGNvbnNvbGUudHJhY2UgKSB7XHJcblx0XHRcdFx0Y29uc29sZS50cmFjZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBtaWdyYXRlV2FyblByb3AoIG9iaiwgcHJvcCwgdmFsdWUsIG1zZyApIHtcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoIG9iaiwgcHJvcCwge1xyXG5cdFx0Y29uZmlndXJhYmxlOiB0cnVlLFxyXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZSxcclxuXHRcdGdldDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdG1pZ3JhdGVXYXJuKCBtc2cgKTtcclxuXHRcdFx0cmV0dXJuIHZhbHVlO1xyXG5cdFx0fVxyXG5cdH0gKTtcclxufVxyXG5cclxuaWYgKCBkb2N1bWVudC5jb21wYXRNb2RlID09PSBcIkJhY2tDb21wYXRcIiApIHtcclxuXHJcblx0Ly8gSlF1ZXJ5IGhhcyBuZXZlciBzdXBwb3J0ZWQgb3IgdGVzdGVkIFF1aXJrcyBNb2RlXHJcblx0bWlncmF0ZVdhcm4oIFwialF1ZXJ5IGlzIG5vdCBjb21wYXRpYmxlIHdpdGggUXVpcmtzIE1vZGVcIiApO1xyXG59XHJcblxyXG5cclxudmFyIG9sZEluaXQgPSBqUXVlcnkuZm4uaW5pdCxcclxuXHRvbGRJc051bWVyaWMgPSBqUXVlcnkuaXNOdW1lcmljLFxyXG5cdG9sZEZpbmQgPSBqUXVlcnkuZmluZCxcclxuXHRyYXR0ckhhc2hUZXN0ID0gL1xcWyhcXHMqWy1cXHddK1xccyopKFt+fF4kKl0/PSlcXHMqKFstXFx3I10qPyNbLVxcdyNdKilcXHMqXFxdLyxcclxuXHRyYXR0ckhhc2hHbG9iID0gL1xcWyhcXHMqWy1cXHddK1xccyopKFt+fF4kKl0/PSlcXHMqKFstXFx3I10qPyNbLVxcdyNdKilcXHMqXFxdL2c7XHJcblxyXG5qUXVlcnkuZm4uaW5pdCA9IGZ1bmN0aW9uKCBhcmcxICkge1xyXG5cdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoIGFyZ3VtZW50cyApO1xyXG5cclxuXHRpZiAoIHR5cGVvZiBhcmcxID09PSBcInN0cmluZ1wiICYmIGFyZzEgPT09IFwiI1wiICkge1xyXG5cclxuXHRcdC8vIEpRdWVyeSggXCIjXCIgKSBpcyBhIGJvZ3VzIElEIHNlbGVjdG9yLCBidXQgaXQgcmV0dXJuZWQgYW4gZW1wdHkgc2V0IGJlZm9yZSBqUXVlcnkgMy4wXHJcblx0XHRtaWdyYXRlV2FybiggXCJqUXVlcnkoICcjJyApIGlzIG5vdCBhIHZhbGlkIHNlbGVjdG9yXCIgKTtcclxuXHRcdGFyZ3NbIDAgXSA9IFtdO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIG9sZEluaXQuYXBwbHkoIHRoaXMsIGFyZ3MgKTtcclxufTtcclxualF1ZXJ5LmZuLmluaXQucHJvdG90eXBlID0galF1ZXJ5LmZuO1xyXG5cclxualF1ZXJ5LmZpbmQgPSBmdW5jdGlvbiggc2VsZWN0b3IgKSB7XHJcblx0dmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggYXJndW1lbnRzICk7XHJcblxyXG5cdC8vIFN1cHBvcnQ6IFBoYW50b21KUyAxLnhcclxuXHQvLyBTdHJpbmcjbWF0Y2ggZmFpbHMgdG8gbWF0Y2ggd2hlbiB1c2VkIHdpdGggYSAvL2cgUmVnRXhwLCBvbmx5IG9uIHNvbWUgc3RyaW5nc1xyXG5cdGlmICggdHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiICYmIHJhdHRySGFzaFRlc3QudGVzdCggc2VsZWN0b3IgKSApIHtcclxuXHJcblx0XHQvLyBUaGUgbm9uc3RhbmRhcmQgYW5kIHVuZG9jdW1lbnRlZCB1bnF1b3RlZC1oYXNoIHdhcyByZW1vdmVkIGluIGpRdWVyeSAxLjEyLjBcclxuXHRcdC8vIEZpcnN0IHNlZSBpZiBxUyB0aGlua3MgaXQncyBhIHZhbGlkIHNlbGVjdG9yLCBpZiBzbyBhdm9pZCBhIGZhbHNlIHBvc2l0aXZlXHJcblx0XHR0cnkge1xyXG5cdFx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBzZWxlY3RvciApO1xyXG5cdFx0fSBjYXRjaCAoIGVycjEgKSB7XHJcblxyXG5cdFx0XHQvLyBEaWRuJ3QgKmxvb2sqIHZhbGlkIHRvIHFTQSwgd2FybiBhbmQgdHJ5IHF1b3Rpbmcgd2hhdCB3ZSB0aGluayBpcyB0aGUgdmFsdWVcclxuXHRcdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKCByYXR0ckhhc2hHbG9iLCBmdW5jdGlvbiggXywgYXR0ciwgb3AsIHZhbHVlICkge1xyXG5cdFx0XHRcdHJldHVybiBcIltcIiArIGF0dHIgKyBvcCArIFwiXFxcIlwiICsgdmFsdWUgKyBcIlxcXCJdXCI7XHJcblx0XHRcdH0gKTtcclxuXHJcblx0XHRcdC8vIElmIHRoZSByZWdleHAgKm1heSogaGF2ZSBjcmVhdGVkIGFuIGludmFsaWQgc2VsZWN0b3IsIGRvbid0IHVwZGF0ZSBpdFxyXG5cdFx0XHQvLyBOb3RlIHRoYXQgdGhlcmUgbWF5IGJlIGZhbHNlIGFsYXJtcyBpZiBzZWxlY3RvciB1c2VzIGpRdWVyeSBleHRlbnNpb25zXHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3Rvciggc2VsZWN0b3IgKTtcclxuXHRcdFx0XHRtaWdyYXRlV2FybiggXCJBdHRyaWJ1dGUgc2VsZWN0b3Igd2l0aCAnIycgbXVzdCBiZSBxdW90ZWQ6IFwiICsgYXJnc1sgMCBdICk7XHJcblx0XHRcdFx0YXJnc1sgMCBdID0gc2VsZWN0b3I7XHJcblx0XHRcdH0gY2F0Y2ggKCBlcnIyICkge1xyXG5cdFx0XHRcdG1pZ3JhdGVXYXJuKCBcIkF0dHJpYnV0ZSBzZWxlY3RvciB3aXRoICcjJyB3YXMgbm90IGZpeGVkOiBcIiArIGFyZ3NbIDAgXSApO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gb2xkRmluZC5hcHBseSggdGhpcywgYXJncyApO1xyXG59O1xyXG5cclxuLy8gQ29weSBwcm9wZXJ0aWVzIGF0dGFjaGVkIHRvIG9yaWdpbmFsIGpRdWVyeS5maW5kIG1ldGhvZCAoZS5nLiAuYXR0ciwgLmlzWE1MKVxyXG52YXIgZmluZFByb3A7XHJcbmZvciAoIGZpbmRQcm9wIGluIG9sZEZpbmQgKSB7XHJcblx0aWYgKCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoIG9sZEZpbmQsIGZpbmRQcm9wICkgKSB7XHJcblx0XHRqUXVlcnkuZmluZFsgZmluZFByb3AgXSA9IG9sZEZpbmRbIGZpbmRQcm9wIF07XHJcblx0fVxyXG59XHJcblxyXG4vLyBUaGUgbnVtYmVyIG9mIGVsZW1lbnRzIGNvbnRhaW5lZCBpbiB0aGUgbWF0Y2hlZCBlbGVtZW50IHNldFxyXG5qUXVlcnkuZm4uc2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG5cdG1pZ3JhdGVXYXJuKCBcImpRdWVyeS5mbi5zaXplKCkgaXMgZGVwcmVjYXRlZDsgdXNlIHRoZSAubGVuZ3RoIHByb3BlcnR5XCIgKTtcclxuXHRyZXR1cm4gdGhpcy5sZW5ndGg7XHJcbn07XHJcblxyXG5qUXVlcnkucGFyc2VKU09OID0gZnVuY3Rpb24oKSB7XHJcblx0bWlncmF0ZVdhcm4oIFwialF1ZXJ5LnBhcnNlSlNPTiBpcyBkZXByZWNhdGVkOyB1c2UgSlNPTi5wYXJzZVwiICk7XHJcblx0cmV0dXJuIEpTT04ucGFyc2UuYXBwbHkoIG51bGwsIGFyZ3VtZW50cyApO1xyXG59O1xyXG5cclxualF1ZXJ5LmlzTnVtZXJpYyA9IGZ1bmN0aW9uKCB2YWwgKSB7XHJcblxyXG5cdC8vIFRoZSBqUXVlcnkgMi4yLjMgaW1wbGVtZW50YXRpb24gb2YgaXNOdW1lcmljXHJcblx0ZnVuY3Rpb24gaXNOdW1lcmljMiggb2JqICkge1xyXG5cdFx0dmFyIHJlYWxTdHJpbmdPYmogPSBvYmogJiYgb2JqLnRvU3RyaW5nKCk7XHJcblx0XHRyZXR1cm4gIWpRdWVyeS5pc0FycmF5KCBvYmogKSAmJiAoIHJlYWxTdHJpbmdPYmogLSBwYXJzZUZsb2F0KCByZWFsU3RyaW5nT2JqICkgKyAxICkgPj0gMDtcclxuXHR9XHJcblxyXG5cdHZhciBuZXdWYWx1ZSA9IG9sZElzTnVtZXJpYyggdmFsICksXHJcblx0XHRvbGRWYWx1ZSA9IGlzTnVtZXJpYzIoIHZhbCApO1xyXG5cclxuXHRpZiAoIG5ld1ZhbHVlICE9PSBvbGRWYWx1ZSApIHtcclxuXHRcdG1pZ3JhdGVXYXJuKCBcImpRdWVyeS5pc051bWVyaWMoKSBzaG91bGQgbm90IGJlIGNhbGxlZCBvbiBjb25zdHJ1Y3RlZCBvYmplY3RzXCIgKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBvbGRWYWx1ZTtcclxufTtcclxuXHJcbm1pZ3JhdGVXYXJuUHJvcCggalF1ZXJ5LCBcInVuaXF1ZVwiLCBqUXVlcnkudW5pcXVlU29ydCxcclxuXHRcImpRdWVyeS51bmlxdWUgaXMgZGVwcmVjYXRlZCwgdXNlIGpRdWVyeS51bmlxdWVTb3J0XCIgKTtcclxuXHJcbi8vIE5vdyBqUXVlcnkuZXhwci5wc2V1ZG9zIGlzIHRoZSBzdGFuZGFyZCBpbmNhbnRhdGlvblxyXG5taWdyYXRlV2FyblByb3AoIGpRdWVyeS5leHByLCBcImZpbHRlcnNcIiwgalF1ZXJ5LmV4cHIucHNldWRvcyxcclxuXHRcImpRdWVyeS5leHByLmZpbHRlcnMgaXMgbm93IGpRdWVyeS5leHByLnBzZXVkb3NcIiApO1xyXG5taWdyYXRlV2FyblByb3AoIGpRdWVyeS5leHByLCBcIjpcIiwgalF1ZXJ5LmV4cHIucHNldWRvcyxcclxuXHRcImpRdWVyeS5leHByW1xcXCI6XFxcIl0gaXMgbm93IGpRdWVyeS5leHByLnBzZXVkb3NcIiApO1xyXG5cclxuXHJcbnZhciBvbGRBamF4ID0galF1ZXJ5LmFqYXg7XHJcblxyXG5qUXVlcnkuYWpheCA9IGZ1bmN0aW9uKCApIHtcclxuXHR2YXIgalFYSFIgPSBvbGRBamF4LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcclxuXHJcblx0Ly8gQmUgc3VyZSB3ZSBnb3QgYSBqUVhIUiAoZS5nLiwgbm90IHN5bmMpXHJcblx0aWYgKCBqUVhIUi5wcm9taXNlICkge1xyXG5cdFx0bWlncmF0ZVdhcm5Qcm9wKCBqUVhIUiwgXCJzdWNjZXNzXCIsIGpRWEhSLmRvbmUsXHJcblx0XHRcdFwialFYSFIuc3VjY2VzcyBpcyBkZXByZWNhdGVkIGFuZCByZW1vdmVkXCIgKTtcclxuXHRcdG1pZ3JhdGVXYXJuUHJvcCggalFYSFIsIFwiZXJyb3JcIiwgalFYSFIuZmFpbCxcclxuXHRcdFx0XCJqUVhIUi5lcnJvciBpcyBkZXByZWNhdGVkIGFuZCByZW1vdmVkXCIgKTtcclxuXHRcdG1pZ3JhdGVXYXJuUHJvcCggalFYSFIsIFwiY29tcGxldGVcIiwgalFYSFIuYWx3YXlzLFxyXG5cdFx0XHRcImpRWEhSLmNvbXBsZXRlIGlzIGRlcHJlY2F0ZWQgYW5kIHJlbW92ZWRcIiApO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIGpRWEhSO1xyXG59O1xyXG5cclxuXHJcbnZhciBvbGRSZW1vdmVBdHRyID0galF1ZXJ5LmZuLnJlbW92ZUF0dHIsXHJcblx0b2xkVG9nZ2xlQ2xhc3MgPSBqUXVlcnkuZm4udG9nZ2xlQ2xhc3MsXHJcblx0cm1hdGNoTm9uU3BhY2UgPSAvXFxTKy9nO1xyXG5cclxualF1ZXJ5LmZuLnJlbW92ZUF0dHIgPSBmdW5jdGlvbiggbmFtZSApIHtcclxuXHR2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG5cdGpRdWVyeS5lYWNoKCBuYW1lLm1hdGNoKCBybWF0Y2hOb25TcGFjZSApLCBmdW5jdGlvbiggaSwgYXR0ciApIHtcclxuXHRcdGlmICggalF1ZXJ5LmV4cHIubWF0Y2guYm9vbC50ZXN0KCBhdHRyICkgKSB7XHJcblx0XHRcdG1pZ3JhdGVXYXJuKCBcImpRdWVyeS5mbi5yZW1vdmVBdHRyIG5vIGxvbmdlciBzZXRzIGJvb2xlYW4gcHJvcGVydGllczogXCIgKyBhdHRyICk7XHJcblx0XHRcdHNlbGYucHJvcCggYXR0ciwgZmFsc2UgKTtcclxuXHRcdH1cclxuXHR9ICk7XHJcblxyXG5cdHJldHVybiBvbGRSZW1vdmVBdHRyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcclxufTtcclxuXHJcbmpRdWVyeS5mbi50b2dnbGVDbGFzcyA9IGZ1bmN0aW9uKCBzdGF0ZSApIHtcclxuXHJcblx0Ly8gT25seSBkZXByZWNhdGluZyBuby1hcmdzIG9yIHNpbmdsZSBib29sZWFuIGFyZ1xyXG5cdGlmICggc3RhdGUgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygc3RhdGUgIT09IFwiYm9vbGVhblwiICkge1xyXG5cdFx0cmV0dXJuIG9sZFRvZ2dsZUNsYXNzLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcclxuXHR9XHJcblxyXG5cdG1pZ3JhdGVXYXJuKCBcImpRdWVyeS5mbi50b2dnbGVDbGFzcyggYm9vbGVhbiApIGlzIGRlcHJlY2F0ZWRcIiApO1xyXG5cclxuXHQvLyBUb2dnbGUgZW50aXJlIGNsYXNzIG5hbWUgb2YgZWFjaCBlbGVtZW50XHJcblx0cmV0dXJuIHRoaXMuZWFjaCggZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgY2xhc3NOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUgJiYgdGhpcy5nZXRBdHRyaWJ1dGUoIFwiY2xhc3NcIiApIHx8IFwiXCI7XHJcblxyXG5cdFx0aWYgKCBjbGFzc05hbWUgKSB7XHJcblx0XHRcdGpRdWVyeS5kYXRhKCB0aGlzLCBcIl9fY2xhc3NOYW1lX19cIiwgY2xhc3NOYW1lICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gSWYgdGhlIGVsZW1lbnQgaGFzIGEgY2xhc3MgbmFtZSBvciBpZiB3ZSdyZSBwYXNzZWQgYGZhbHNlYCxcclxuXHRcdC8vIHRoZW4gcmVtb3ZlIHRoZSB3aG9sZSBjbGFzc25hbWUgKGlmIHRoZXJlIHdhcyBvbmUsIHRoZSBhYm92ZSBzYXZlZCBpdCkuXHJcblx0XHQvLyBPdGhlcndpc2UgYnJpbmcgYmFjayB3aGF0ZXZlciB3YXMgcHJldmlvdXNseSBzYXZlZCAoaWYgYW55dGhpbmcpLFxyXG5cdFx0Ly8gZmFsbGluZyBiYWNrIHRvIHRoZSBlbXB0eSBzdHJpbmcgaWYgbm90aGluZyB3YXMgc3RvcmVkLlxyXG5cdFx0aWYgKCB0aGlzLnNldEF0dHJpYnV0ZSApIHtcclxuXHRcdFx0dGhpcy5zZXRBdHRyaWJ1dGUoIFwiY2xhc3NcIixcclxuXHRcdFx0XHRjbGFzc05hbWUgfHwgc3RhdGUgPT09IGZhbHNlID9cclxuXHRcdFx0XHRcIlwiIDpcclxuXHRcdFx0XHRqUXVlcnkuZGF0YSggdGhpcywgXCJfX2NsYXNzTmFtZV9fXCIgKSB8fCBcIlwiXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0fSApO1xyXG59O1xyXG5cclxuXHJcbnZhciBpbnRlcm5hbFN3YXBDYWxsID0gZmFsc2U7XHJcblxyXG4vLyBJZiB0aGlzIHZlcnNpb24gb2YgalF1ZXJ5IGhhcyAuc3dhcCgpLCBkb24ndCBmYWxzZS1hbGFybSBvbiBpbnRlcm5hbCB1c2VzXHJcbmlmICggalF1ZXJ5LnN3YXAgKSB7XHJcblx0alF1ZXJ5LmVhY2goIFsgXCJoZWlnaHRcIiwgXCJ3aWR0aFwiLCBcInJlbGlhYmxlTWFyZ2luUmlnaHRcIiBdLCBmdW5jdGlvbiggXywgbmFtZSApIHtcclxuXHRcdHZhciBvbGRIb29rID0galF1ZXJ5LmNzc0hvb2tzWyBuYW1lIF0gJiYgalF1ZXJ5LmNzc0hvb2tzWyBuYW1lIF0uZ2V0O1xyXG5cclxuXHRcdGlmICggb2xkSG9vayApIHtcclxuXHRcdFx0alF1ZXJ5LmNzc0hvb2tzWyBuYW1lIF0uZ2V0ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIHJldDtcclxuXHJcblx0XHRcdFx0aW50ZXJuYWxTd2FwQ2FsbCA9IHRydWU7XHJcblx0XHRcdFx0cmV0ID0gb2xkSG9vay5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XHJcblx0XHRcdFx0aW50ZXJuYWxTd2FwQ2FsbCA9IGZhbHNlO1xyXG5cdFx0XHRcdHJldHVybiByZXQ7XHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0fSApO1xyXG59XHJcblxyXG5qUXVlcnkuc3dhcCA9IGZ1bmN0aW9uKCBlbGVtLCBvcHRpb25zLCBjYWxsYmFjaywgYXJncyApIHtcclxuXHR2YXIgcmV0LCBuYW1lLFxyXG5cdFx0b2xkID0ge307XHJcblxyXG5cdGlmICggIWludGVybmFsU3dhcENhbGwgKSB7XHJcblx0XHRtaWdyYXRlV2FybiggXCJqUXVlcnkuc3dhcCgpIGlzIHVuZG9jdW1lbnRlZCBhbmQgZGVwcmVjYXRlZFwiICk7XHJcblx0fVxyXG5cclxuXHQvLyBSZW1lbWJlciB0aGUgb2xkIHZhbHVlcywgYW5kIGluc2VydCB0aGUgbmV3IG9uZXNcclxuXHRmb3IgKCBuYW1lIGluIG9wdGlvbnMgKSB7XHJcblx0XHRvbGRbIG5hbWUgXSA9IGVsZW0uc3R5bGVbIG5hbWUgXTtcclxuXHRcdGVsZW0uc3R5bGVbIG5hbWUgXSA9IG9wdGlvbnNbIG5hbWUgXTtcclxuXHR9XHJcblxyXG5cdHJldCA9IGNhbGxiYWNrLmFwcGx5KCBlbGVtLCBhcmdzIHx8IFtdICk7XHJcblxyXG5cdC8vIFJldmVydCB0aGUgb2xkIHZhbHVlc1xyXG5cdGZvciAoIG5hbWUgaW4gb3B0aW9ucyApIHtcclxuXHRcdGVsZW0uc3R5bGVbIG5hbWUgXSA9IG9sZFsgbmFtZSBdO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcbnZhciBvbGREYXRhID0galF1ZXJ5LmRhdGE7XHJcblxyXG5qUXVlcnkuZGF0YSA9IGZ1bmN0aW9uKCBlbGVtLCBuYW1lLCB2YWx1ZSApIHtcclxuXHR2YXIgY3VyRGF0YTtcclxuXHJcblx0Ly8gSWYgdGhlIG5hbWUgaXMgdHJhbnNmb3JtZWQsIGxvb2sgZm9yIHRoZSB1bi10cmFuc2Zvcm1lZCBuYW1lIGluIHRoZSBkYXRhIG9iamVjdFxyXG5cdGlmICggbmFtZSAmJiBuYW1lICE9PSBqUXVlcnkuY2FtZWxDYXNlKCBuYW1lICkgKSB7XHJcblx0XHRjdXJEYXRhID0galF1ZXJ5Lmhhc0RhdGEoIGVsZW0gKSAmJiBvbGREYXRhLmNhbGwoIHRoaXMsIGVsZW0gKTtcclxuXHRcdGlmICggY3VyRGF0YSAmJiBuYW1lIGluIGN1ckRhdGEgKSB7XHJcblx0XHRcdG1pZ3JhdGVXYXJuKCBcImpRdWVyeS5kYXRhKCkgYWx3YXlzIHNldHMvZ2V0cyBjYW1lbENhc2VkIG5hbWVzOiBcIiArIG5hbWUgKTtcclxuXHRcdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID4gMiApIHtcclxuXHRcdFx0XHRjdXJEYXRhWyBuYW1lIF0gPSB2YWx1ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gY3VyRGF0YVsgbmFtZSBdO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIG9sZERhdGEuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xyXG59O1xyXG5cclxudmFyIG9sZFR3ZWVuUnVuID0galF1ZXJ5LlR3ZWVuLnByb3RvdHlwZS5ydW47XHJcblxyXG5qUXVlcnkuVHdlZW4ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uKCBwZXJjZW50ICkge1xyXG5cdGlmICggalF1ZXJ5LmVhc2luZ1sgdGhpcy5lYXNpbmcgXS5sZW5ndGggPiAxICkge1xyXG5cdFx0bWlncmF0ZVdhcm4oXHJcblx0XHRcdFwiZWFzaW5nIGZ1bmN0aW9uIFwiICtcclxuXHRcdFx0XCJcXFwialF1ZXJ5LmVhc2luZy5cIiArIHRoaXMuZWFzaW5nLnRvU3RyaW5nKCkgK1xyXG5cdFx0XHRcIlxcXCIgc2hvdWxkIHVzZSBvbmx5IGZpcnN0IGFyZ3VtZW50XCJcclxuXHRcdCk7XHJcblxyXG5cdFx0alF1ZXJ5LmVhc2luZ1sgdGhpcy5lYXNpbmcgXSA9IGpRdWVyeS5lYXNpbmdbIHRoaXMuZWFzaW5nIF0uYmluZChcclxuXHRcdFx0alF1ZXJ5LmVhc2luZyxcclxuXHRcdFx0cGVyY2VudCwgdGhpcy5vcHRpb25zLmR1cmF0aW9uICogcGVyY2VudCwgMCwgMSwgdGhpcy5vcHRpb25zLmR1cmF0aW9uXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0b2xkVHdlZW5SdW4uYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xyXG59O1xyXG5cclxudmFyIG9sZExvYWQgPSBqUXVlcnkuZm4ubG9hZCxcclxuXHRvcmlnaW5hbEZpeCA9IGpRdWVyeS5ldmVudC5maXg7XHJcblxyXG5qUXVlcnkuZXZlbnQucHJvcHMgPSBbXTtcclxualF1ZXJ5LmV2ZW50LmZpeEhvb2tzID0ge307XHJcblxyXG5qUXVlcnkuZXZlbnQuZml4ID0gZnVuY3Rpb24oIG9yaWdpbmFsRXZlbnQgKSB7XHJcblx0dmFyIGV2ZW50LFxyXG5cdFx0dHlwZSA9IG9yaWdpbmFsRXZlbnQudHlwZSxcclxuXHRcdGZpeEhvb2sgPSB0aGlzLmZpeEhvb2tzWyB0eXBlIF0sXHJcblx0XHRwcm9wcyA9IGpRdWVyeS5ldmVudC5wcm9wcztcclxuXHJcblx0aWYgKCBwcm9wcy5sZW5ndGggKSB7XHJcblx0XHRtaWdyYXRlV2FybiggXCJqUXVlcnkuZXZlbnQucHJvcHMgYXJlIGRlcHJlY2F0ZWQgYW5kIHJlbW92ZWQ6IFwiICsgcHJvcHMuam9pbigpICk7XHJcblx0XHR3aGlsZSAoIHByb3BzLmxlbmd0aCApIHtcclxuXHRcdFx0alF1ZXJ5LmV2ZW50LmFkZFByb3AoIHByb3BzLnBvcCgpICk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRpZiAoIGZpeEhvb2sgJiYgIWZpeEhvb2suX21pZ3JhdGVkXyApIHtcclxuXHRcdGZpeEhvb2suX21pZ3JhdGVkXyA9IHRydWU7XHJcblx0XHRtaWdyYXRlV2FybiggXCJqUXVlcnkuZXZlbnQuZml4SG9va3MgYXJlIGRlcHJlY2F0ZWQgYW5kIHJlbW92ZWQ6IFwiICsgdHlwZSApO1xyXG5cdFx0aWYgKCAoIHByb3BzID0gZml4SG9vay5wcm9wcyApICYmIHByb3BzLmxlbmd0aCApIHtcclxuXHRcdFx0d2hpbGUgKCBwcm9wcy5sZW5ndGggKSB7XHJcblx0XHRcdCAgIGpRdWVyeS5ldmVudC5hZGRQcm9wKCBwcm9wcy5wb3AoKSApO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRldmVudCA9IG9yaWdpbmFsRml4LmNhbGwoIHRoaXMsIG9yaWdpbmFsRXZlbnQgKTtcclxuXHJcblx0cmV0dXJuIGZpeEhvb2sgJiYgZml4SG9vay5maWx0ZXIgPyBmaXhIb29rLmZpbHRlciggZXZlbnQsIG9yaWdpbmFsRXZlbnQgKSA6IGV2ZW50O1xyXG59O1xyXG5cclxualF1ZXJ5LmVhY2goIFsgXCJsb2FkXCIsIFwidW5sb2FkXCIsIFwiZXJyb3JcIiBdLCBmdW5jdGlvbiggXywgbmFtZSApIHtcclxuXHJcblx0alF1ZXJ5LmZuWyBuYW1lIF0gPSBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoIGFyZ3VtZW50cywgMCApO1xyXG5cclxuXHRcdC8vIElmIHRoaXMgaXMgYW4gYWpheCBsb2FkKCkgdGhlIGZpcnN0IGFyZyBzaG91bGQgYmUgdGhlIHN0cmluZyBVUkw7XHJcblx0XHQvLyB0ZWNobmljYWxseSB0aGlzIGNvdWxkIGFsc28gYmUgdGhlIFwiQW55dGhpbmdcIiBhcmcgb2YgdGhlIGV2ZW50IC5sb2FkKClcclxuXHRcdC8vIHdoaWNoIGp1c3QgZ29lcyB0byBzaG93IHdoeSB0aGlzIGR1bWIgc2lnbmF0dXJlIGhhcyBiZWVuIGRlcHJlY2F0ZWQhXHJcblx0XHQvLyBqUXVlcnkgY3VzdG9tIGJ1aWxkcyB0aGF0IGV4Y2x1ZGUgdGhlIEFqYXggbW9kdWxlIGp1c3RpZmlhYmx5IGRpZSBoZXJlLlxyXG5cdFx0aWYgKCBuYW1lID09PSBcImxvYWRcIiAmJiB0eXBlb2YgYXJnc1sgMCBdID09PSBcInN0cmluZ1wiICkge1xyXG5cdFx0XHRyZXR1cm4gb2xkTG9hZC5hcHBseSggdGhpcywgYXJncyApO1xyXG5cdFx0fVxyXG5cclxuXHRcdG1pZ3JhdGVXYXJuKCBcImpRdWVyeS5mbi5cIiArIG5hbWUgKyBcIigpIGlzIGRlcHJlY2F0ZWRcIiApO1xyXG5cclxuXHRcdGFyZ3Muc3BsaWNlKCAwLCAwLCBuYW1lICk7XHJcblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLm9uLmFwcGx5KCB0aGlzLCBhcmdzICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVXNlIC50cmlnZ2VySGFuZGxlciBoZXJlIGJlY2F1c2U6XHJcblx0XHQvLyAtIGxvYWQgYW5kIHVubG9hZCBldmVudHMgZG9uJ3QgbmVlZCB0byBidWJibGUsIG9ubHkgYXBwbGllZCB0byB3aW5kb3cgb3IgaW1hZ2VcclxuXHRcdC8vIC0gZXJyb3IgZXZlbnQgc2hvdWxkIG5vdCBidWJibGUgdG8gd2luZG93LCBhbHRob3VnaCBpdCBkb2VzIHByZS0xLjdcclxuXHRcdC8vIFNlZSBodHRwOi8vYnVncy5qcXVlcnkuY29tL3RpY2tldC8xMTgyMFxyXG5cdFx0dGhpcy50cmlnZ2VySGFuZGxlci5hcHBseSggdGhpcywgYXJncyApO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fTtcclxuXHJcbn0gKTtcclxuXHJcbi8vIFRyaWdnZXIgXCJyZWFkeVwiIGV2ZW50IG9ubHkgb25jZSwgb24gZG9jdW1lbnQgcmVhZHlcclxualF1ZXJ5KCBmdW5jdGlvbigpIHtcclxuXHRqUXVlcnkoIGRvY3VtZW50ICkudHJpZ2dlckhhbmRsZXIoIFwicmVhZHlcIiApO1xyXG59ICk7XHJcblxyXG5qUXVlcnkuZXZlbnQuc3BlY2lhbC5yZWFkeSA9IHtcclxuXHRzZXR1cDogZnVuY3Rpb24oKSB7XHJcblx0XHRpZiAoIHRoaXMgPT09IGRvY3VtZW50ICkge1xyXG5cdFx0XHRtaWdyYXRlV2FybiggXCIncmVhZHknIGV2ZW50IGlzIGRlcHJlY2F0ZWRcIiApO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbmpRdWVyeS5mbi5leHRlbmQoIHtcclxuXHJcblx0YmluZDogZnVuY3Rpb24oIHR5cGVzLCBkYXRhLCBmbiApIHtcclxuXHRcdG1pZ3JhdGVXYXJuKCBcImpRdWVyeS5mbi5iaW5kKCkgaXMgZGVwcmVjYXRlZFwiICk7XHJcblx0XHRyZXR1cm4gdGhpcy5vbiggdHlwZXMsIG51bGwsIGRhdGEsIGZuICk7XHJcblx0fSxcclxuXHR1bmJpbmQ6IGZ1bmN0aW9uKCB0eXBlcywgZm4gKSB7XHJcblx0XHRtaWdyYXRlV2FybiggXCJqUXVlcnkuZm4udW5iaW5kKCkgaXMgZGVwcmVjYXRlZFwiICk7XHJcblx0XHRyZXR1cm4gdGhpcy5vZmYoIHR5cGVzLCBudWxsLCBmbiApO1xyXG5cdH0sXHJcblx0ZGVsZWdhdGU6IGZ1bmN0aW9uKCBzZWxlY3RvciwgdHlwZXMsIGRhdGEsIGZuICkge1xyXG5cdFx0bWlncmF0ZVdhcm4oIFwialF1ZXJ5LmZuLmRlbGVnYXRlKCkgaXMgZGVwcmVjYXRlZFwiICk7XHJcblx0XHRyZXR1cm4gdGhpcy5vbiggdHlwZXMsIHNlbGVjdG9yLCBkYXRhLCBmbiApO1xyXG5cdH0sXHJcblx0dW5kZWxlZ2F0ZTogZnVuY3Rpb24oIHNlbGVjdG9yLCB0eXBlcywgZm4gKSB7XHJcblx0XHRtaWdyYXRlV2FybiggXCJqUXVlcnkuZm4udW5kZWxlZ2F0ZSgpIGlzIGRlcHJlY2F0ZWRcIiApO1xyXG5cdFx0cmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgP1xyXG5cdFx0XHR0aGlzLm9mZiggc2VsZWN0b3IsIFwiKipcIiApIDpcclxuXHRcdFx0dGhpcy5vZmYoIHR5cGVzLCBzZWxlY3RvciB8fCBcIioqXCIsIGZuICk7XHJcblx0fVxyXG59ICk7XHJcblxyXG5cclxudmFyIG9sZE9mZnNldCA9IGpRdWVyeS5mbi5vZmZzZXQ7XHJcblxyXG5qUXVlcnkuZm4ub2Zmc2V0ID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIGRvY0VsZW0sXHJcblx0XHRlbGVtID0gdGhpc1sgMCBdLFxyXG5cdFx0b3JpZ2luID0geyB0b3A6IDAsIGxlZnQ6IDAgfTtcclxuXHJcblx0aWYgKCAhZWxlbSB8fCAhZWxlbS5ub2RlVHlwZSApIHtcclxuXHRcdG1pZ3JhdGVXYXJuKCBcImpRdWVyeS5mbi5vZmZzZXQoKSByZXF1aXJlcyBhIHZhbGlkIERPTSBlbGVtZW50XCIgKTtcclxuXHRcdHJldHVybiBvcmlnaW47XHJcblx0fVxyXG5cclxuXHRkb2NFbGVtID0gKCBlbGVtLm93bmVyRG9jdW1lbnQgfHwgZG9jdW1lbnQgKS5kb2N1bWVudEVsZW1lbnQ7XHJcblx0aWYgKCAhalF1ZXJ5LmNvbnRhaW5zKCBkb2NFbGVtLCBlbGVtICkgKSB7XHJcblx0XHRtaWdyYXRlV2FybiggXCJqUXVlcnkuZm4ub2Zmc2V0KCkgcmVxdWlyZXMgYW4gZWxlbWVudCBjb25uZWN0ZWQgdG8gYSBkb2N1bWVudFwiICk7XHJcblx0XHRyZXR1cm4gb3JpZ2luO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIG9sZE9mZnNldC5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XHJcbn07XHJcblxyXG5cclxudmFyIG9sZFBhcmFtID0galF1ZXJ5LnBhcmFtO1xyXG5cclxualF1ZXJ5LnBhcmFtID0gZnVuY3Rpb24oIGRhdGEsIHRyYWRpdGlvbmFsICkge1xyXG5cdHZhciBhamF4VHJhZGl0aW9uYWwgPSBqUXVlcnkuYWpheFNldHRpbmdzICYmIGpRdWVyeS5hamF4U2V0dGluZ3MudHJhZGl0aW9uYWw7XHJcblxyXG5cdGlmICggdHJhZGl0aW9uYWwgPT09IHVuZGVmaW5lZCAmJiBhamF4VHJhZGl0aW9uYWwgKSB7XHJcblxyXG5cdFx0bWlncmF0ZVdhcm4oIFwialF1ZXJ5LnBhcmFtKCkgbm8gbG9uZ2VyIHVzZXMgalF1ZXJ5LmFqYXhTZXR0aW5ncy50cmFkaXRpb25hbFwiICk7XHJcblx0XHR0cmFkaXRpb25hbCA9IGFqYXhUcmFkaXRpb25hbDtcclxuXHR9XHJcblxyXG5cdHJldHVybiBvbGRQYXJhbS5jYWxsKCB0aGlzLCBkYXRhLCB0cmFkaXRpb25hbCApO1xyXG59O1xyXG5cclxudmFyIG9sZFNlbGYgPSBqUXVlcnkuZm4uYW5kU2VsZiB8fCBqUXVlcnkuZm4uYWRkQmFjaztcclxuXHJcbmpRdWVyeS5mbi5hbmRTZWxmID0gZnVuY3Rpb24oKSB7XHJcblx0bWlncmF0ZVdhcm4oIFwialF1ZXJ5LmZuLmFuZFNlbGYoKSByZXBsYWNlZCBieSBqUXVlcnkuZm4uYWRkQmFjaygpXCIgKTtcclxuXHRyZXR1cm4gb2xkU2VsZi5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XHJcbn07XHJcblxyXG5cclxudmFyIG9sZERlZmVycmVkID0galF1ZXJ5LkRlZmVycmVkLFxyXG5cdHR1cGxlcyA9IFtcclxuXHJcblx0XHQvLyBBY3Rpb24sIGFkZCBsaXN0ZW5lciwgY2FsbGJhY2tzLCAudGhlbiBoYW5kbGVycywgZmluYWwgc3RhdGVcclxuXHRcdFsgXCJyZXNvbHZlXCIsIFwiZG9uZVwiLCBqUXVlcnkuQ2FsbGJhY2tzKCBcIm9uY2UgbWVtb3J5XCIgKSxcclxuXHRcdFx0alF1ZXJ5LkNhbGxiYWNrcyggXCJvbmNlIG1lbW9yeVwiICksIFwicmVzb2x2ZWRcIiBdLFxyXG5cdFx0WyBcInJlamVjdFwiLCBcImZhaWxcIiwgalF1ZXJ5LkNhbGxiYWNrcyggXCJvbmNlIG1lbW9yeVwiICksXHJcblx0XHRcdGpRdWVyeS5DYWxsYmFja3MoIFwib25jZSBtZW1vcnlcIiApLCBcInJlamVjdGVkXCIgXSxcclxuXHRcdFsgXCJub3RpZnlcIiwgXCJwcm9ncmVzc1wiLCBqUXVlcnkuQ2FsbGJhY2tzKCBcIm1lbW9yeVwiICksXHJcblx0XHRcdGpRdWVyeS5DYWxsYmFja3MoIFwibWVtb3J5XCIgKSBdXHJcblx0XTtcclxuXHJcbmpRdWVyeS5EZWZlcnJlZCA9IGZ1bmN0aW9uKCBmdW5jICkge1xyXG5cdHZhciBkZWZlcnJlZCA9IG9sZERlZmVycmVkKCksXHJcblx0XHRwcm9taXNlID0gZGVmZXJyZWQucHJvbWlzZSgpO1xyXG5cclxuXHRkZWZlcnJlZC5waXBlID0gcHJvbWlzZS5waXBlID0gZnVuY3Rpb24oIC8qIGZuRG9uZSwgZm5GYWlsLCBmblByb2dyZXNzICovICkge1xyXG5cdFx0dmFyIGZucyA9IGFyZ3VtZW50cztcclxuXHJcblx0XHRtaWdyYXRlV2FybiggXCJkZWZlcnJlZC5waXBlKCkgaXMgZGVwcmVjYXRlZFwiICk7XHJcblxyXG5cdFx0cmV0dXJuIGpRdWVyeS5EZWZlcnJlZCggZnVuY3Rpb24oIG5ld0RlZmVyICkge1xyXG5cdFx0XHRqUXVlcnkuZWFjaCggdHVwbGVzLCBmdW5jdGlvbiggaSwgdHVwbGUgKSB7XHJcblx0XHRcdFx0dmFyIGZuID0galF1ZXJ5LmlzRnVuY3Rpb24oIGZuc1sgaSBdICkgJiYgZm5zWyBpIF07XHJcblxyXG5cdFx0XHRcdC8vIERlZmVycmVkLmRvbmUoZnVuY3Rpb24oKSB7IGJpbmQgdG8gbmV3RGVmZXIgb3IgbmV3RGVmZXIucmVzb2x2ZSB9KVxyXG5cdFx0XHRcdC8vIGRlZmVycmVkLmZhaWwoZnVuY3Rpb24oKSB7IGJpbmQgdG8gbmV3RGVmZXIgb3IgbmV3RGVmZXIucmVqZWN0IH0pXHJcblx0XHRcdFx0Ly8gZGVmZXJyZWQucHJvZ3Jlc3MoZnVuY3Rpb24oKSB7IGJpbmQgdG8gbmV3RGVmZXIgb3IgbmV3RGVmZXIubm90aWZ5IH0pXHJcblx0XHRcdFx0ZGVmZXJyZWRbIHR1cGxlWyAxIF0gXSggZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR2YXIgcmV0dXJuZWQgPSBmbiAmJiBmbi5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XHJcblx0XHRcdFx0XHRpZiAoIHJldHVybmVkICYmIGpRdWVyeS5pc0Z1bmN0aW9uKCByZXR1cm5lZC5wcm9taXNlICkgKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybmVkLnByb21pc2UoKVxyXG5cdFx0XHRcdFx0XHRcdC5kb25lKCBuZXdEZWZlci5yZXNvbHZlIClcclxuXHRcdFx0XHRcdFx0XHQuZmFpbCggbmV3RGVmZXIucmVqZWN0IClcclxuXHRcdFx0XHRcdFx0XHQucHJvZ3Jlc3MoIG5ld0RlZmVyLm5vdGlmeSApO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0bmV3RGVmZXJbIHR1cGxlWyAwIF0gKyBcIldpdGhcIiBdKFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMgPT09IHByb21pc2UgPyBuZXdEZWZlci5wcm9taXNlKCkgOiB0aGlzLFxyXG5cdFx0XHRcdFx0XHRcdGZuID8gWyByZXR1cm5lZCBdIDogYXJndW1lbnRzXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSApO1xyXG5cdFx0XHR9ICk7XHJcblx0XHRcdGZucyA9IG51bGw7XHJcblx0XHR9ICkucHJvbWlzZSgpO1xyXG5cclxuXHR9O1xyXG5cclxuXHRpZiAoIGZ1bmMgKSB7XHJcblx0XHRmdW5jLmNhbGwoIGRlZmVycmVkLCBkZWZlcnJlZCApO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIGRlZmVycmVkO1xyXG59O1xyXG5cclxuXHJcblxyXG59KSggalF1ZXJ5LCB3aW5kb3cgKTtcclxuLyohXHJcbiAqIFNpbXBsZSBqUXVlcnkgRXF1YWwgSGVpZ2h0c1xyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMgTWF0dCBCYW5rc1xyXG4gKiBEdWFsIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgYW5kIEdQTCBsaWNlbnNlcy5cclxuICogVXNlcyB0aGUgc2FtZSBsaWNlbnNlIGFzIGpRdWVyeSwgc2VlOlxyXG4gKiBodHRwOi8vZG9jcy5qcXVlcnkuY29tL0xpY2Vuc2VcclxuICpcclxuICogQHZlcnNpb24gMS41LjFcclxuICovXHJcbiFmdW5jdGlvbihhKXthLmZuLmVxdWFsSGVpZ2h0cz1mdW5jdGlvbigpe3ZhciBiPTAsYz1hKHRoaXMpO3JldHVybiBjLmVhY2goZnVuY3Rpb24oKXt2YXIgYz1hKHRoaXMpLmlubmVySGVpZ2h0KCk7Yz5iJiYoYj1jKX0pLGMuY3NzKFwiaGVpZ2h0XCIsYil9LGEoXCJbZGF0YS1lcXVhbF1cIikuZWFjaChmdW5jdGlvbigpe3ZhciBiPWEodGhpcyksYz1iLmRhdGEoXCJlcXVhbFwiKTtiLmZpbmQoYykuZXF1YWxIZWlnaHRzKCl9KX0oalF1ZXJ5KTsiXSwiZmlsZSI6ImxpYnMuanMifQ==
