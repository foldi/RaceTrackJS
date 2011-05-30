/*global window, document */
/**
	Google Analytics Event Tracking by class name.
	
	@author Vince Allen 05-30-2011
	
	version 1.0
	
**/
RaceTrackJS = {};
RaceTrackJS.Tracker = (function () {
	
	var className = [], // add classes of objects to track; the object's id will appear in the event tracking report
		toTrack = {
			click: [], // add classes to these arrays that should NOT be tracked for these actions
			touchend: []
		},
		time_start = new Date().getTime();
	
	return {
		time_start: time_start,
		className: className,
		toTrack: toTrack,
		tracked_events: [],
		ready: function () {
			RaceTrackJS.Tracker.configure({
				className: [],
				toTrack: { // add classes to these arrays that should NOT be tracked for these actions
					click: [], 
					touchend: []
				}
			});
		},
		/**
			@description Configures the RaceTrackJS object and adds events to track. 
			@param {Object} params
		 */	
		eventHandlerRef: function (data) {
			return function (e) {
				
				var time,
					category,
					action,
					label,
					value;					
									
				if (data.time_start) { // the time in ms from when script loaded and the user triggered the event
					time = new Date();
					value = time.getTime() - data.time_start;
				} else {
					value = null;
				}
				
				category = data.className.toLowerCase();
				action = data.action.toLowerCase() + " - " + data.className.toLowerCase();
				label = data.id.toLowerCase();

				RaceTrackJS.Tracker.tracked_events.push({ category: category, action: action, label: label, value: value }); // store the tracked events 

				if(typeof _gaq === "object") {
					return _gaq.push(["_trackEvent", category, action, label, value]); // Google Analytics Async Code
				} else if (typeof pageTracker === "object") {
					return pageTracker._trackEvent(category, action, label, value); // Google Analytics Traditional (ga.js) Code
				}
				
								
			};
		},	
		configure: function (params) {
			
			var id, action, objByClass, data, i, j, max;
			
			className = (typeof params.className !== "undefined" && params.className.constructor === Array) ? params.className : this.className;
			toTrack = (typeof params.toTrack === "object") ? params.toTrack : this.toTrack;
			
			for (action in toTrack) {
				if (toTrack.hasOwnProperty(action)) {
					for (i = 0, max = className.length; i < max; i += 1) {
						
						if (!this.inArray(className[i], toTrack[action])) { // only track this action if this class does NOT appear in the action's array
							
							objByClass = this.getElementsByClass(className[i]); // get all objects in document by className
							
							for (j = 0; j < objByClass.length; j += 1) { // loop thru objects and add event listener
								this.addEvent(objByClass[j], action, this.eventHandlerRef({ id: objByClass[j].getAttribute("id"), className: className[i], action: action, time_start: this.time_start }));
							}
						}
					}
				}
			}			
		},
		inArray: function (needle, haystack) {

		    var key = '';

	        for (key in haystack) {
	            if (haystack[key] === needle) {
	                return true;
	            }
	        }

		    return false;
		},
		addEvent: function (target, eventType, handler) {
			
			if (target.addEventListener) { // WC3
				this.addEvent = function (target, eventType, handler) {
					target.addEventListener(eventType, handler, false);
				};
			} else { // IE
				this.addEvent = function (target, eventType, handler) {
					target.attachEvent("on" + eventType, handler);
				};				
			}
			this.addEvent(target, eventType, handler);
		},
		getElementsByClass: function (searchClass, node, tag) { // adapted from Dustin Diaz; http://www.dustindiaz.com/getelementsbyclass

			var i,
				j,
				els,
				elsLen,
				pattern,
				classElements = [];
				
				node = node || document;
				tag = tag || '*';

			els = node.getElementsByTagName(tag);

			elsLen = els.length;

			pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");

			for (i = 0, j = 0; i < elsLen; i += 1) {
				if (pattern.test(els[i].className)) {
					classElements[j] = els[i];
					j += 1;
				}
			}

			return classElements;

		}					
	};
	
}());
