//    Finite state machines in JavaScript, Part 1: Designing a widget
//    http://www.ibm.com/developerworks/library/wa-finitemach1/
// The constructor for the FadingTooltip object creates and initializes an object
// instance.  The constructor's arguments are:
//
//     'htmlElement' is a required pointer to an HTML element.  A tooltip will be
//     displayed when the cursor pauses over this HTML element.
//
//     'tooltipContent' is a required string containing the text and HTML tags to
//     be displayed in the tooltip.
//
//     'parameters' is an optional JSON object containing zero or more parameter
//     values that determine how the tooltip will behave.  The parameter names
//     and default values are listed below.
//
//     'this' points to the new FadingTooltip object instance
//
// The constructor throws an exception if any of these arguments are invalid.  It
// implicitly returns a pointer to the new object instance.

function FadingTooltip(htmlElement, tooltipContent, parameters) {
    // Do some basic validation of the constructor's required arguments, and
    // throw an exception if any are obviously invalid.  There is obviously
    // room for more rigorous validation here.
    if (!htmlElement || typeof(htmlElement)!="object")
        throw "Sorry, 'htmlElement' argument of FadingTooltip should be an HTML element";
    if (!tooltipContent || typeof(tooltipContent)!="string")
        throw "Sorry, 'tooltipContent' argument of FadingTooltip should be a string containing text and HTML tags";

    // If the constructor's optional argument is specified, make sure that
    // all of its properties are defined in the object prototype, or throw
    // an exception.  Again, this could certainly be more rigorous.
    if (parameters && typeof(parameters)!="object")
    { throw "Sorry, 'parameters' argument of FadingTooltip should be a JSON object containing parameter values"; }
    for (var parameter in parameters) {
        if (typeof(this[parameter])=="undefined")
            throw "Sorry, 'parameters{" + parameter + "} passed to FadingTooltip is not recognized";
    }

    // Save the constructor's argument values in the new object instance.
    this.htmlElement = htmlElement;
    this.tooltipContent = tooltipContent;
    for (parameter in parameters) this[parameter] = parameters[parameter];
    var self = this;
    if (htmlElement.addEventListener) { // for FF and NS and Opera
        htmlElement.addEventListener("mouseover", function(event) { self.handleEvent(event); }, false);
        htmlElement.addEventListener("mousemove", function(event) { self.handleEvent(event); }, false);
        htmlElement.addEventListener("mouseout",  function(event) { self.handleEvent(event); }, false);
    }
    else if (htmlElement.attachEvent) { // for MSIE
        htmlElement.attachEvent("onmouseover", function() { self.handleEvent(window.event); } );
        htmlElement.attachEvent("onmousemove", function() { self.handleEvent(window.event); } );
        htmlElement.attachEvent("onmouseout",  function() { self.handleEvent(window.event); } );
    }
    else { // for older browsers
        var previousOnmouseover = htmlElement.onmouseover;
        htmlElement.onmouseover = function(event) {
            self.handleEvent(event ? event : window.event);
            if (previousOnmouseover) {
                htmlElement.previousHandler = previousOnmouseover;
                htmlElement.previousHandler(event ? event : window.event);
            }
        };
        var previousOnmousemove = htmlElement.onmousemove;
        htmlElement.onmousemove = function(event) {
            self.handleEvent(event ? event : window.event);
            if (previousOnmousemove) {
                htmlElement.previousHandler = previousOnmousemove;
                htmlElement.previousHandler(event ? event : window.event);
            }
        };
        var previousOnmouseout = htmlElement.onmouseout;
        htmlElement.onmouseout  = function(event) {
            self.handleEvent(event ? event : window.event);
            if (previousOnmouseout) {
                htmlElement.previousHandler = previousOnmouseout;
                htmlElement.previousHandler(event ? event : window.event);
            }
        };
    }

    // Set the initial state of the finite state machine.
    this.currentState = this.initialState;
}

// The prototype for the FadingTooltip object defines the properties of
// object instances, that is, the variables and methods of the object.  This
// includes the optional parameters of the object constructor (and their
// default values), the object's state variables, the table of
// action/transition functions, and a collection of private methods.

FadingTooltip.prototype = {

    // Any optional parameters of the constructor will be saved in these properties
    // of the object, otherwise the default values defined in the prototype will be
    // used.

    tooltipClass: null, // name of a CSS style for rendering the tooltip, or 'null' for default style below
    tooltipOpacity: 0.8, // maximum opacity of tooltip, between 0.0 and 1.0 (after fade-in finishes, before fade-out begins)
    tooltipOffsetX: 10, // horizontal offset from cursor to upper-left corner of tooltip
    tooltipOffsetY: 10, // vertical offset from cursor to upper-left corner of tooltip
    fadeRate: 24, // animation rate for fade-in and fade-out, in steps per second
    pauseTime: 0.5, // how long the cursor must pause over HTML element before fade-in starts, in seconds
    displayTime: 10, // how long the tooltip will be displayed (after fade-in finishes, before fade-out begins), in seconds
    fadeinTime: 1, // how long fade-in animation will take, in seconds
    fadeoutTime: 3, // how long fade-out animation will take, in seconds

    // These are state variables used by the finite state machine's
    // action/transition functions (see the 'actionTransitionTable' and
    // utility functions defined below).

    currentState: null, // current state of finite state machine (one of 'actionTransitionFunctions' properties)
    currentTimer: null, // returned by setTimeout, if a timer is currently running
    currentTicker: null, // returned by setInterval, if a ticker is currently running
    currentOpacity: 0, // current opacity of tooltip, between 0.0 and 'tooltipOpacity'
    tooltipDivision: null, // pointer to HTML Division element, if tooltip is currently visible
    lastCursorX: 0, // cursor x-position at most recent mouse event
    lastCursorY: 0, // cursor y-position at most recent mouse event
    trace: false, // trace execution points that may be helpful for debugging, if set to 'true'

    // The 'handleEvent' method handles mouse and timer events as appropriate for
    // the current state of the finite state machine.  The required 'event' argument
    // is an object that has (at least) a 'type' property whose value corresponds to
    // one of the event types in the current state's column of the
    // 'actionTransitionFunctions' table.  For mouse events, it must also have
    // 'clientX' and 'clientY' properties that specify the location of the cursor.
    // This method will select the appropriate action/transition function from the
    // table and call it, passing on the 'event' argument. Note that the
    // action/transition function is invoked via the 'call' method of its Function
    // object, which allows us to set the context for the function so that the
    // built-in variable 'this' will point at the FadingTooltip object.  If we
    // were to call the function directly from the 'actionTransitionFunctions' table,
    // the 'this' variable would point into the table.  The action/transition function
    // returns a new state, which this method will store as current state of the finite
    // state machine.  This method does not return a value.

    handleEvent: function(event) {
        var actionTransitionFunction = this.actionTransitionFunctions[this.currentState][event.type];
        if (!actionTransitionFunction) actionTransitionFunction = this.unexpectedEvent;
        var nextState = actionTransitionFunction.call(this, event);
        if (!nextState) nextState = this.currentState;
        if (!this.actionTransitionFunctions[nextState]) nextState = this.undefinedState(event, nextState);
        this.currentState = nextState;
    },

    // The 'unexpectedEvent' method is called by the 'handleEvent' method when the
    // 'actionTransitionFunctions' table does not contain a function for the current
    // event and state.  The required 'event' argument is an object, but only its
    // 'type' property is required.  The method cancels any active timers, deletes
    // the tooltip, if one has been created, and returns the finite state machine's
    // initial state.  The unexpected event and state are shown in an "alert" dialog
    // to the user, who will hopefully send a problem report to the author of this code.

    unexpectedEvent: function(event) {
        this.cancelTimer();
        this.cancelTicker();
        this.deleteTooltip();
        alert("FadingTooltip handled unexpected event '" + event.type + "' in state '" + this.currentState + "' for id='" + this.htmlElement.id + "' running browser " + window.navigator.userAgent);
        return this.initialState;
    },

    // The 'undefinedState' method is called by the 'handleEvent' method when the
    // 'actionTransitionFunctions' table does not contain a column for the next
    // state returned by the selected function.  The required 'state' argument is
    // the name of the undefined state.  The method cancels any active timers, deletes
    // the tooltip, if one has been created, and returns the finite state machine's
    // initial state.  The undefind state is shown in an "alert" dialog to the user,
    // who will hopefully send a problem report to the author of this code.

    undefinedState: function(event, state) {
        this.cancelTimer();
        this.cancelTicker();
        this.deleteTooltip();
        alert("FadingTooltip transitioned to undefined state '" + state +
              "' from state '" + this.currentState + "' due to event '" + event.type +
              "' from HTML element id='" + this.htmlElement.id + "' running browser " +
              window.navigator.userAgent);
        return this.initialState;
    },

    // The 'initialState' constant specifies the initial state of the finite state
    // machine, which must match one of the state names in the
    // 'actionTransitionFunctions' table below.

    initialState: "Inactive",

    // The 'actionTransitionFunctions' table is a two-dimensional associative array
    // of anonymous functions, or, if you prefer, an object containing more objects
    // containing anonymous functions.  The first dimension of the array (the outer
    // object) is indexed by state names; the second dimension of the array (the
    // inner objects) is indexed by event types.  When a mouse or timer event hander
    // calls the 'handleEvent' method, it calls the appropriate function from the table,
    // passing an 'event' object as an argument, ensuring that 'this' points at the
    // FadingTooltip object.  The selected function takes whatever actions are
    // required for that event in the current state, and returns either the name of
    // a new state, if a state transition is needed, or 'null' if not.  See the design
    // documentation, in particular the state diagram and table, for details.  Note that
    // the array is sparse: state/event combinations that 'should not occur' are
    // empty.  If an event does occur in a state that does not expect it, the
    // 'unexpectedEvent' method will be called.

    actionTransitionFunctions: {

        // The 'Inactive' column of the 'actionTransitionFunctions' table contains a
        // function for each mouse and timer event that is expected in this state.
        Inactive: {
            // When a 'mouseover' event occurs in 'Inactive' state, save the current
            // location of the cursor, [re-]start the pause timer, and transition to
            // 'Pause' state.  Note that this function is also executed for 'mouseover'
            // events in 'Pause' state, and 'mousemove' events in 'Inactive' state,
            // since all of the same actions, and the same transition, are appropriate
            // for them.
            mouseover: function(event) {
                this.cancelTimer();
                this.saveCursorPosition(event.clientX, event.clientY);
                this.startTimer(this.pauseTime*1000);
                return "Pause";
            },
            // When a 'mousemove' event occurs in 'Inactive' state, take the same
            // actions, and make the same state transition, as for 'mouseover'
            // events in 'Inactive' state.  Note that this state/event situation
            // was not anticipated in the initial design of the finite state machine;
            // this function was added when it occurred unexpectedly during testing.
            // With MSIE, this often happens as soon as the mouse moves over the HTML element,
            // before any 'mouseover' event occurs, presumably because of a bug in the
            // browser.  With FF and NN, this can also happen if the mouse remains over
            // the HTML element after the tooltip has been displayed and faded out, and
            // the mouse then moves within the HTML element.
            mousemove: function(event) {
                return this.doActionTransition("Inactive", "mouseover", event);
            },
            // When a 'mouseout' event occurs in 'Inactive' state, just ignore the event:
            // take no action and make no state transition.  Note that this state/event
            // situation was not anticipated in the initial design; this function was added
            // when it occurred unexpectedly during testing.  With MSIE, this may happen
            // when the mouse crosses the HTML element, without any 'mouseover' event,
            // presumably because of a bug in the browser.  With FF and NN, this can also
            // happen if the mouse remains over the HTML element after the tooltip has been
            // displayed and faded out, and the mouse then moves off the HTML element.
            mouseout: function(event) {
                return this.currentState; // do nothing
            }
        }, // end of FadingTooltip.prototype.actionTransitionFunctions.Inactive

        // The 'Pause' column of the 'actionTransitionFunctions' table contains a
        // function for each mouse and timer event that is expected in this state.
        Pause: {
            // When a 'mousemove' event occurs in 'Pause' state, take the same
            // actions, and make the same state transition, as for 'mouseover'
            // events in 'Inactive' state.
            mousemove: function(event) {
                return this.doActionTransition("Inactive", "mouseover", event);
            },
            // When a 'mouseout' event occurs in 'Pause' state, just cancel the
            // timer and return to 'Inactive' state.  Since tooltip has been created
            // yet, there is nothing more to do.
            mouseout: function(event) {
                this.cancelTimer();
                return "Inactive";
            },
            // When a 'timeout' event occurs in 'Pause' state, create the
            // tooltip (with an initial opacity of zero).  In the normal case,
            // when the fade-in time is non-zero, start the animation ticker and
            // transition to 'FadeIn' state.  But when the fade-in time is zero,
            // skip the fade animation (to avoid dividing by zero when 'timetick'
            // events occur in 'FadeIn' state), and transition directly to 'Display'
            // state (after increasing the tooltip opacity to its maximum value and
            // setting the display timer).
            timeout: function(event) {
                this.cancelTimer();
                this.createTooltip();
                if (this.fadeinTime>0) {
                    this.startTicker(1000/this.fadeRate);
                    return "FadeIn";
                } else {
                    this.fadeTooltip(+this.tooltipOpacity);
                    this.startTimer(this.displayTime*1000);
                    return "Display";
                }
            }
        }, // end of FadingTooltip.prototype.actionTransitionFunctions.Pause

        // The 'FadeIn' column of the 'actionTransitionFunctions' table contains a
        // function for each mouse and timer event that is expected in this state.
        FadeIn: {
            // When a 'mousemove' event occurs in 'FadeIn' state, take the same
            // actions as for 'mousemove' events in 'Display' state.  Note that no
            // state transition occurs; the finite state machine remains in its
            // current state.
            mousemove: function(event) {
                return this.doActionTransition("Display", "mousemove", event);
            },
            // When a 'mouseout' event occurs in 'FadeIn' state, just transition
            // to 'FadeOut' state.  Leave the animation ticker running; subsequent
            // 'timetick' events in 'FadeOut' state will cause the fade animation to
            // reverse direction at the current tooltip opacity.
            mouseout: function(event) {
                return "FadeOut";
            },
            // When a 'timetick' event occurs in 'FadeIn' state, increase the
            // opacity of the tooltip slightly (such that opacity increases from zero
            // to the specified maximum in equal increments over the specified fade-in
            // time at the specified animation rate).  When tooltip opacity reaches the
            // specified maximum, cancel the ticker, start the display timer, and
            // transition to 'Display' state.
            timetick: function(event) {
                this.fadeTooltip(+this.tooltipOpacity/(this.fadeinTime*this.fadeRate));
                if (this.currentOpacity>=this.tooltipOpacity) {
                    this.cancelTicker();
                    this.startTimer(this.displayTime*1000);
                    return "Display";
                }
                return this.CurrentState;
            }
        }, // end of FadingTooltip.prototype.actionTransitionFunctions.FadeIn

        // The 'Display' column of the 'actionTransitionFunctions' table contains a
        // function for each mouse and timer event that is expected in this state.
        Display: {
            // When a 'mousemove' event occurs in 'Display' state, move the tooltip
            // to the current cursor location, and leave the finite state machine in
            // its current state.
            mousemove: function(event) {
                this.moveTooltip(event.clientX, event.clientY);
                return this.currentState;
            },
            // When a 'mouseout' event occurs in 'Display' state, take the same
            // actions, and make the same state transitions, as for 'timeout'
            // events in 'Display' state.
            mouseout: function(event) {
                return this.doActionTransition("Display", "timeout", event);
            },
            // When a 'timeout' event occurs in 'Display' state, in the normal case,
            // (when the fade-out time is non-zero), start the animation ticker and
            // transition to 'FadeOut' state.  But when the fade-out time is zero,
            // skip the fade animation (to avoid dividing by zero when 'timetick'
            // events occur in 'FadeOut' state), and transition directly to 'Inactive'
            // state (after deleting the tooltip).
            timeout: function(event) {
                this.cancelTimer();
                if (this.fadeoutTime>0) {
                    this.startTicker(1000/this.fadeRate);
                    return "FadeOut";
                } else {
                    this.deleteTooltip();
                    return "Inactive";
                }
            }
        }, // end of FadingTooltip.prototype.actionTransitionFunctions.Display

        // The 'FadeOut' column of the 'actionTransitionFunctions' table contains a
        // function for each mouse and timer event that is expected in this state.
        FadeOut: {
            // When a 'mouseover' event occurs in 'FadeOut' state, move the tooltip
            // to the current cursor location, and transition back to 'FadeIn' state.
            // Leave the animation ticker running; subsequent 'timetick' events in
            // 'FadeIn' state will cause the fade animation to reverse direction at
            // the current tooltip opacity.
            mouseover: function(event) {
                this.moveTooltip(event.clientX, event.clientY);
                return "FadeIn";
            },
            // When a 'mousemove' event occurs in 'FadeOut' state, take the same
            // actions as for 'mousemove' events in 'Display' state.  Note that no
            // state transition occurs; the finite state machine remains in the
            // current state.
            mousemove: function(event) {
                return this.doActionTransition("Display", "mousemove", event);
            },
            mouseout: function(event) {
                return this.currentState; // do nothing
            },
            // When a 'timetick' event occurs in 'FadeOut' state, decrease the
            // opacity of the tooltip slightly (such that opacity decreases from the
            // specified maximum to zero in equal increments over the specified fade-out
            // time at the specified animation rate).  When tooltip opacity reaches zero,
            // cancel the ticker, delete the tooltip, and transition to 'Inactive' state.
            timetick: function(event) {
                this.fadeTooltip(-this.tooltipOpacity/(this.fadeoutTime*this.fadeRate));
                if (this.currentOpacity<=0) {
                    this.cancelTicker();
                    this.deleteTooltip();
                    return "Inactive";
                }
                return this.currentState;
            }
        } // end of FadingTooltip.prototype.actionTransitionFunctions.FadeOut
    }, // end of FadingTooltip.prototype.actionTransitionFunctions

    // The 'doActionTransition' method is used in the 'actionTransitionFunctions'
    // table when one function takes exactly the same actions as another function
    // in the table.  It selects another function from the table, using the required
    // 'anotherState' and 'anotherEventType' arguments, and calls that function, passing
    // on the required 'event' argument, and then returning its return value.  As with
    // the 'handleEvent' method, the function is called via the 'call' method of its
    // Function object, which allows us to set its context so that the build-in 'this'
    // variable will point to the FadingTooltip object while the function executes.

    doActionTransition: function(anotherState, anotherEventType, event) {
         return this.actionTransitionFunctions[anotherState][anotherEventType].call(this,event);
    },

    // The 'startTimer' method starts a one-shot timer.  The required 'timeout'
    // argument specifies the duration of the timer in milliseconds.  The
    // method defines an anonymous function for the timeout event handler.
    // When the browser calls timer event handlers, 'this' points at the
    // global window object.  Therefore, a pointer to the FadeTooltip object
    // is copied to the 'self' local variable and enclosed with the anonymous
    // function definition so that the timeout event handler can locate the
    // object when it is called.  The browser does not pass any arguments to
    // timer event handlers, so the timeout event handler creates a simple
    // "timer event" object containing only a 'type' property, and passes
    // it to the 'handleEvent' method (defined above).  So, when the
    // 'handleEvent' method executes, 'this' will point at the FadingTooltip
    // object, and the 'type' property of its 'event' argument will identify
    // it as a 'timeout' event.  The opaque reference to a timer object (returned
    // by the browser when any timer is started) is saved as a state variable
    // so that the timer can be cancelled prematurely, if necessary.  This method
    // does not return a value.

    startTimer: function(timeout) {
        var self = this;
        this.currentTimer = setTimeout(function() { self.handleEvent( { type: "timeout" } ); }, timeout);
    },

    // The 'cancelTimer' method cancels any one-shot timer that may be
    // running (or recently expired) and then removes the opaque reference to
    // to the timer object saved in the 'startTimer' method (defined above).
    // This method does not return a value.

    cancelTimer: function() {
        if (this.currentTimer) clearTimeout(this.currentTimer);
        this.currentTimer = null;
    },

    // The 'startTicker' method starts a repeating ticker.  The required
    // 'interval' argument specifies the period of the ticker in milliseconds.
    // The method defines an anonymous function for the ticker event handler.
    // When the browser calls timer event handlers, 'this' points at the
    // global window object.  Therefore, a pointer to the FadeTooltip object
    // is copied to the 'self' local variable and enclosed with the anonymous
    // function definition so that the ticker event handler can locate the
    // object when it is called.  The browser does not pass any arguments to
    // timer event handlers, so the ticker event handler creates a simple
    // 'timer event' object containing only a 'type' property, and passes
    // it to the 'handleEvent' method (defined above).  So, when the
    // 'handleEvent' method executes, 'this' will point at the FadingTooltip
    // object, and the 'type' property of its 'event' argument will identify
    // it as a 'timetick' event.  The opaque reference to a timer object (returned
    // by the browser when any timer is started) is saved as a state variable
    // so that the ticker can be cancelled when it is no longer needed.
    // This method does not return a value.

    startTicker: function(interval) {
        var self = this;
        this.currentTicker = setInterval(function() { self.handleEvent( { type: "timetick" } ); }, interval);
    },

    // The 'cancelTicker' method cancels any repeating ticker that may be
    // running, and then removes the opaque reference to the timer object
    // saved in the 'startTicker' method (defined above).  This method does
    // not return a value.

    cancelTicker: function() {
        if (this.currentTicker) clearInterval(this.currentTicker);
        this.currentTicker = null;
    },

    // The 'saveCursorPosition' method is called when the cursor position
    // changes while waiting for the cursor to pause over the HTML element.
    // The required arguments 'x' and 'y' are the current cursor
    // coordinates, which the method  It saves the so that the tooltip
    // can be positioned near it, after the cursor pauses, when the
    // 'Pause' state timer expires. This method does not return a value.

    saveCursorPosition: function(x, y) {
        this.lastCursorX = x;
        this.lastCursorY = y;
    },

    // The createTooltip' method is called when the fade-in animation is
    // about to start.  It creates a 'floating' HTML Division element for
    // the tooltip.  The tooltip is styled with a named CSS style, if one
    // is defined, or a default style if not.  In either case, the initial
    // opacity is set to zero for FF, NN, and MSIE.  This method does not
    // return a value.

    createTooltip: function() {

        // create an HTML Division element for the tooltip and load the
        // tooltip's text and HTML tags into it
        this.tooltipDivision = document.createElement("div");
        this.tooltipDivision.innerHTML = this.tooltipContent;

        // if a named CSS style has been defined, apply it to the tooltip,
        // otherwise apply some default styling
        if (this.tooltipClass) {
            this.tooltipDivision.className = this.tooltipClass;
        } else {
            this.tooltipDivision.style.minWidth = "25px";
            this.tooltipDivision.style.maxWidth = "350px";
            this.tooltipDivision.style.height = "auto";
            this.tooltipDivision.style.border = "thin solid black";
            this.tooltipDivision.style.padding = "5px";
            this.tooltipDivision.style.backgroundColor = "yellow";
        }

        // make sure that the tooltip floats over the rest of the HTML
        // elements on the page
        this.tooltipDivision.style.position = "absolute";
        this.tooltipDivision.style.zIndex = 101;

        // position the tooltip near the last known cursor coordinates
        this.tooltipDivision.style.left = this.lastCursorX + this.tooltipOffsetX;
        this.tooltipDivision.style.top = this.lastCursorY + this.tooltipOffsetY;

        // set the initial opacity of the tooltip to zero, using the proposed W3C
        // CSS3 'style' property, and, if we are running MSIE, also create an
        // 'alpha' filter with an 'opacity' property whose initial value is zero
        this.currentOpacity = 0;
        this.tooltipDivision.style.opacity = 0;
        if (this.tooltipDivision.filters) this.tooltipDivision.style.filter = "alpha(opacity=0)"; // for MSIE only

        // display the tooltip on the page
        document.body.appendChild(this.tooltipDivision);
    },

    // The 'fadeTooltip' method increases or decreases the opacity of the
    // tooltip.  The required 'opacityDelta' argument specifies the size
    // of the increase (positive values) or decrease (negative values).
    // The increase is limited to the specified maximum value; the decrease
    // is limited to zero. This method does not return a value.

    fadeTooltip: function(opacityDelta) {

        // calculate the new opacity value as a decimal fraction, rounded
        // to the nearest 0.000001 (that is, the nearest one-millionth),
        // to avoid exponential representation of very small values, which
        // are not recognized as valid values of the 'opacity' style property
        this.currentOpacity = Math.round((this.currentOpacity + opacityDelta)*1000000)/1000000;

        // make sure the new opacity value is between 0.0 and the specified
        // maximum tooltip opacity
        if (this.currentOpacity<0) this.currentOpacity = 0;
        if (this.currentOpacity>this.tooltipOpacity) this.currentOpacity = this.tooltipOpacity;

        // change the 'opacity' style property of the HTML Division element that
        // contains the tooltip text, and, if we are running MSIE, find the 'alpha'
        // filter created in 'createTooltip' (defined above) and change its 'opacity'
        // property to match, remembering that its range is 0 to 100, not 0 to 1
        this.tooltipDivision.style.opacity = this.currentOpacity;
        if (this.tooltipDivision.filters) this.tooltipDivision.filters.item('alpha').opacity = 100*this.currentOpacity; // for MSIE only
    },

    // The 'moveTooltip' method is called when the cursor position
    // changes while the tooltip is visible, whether it is fading in,
    // fully displayed, or fading out.  It moves the tooltip so that
    // it follows the movement of the cursor.  This method does not
    // return a value.

    moveTooltip: function(x, y) {
        this.tooltipDivision.style.left = x + this.tooltipOffsetX;
        this.tooltipDivision.style.top = y + this.tooltipOffsetY;
    },

    // The 'deleteTooltip' method is called after the tooltip has faded out
    // completely.  It deletes the HTML Division element.  This method does
    // not return a value.

    deleteTooltip: function() {
        if (this.tooltipDivision) document.body.removeChild(this.tooltipDivision);
        this.tooltipDivision = null;
    }

}; // end of FadingTooltip.prototype


// With MSIE and Opera, an extra 'mouseover' event sometimes occurs in 'Pause' state,
// after a previous 'mouseover' event has made the finite state machine transition
// from 'Inactive' state to 'Pause' state.  Presumably this is due to a bug in
// the browser.  For MSIE and Opera only, add an extra anonymous function to the
// 'actionTransitionTable' for this situation: when it occurs, take the same actions,
// and return the same state transition, as for a 'mouseover' event in 'Inactive' state.

if ( (window.navigator.userAgent).indexOf("MSIE")!=-1 || (window.navigator.userAgent).indexOf("Opera")!=-1 ) {
    //if (this.trace) trace("Pause/mouseover hack added to state table");
    FadingTooltip.prototype.actionTransitionFunctions.Pause.mouseover = function(event) {
        return this.doActionTransition("Inactive", "mouseover", event);
    };
}
