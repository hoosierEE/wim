function FadingTooltip(htmlElement, tooltipContent, parameters) {
    if (!htmlElement || typeof(htmlElement)!="object")
        throw "Sorry, 'htmlElement' argument of FadingTooltip should be an HTML element";
    if (!tooltipContent || typeof(tooltipContent)!="string")
        throw "Sorry, 'tooltipContent' argument of FadingTooltip should be a string containing text and HTML tags";
    if (parameters && typeof(parameters)!="object")
        throw "Sorry, 'parameters' argument of FadingTooltip should be a JSON object containing parameter values";
    for (var parameter in parameters)
        if (typeof(this[parameter])=="undefined")
            throw "Sorry, 'parameters{" + parameter + "} passed to FadingTooltip is not recognized";
    this.htmlElement = htmlElement;
    this.tooltipContent = tooltipContent;
    for (parameter in parameters) this[parameter] = parameters[parameter];
    var self = this;
    htmlElement.addEventListener("mouseover", function(event) { self.handleEvent(event); }, false);
    htmlElement.addEventListener("mousemove", function(event) { self.handleEvent(event); }, false);
    htmlElement.addEventListener("mouseout",  function(event) { self.handleEvent(event); }, false);
    this.currentState = this.initialState;
}

FadingTooltip.prototype = {
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

    handleEvent: function(event) {
        var actionTransitionFunction = this.actionTransitionFunctions[this.currentState][event.type];
        if (!actionTransitionFunction) actionTransitionFunction = this.unexpectedEvent;
        var nextState = actionTransitionFunction.call(this, event);
        if (!nextState) nextState = this.currentState;
        if (!this.actionTransitionFunctions[nextState]) nextState = this.undefinedState(event, nextState);
        this.currentState = nextState;
    },

    unexpectedEvent: function(event) {
        this.cancelTimer();
        this.cancelTicker();
        this.deleteTooltip();
        alert("FadingTooltip handled unexpected event '" + event.type + "' in state '" + this.currentState + "' for id='" +
              this.htmlElement.id + "' running browser " + window.navigator.userAgent);
        return this.initialState;
    },

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

    initialState: "Inactive",

    actionTransitionFunctions: {
        Inactive: {
            mouseover: function(event) {
                this.cancelTimer();
                this.saveCursorPosition(event.clientX, event.clientY);
                this.startTimer(this.pauseTime*1000);
                return "Pause";
            },
            mousemove: function(event) {
                return this.doActionTransition("Inactive", "mouseover", event);
            },
            mouseout: function(event) {
                return this.currentState; // do nothing
            }
        }, // end of FadingTooltip.prototype.actionTransitionFunctions.Inactive

        Pause: {
            mousemove: function(event) {
                return this.doActionTransition("Inactive", "mouseover", event);
            },
            mouseout: function(event) {
                this.cancelTimer();
                return "Inactive";
            },
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

        FadeIn: {
            mousemove: function(event) {
                return this.doActionTransition("Display", "mousemove", event);
            },
            mouseout: function(event) {
                return "FadeOut";
            },
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

        Display: {
            mousemove: function(event) {
                this.moveTooltip(event.clientX, event.clientY);
                return this.currentState;
            },
            mouseout: function(event) {
                return this.doActionTransition("Display", "timeout", event);
            },
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

        FadeOut: {
            mouseover: function(event) {
                this.moveTooltip(event.clientX, event.clientY);
                return "FadeIn";
            },
            mousemove: function(event) {
                return this.doActionTransition("Display", "mousemove", event);
            },
            mouseout: function(event) {
                return this.currentState; // do nothing
            },
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
    doActionTransition: function(anotherState, anotherEventType, event) {
         return this.actionTransitionFunctions[anotherState][anotherEventType].call(this,event);
    },
    startTimer: function(timeout) {
        var self = this;
        this.currentTimer = setTimeout(function() { self.handleEvent( { type: "timeout" } ); }, timeout);
    },
    cancelTimer: function() {
        if (this.currentTimer) clearTimeout(this.currentTimer);
        this.currentTimer = null;
    },
    startTicker: function(interval) {
        var self = this;
        this.currentTicker = setInterval(function() { self.handleEvent( { type: "timetick" } ); }, interval);
    },
    cancelTicker: function() {
        if (this.currentTicker) clearInterval(this.currentTicker);
        this.currentTicker = null;
    },
    saveCursorPosition: function(x, y) {
        this.lastCursorX = x;
        this.lastCursorY = y;
    },
    createTooltip: function() {
        this.tooltipDivision = document.createElement("div");
        this.tooltipDivision.innerHTML = this.tooltipContent;
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
        this.tooltipDivision.style.position = "absolute";
        this.tooltipDivision.style.zIndex = 101;
        this.tooltipDivision.style.left = this.lastCursorX + this.tooltipOffsetX;
        this.tooltipDivision.style.top = this.lastCursorY + this.tooltipOffsetY;
        this.currentOpacity = 0;
        this.tooltipDivision.style.opacity = 0;
        if (this.tooltipDivision.filters) this.tooltipDivision.style.filter = "alpha(opacity=0)"; // for MSIE only
        document.body.appendChild(this.tooltipDivision);
    },
    fadeTooltip: function(opacityDelta) {
        this.currentOpacity = Math.round((this.currentOpacity + opacityDelta)*1000000)/1000000;
        if (this.currentOpacity<0) this.currentOpacity = 0;
        if (this.currentOpacity>this.tooltipOpacity) this.currentOpacity = this.tooltipOpacity;
        this.tooltipDivision.style.opacity = this.currentOpacity;
        if (this.tooltipDivision.filters) this.tooltipDivision.filters.item('alpha').opacity = 100*this.currentOpacity; // for MSIE only
    },
    moveTooltip: function(x, y) {
        this.tooltipDivision.style.left = x + this.tooltipOffsetX;
        this.tooltipDivision.style.top = y + this.tooltipOffsetY;
    },
    deleteTooltip: function() {
        if (this.tooltipDivision) document.body.removeChild(this.tooltipDivision);
        this.tooltipDivision = null;
    }

}; // end of FadingTooltip.prototype
