/**
Created by seth on 4/16/15.

Usage:

 // In your HTML, define the menu like so:
 <div id="menu">
    <ul data-bind: "foreach: menuItems">
        <li data-bind="click: func">
            <i data-bind="css: iconCls"></i>
            <span data-bind="text: name"></span>
        </li>
    </ul>
 </div>

// Then define a trigger button
 <span data-bind="with: myAwesomeObject">
     <button data-bind="click: $root.menu('thing', thing)">Show Thing Menu</button>
 </span>


function doCopyThing(thing) {
   // thing.copy(...)
}
function doPasteThing(thing) {
    // thing.paste(...)
 }

 var menus = {
    // Define a context menu for "thing" objects.
    'thing': [
        new DropdownMenus.Item("Copy", doCopyThing, thing, "fa fa-copy"),
        new DropdownMenus.Item("Paste", doPasteThing, thing, "fa fa-paste"),
        ...
    ],
    'somethingElse': [
        ...
    ]
 }

  DropdownMenus.init(menus, document.querySelector("#menu");

 */



(function(window) {
    if (!ko) {
        console.error("DropdownMenu: Knockout not found.");
        return false;
    }

    function MenuParams(menuKind, callbackObject) {
        this.menuKind = menuKind;
        this.callbackObject = callbackObject;
    }

    function MenuItem(name, callbackFunction, iconCls, object) {
        this.name = name;
        this.callback = callbackFunction;
        this.iconCls = iconCls;
        this.object = object;
    }

    /** Return a function that calls the user's callback, and then runs our
     * internal finished() function to close the menu.
     */
    MenuItem.prototype._wrapped_callback = function(finished_fn) {
        return function(params, event) {
            try {
                return this.callback(params.object, event)
            }
            finally {
                finished_fn(event);
            }
        }
    }

    MenuItem.prototype.get = function(object, finished_fn) {
        return {
            name: this.name,
            func: this._wrapped_callback(finished_fn).bind(this),
            iconCls: this.iconCls,
            object: object || this.object
        }
    };

    function MenuModel(menuActions, element) {
        this.menuActions = menuActions;
        this.menuElement = element;
        this.menuItems = ko.observableArray();
        this.offx = 0;
        this.offy = 0;

        var closure = this;
        this._closeMenu = function(e) {
            if (e.type == 'keyup' && e.keyCode != 27) {
                return;
            }
            if (closure.menuElement.contains(e.target)) {
                return;
            }
            closure.menuElement.removeAttribute('style');
            window.removeEventListener('mousedown', closure._closeMenu);
            window.removeEventListener('keyup', closure._closeMenu);
            console.error('fired', count++);
        };
    }

    /** Return a function that shows a menu at the current mouse position */
    MenuModel.prototype.menu = function(kind) {
        return function(params, event) {
            console.info("OPEN MENU", arguments);

            this.menuItems.removeAll();
            for (var i = 0; i < this.menuActions[kind].length; i++) {
                var menuItem = this.menuActions[kind][i].get(params, this._closeMenu);
                this.menuItems.push(menuItem);
            }

            this._positionMenu(event);
        }.bind(this);
    };

    /** If there are positioning issues (due to 0 height items with funny
     *  margins or something), use this function to add a correction factor
     *  (in pixels) to the positioning.
     */
    MenuModel.prototype.setCorrectionOffset = function(pxOffsetX, pxOffsetY) {
        this.offx = pxOffsetX;
        this.offy = pxOffsetY;
    }

    MenuModel.prototype._positionMenu = function(event) {
        this.menuElement.style.display = 'block';
        var width = this.menuElement.clientWidth;
        var height = this.menuElement.clientHeight;
        var left = event.pageX;
        var top = event.pageY;

        left += this.offx;
        top += this.offy;


        // if we're beyond the right edge of the screen, display the
        // menu to the left of the cursor
        if (left + width > document.body.clientWidth) {
            left -= width;
        }
        // if we're below the bottom edge of the screen, display the
        // menu above the cursor
        if (top + height > document.body.clientHeight) {
            top -= height;
        }

        // Add a self-destructing event listener to close the menu on mouse down
        window.addEventListener('mousedown', this._closeMenu);
        window.addEventListener('keyup', this._closeMenu);

        this.menuElement.style.left = left + 'px';
        this.menuElement.style.top = top + 'px';
        this.menuElement.style.zIndex = 111111;
    }

    var count = 0;

    function initDropdownMenus(menuActions, element) {
        if (!element) {
            console.error("'element' is null");
            return false;
        }

        ko.applyBindings(new MenuModel(menuActions, element));
    }

    window.ContextualMenu = {
        Item: MenuItem,
        Init: initDropdownMenus,
        Model: MenuModel
    }
})(window);