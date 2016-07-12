//(function() {
import Ext from '../Base';
import EventManager from '../EventManager';
import DDM from './DragDropMgr';

var Event=EventManager;
var Dom=Ext.lib.Dom;

var DragDrop = function(id, sGroup, config) {
    if(id) {
        this.init(id, sGroup, config);
    }
};

DragDrop.prototype = {
    
    id: null,

    
    config: null,

    
    dragElId: null,

    
    handleElId: null,

    
    invalidHandleTypes: null,

    
    invalidHandleIds: null,

    
    invalidHandleClasses: null,

    
    startPageX: 0,

    
    startPageY: 0,

    
    groups: null,

    
    locked: false,

    
    lock: function() {
        this.locked = true;
    },

    
    moveOnly: false,

    
    unlock: function() {
        this.locked = false;
    },

    
    isTarget: true,

    
    padding: null,

    
    _domRef: null,

    
    __ygDragDrop: true,

    
    constrainX: false,

    
    constrainY: false,

    
    minX: 0,

    
    maxX: 0,

    
    minY: 0,

    
    maxY: 0,

    
    maintainOffset: false,

    
    xTicks: null,

    
    yTicks: null,

    
    primaryButtonOnly: true,

    
    available: false,

    
    hasOuterHandles: false,

    
    b4StartDrag: function(x, y) { },

    
    startDrag: function(x, y) {  },

    
    b4Drag: function(e) { },

    
    onDrag: function(e) {  },

    
    onDragEnter: function(e, id) {  },

    
    b4DragOver: function(e) { },

    
    onDragOver: function(e, id) {  },

    
    b4DragOut: function(e) { },

    
    onDragOut: function(e, id) {  },

    
    b4DragDrop: function(e) { },

    
    onDragDrop: function(e, id) {  },

    
    onInvalidDrop: function(e) {  },

    
    b4EndDrag: function(e) { },

    
    endDrag: function(e) {  },

    
    b4MouseDown: function(e) {  },

    
    onMouseDown: function(e) {  },

    
    onMouseUp: function(e) {  },

    
    onAvailable: function () {
    },

    
    defaultPadding : {left:0, right:0, top:0, bottom:0},

    
    constrainTo : function(constrainTo, pad, inContent){
        if(Ext.isNumber(pad)){
            pad = {left: pad, right:pad, top:pad, bottom:pad};
        }
        pad = pad || this.defaultPadding;
        var b = Ext.get(this.getEl()).getBox(),
            ce = Ext.get(constrainTo),
            s = ce.getScroll(),
            c, 
            cd = ce.dom;
        if(cd == document.body){
            c = { x: s.left, y: s.top, width: Ext.lib.Dom.getViewWidth(), height: Ext.lib.Dom.getViewHeight()};
        }else{
            var xy = ce.getXY();
            c = {x : xy[0], y: xy[1], width: cd.clientWidth, height: cd.clientHeight};
        }


        var topSpace = b.y - c.y,
            leftSpace = b.x - c.x;

        this.resetConstraints();
        this.setXConstraint(leftSpace - (pad.left||0), 
                c.width - leftSpace - b.width - (pad.right||0), 
				this.xTickSize
        );
        this.setYConstraint(topSpace - (pad.top||0), 
                c.height - topSpace - b.height - (pad.bottom||0), 
				this.yTickSize
        );
    },

    
    getEl: function() {
        if (!this._domRef) {
            this._domRef = Ext.getDom(this.id);
        }

        return this._domRef;
    },

    
    getDragEl: function() {
        return Ext.getDom(this.dragElId);
    },

    
    init: function(id, sGroup, config) {
        this.initTarget(id, sGroup, config);
        Event.on(this.id, "mousedown", this.handleMouseDown, this);
        
    },

    
    initTarget: function(id, sGroup, config) {

        
        this.config = config || {};

        
        this.DDM = DDM;
        
        this.groups = {};

        
        
        if (typeof id !== "string") {
            id = Ext.id(id);
        }

        
        this.id = id;

        
        this.addToGroup((sGroup) ? sGroup : "default");

        
        
        this.handleElId = id;

        
        this.setDragElId(id);

        
        this.invalidHandleTypes = { A: "A" };
        this.invalidHandleIds = {};
        this.invalidHandleClasses = [];

        this.applyConfig();

        this.handleOnAvailable();
    },

    
    applyConfig: function() {

        
        
        this.padding           = this.config.padding || [0, 0, 0, 0];
        this.isTarget          = (this.config.isTarget !== false);
        this.maintainOffset    = (this.config.maintainOffset);
        this.primaryButtonOnly = (this.config.primaryButtonOnly !== false);

    },

    
    handleOnAvailable: function() {
        this.available = true;
        this.resetConstraints();
        this.onAvailable();
    },

     
    setPadding: function(iTop, iRight, iBot, iLeft) {
        
        if (!iRight && 0 !== iRight) {
            this.padding = [iTop, iTop, iTop, iTop];
        } else if (!iBot && 0 !== iBot) {
            this.padding = [iTop, iRight, iTop, iRight];
        } else {
            this.padding = [iTop, iRight, iBot, iLeft];
        }
    },

    
    setInitPosition: function(diffX, diffY) {
        var el = this.getEl();

        if (!this.DDM.verifyEl(el)) {
            return;
        }

        var dx = diffX || 0;
        var dy = diffY || 0;

        var p = Dom.getXY( el );

        this.initPageX = p[0] - dx;
        this.initPageY = p[1] - dy;

        this.lastPageX = p[0];
        this.lastPageY = p[1];

        this.setStartPosition(p);
    },

    
    setStartPosition: function(pos) {
        var p = pos || Dom.getXY( this.getEl() );
        this.deltaSetXY = null;

        this.startPageX = p[0];
        this.startPageY = p[1];
    },

    
    addToGroup: function(sGroup) {
        this.groups[sGroup] = true;
        this.DDM.regDragDrop(this, sGroup);
    },

    
    removeFromGroup: function(sGroup) {
        if (this.groups[sGroup]) {
            delete this.groups[sGroup];
        }

        this.DDM.removeDDFromGroup(this, sGroup);
    },

    
    setDragElId: function(id) {
        this.dragElId = id;
    },

    
    setHandleElId: function(id) {
        if (typeof id !== "string") {
            id = Ext.id(id);
        }
        this.handleElId = id;
        this.DDM.regHandle(this.id, id);
    },

    
    setOuterHandleElId: function(id) {
        if (typeof id !== "string") {
            id = Ext.id(id);
        }
        Event.on(id, "mousedown",
                this.handleMouseDown, this);
        this.setHandleElId(id);

        this.hasOuterHandles = true;
    },

    
    unreg: function() {
        Event.un(this.id, "mousedown",
                this.handleMouseDown);
        this._domRef = null;
        this.DDM._remove(this);
    },

    destroy : function(){
        this.unreg();
    },

    
    isLocked: function() {
        return (this.DDM.isLocked() || this.locked);
    },

    
    handleMouseDown: function(e, oDD){
        if (this.primaryButtonOnly && e.button != 0) {
            return;
        }

        if (this.isLocked()) {
            return;
        }

        this.DDM.refreshCache(this.groups);

        var pt = new Ext.lib.Point(Ext.lib.Event.getPageX(e), Ext.lib.Event.getPageY(e));
        if (!this.hasOuterHandles && !this.DDM.isOverTarget(pt, this) )  {
        } else {
            if (this.clickValidator(e)) {

                
                this.setStartPosition();

                this.b4MouseDown(e);
                this.onMouseDown(e);

                this.DDM.handleMouseDown(e, this);

                this.DDM.stopEvent(e);
            } else {


            }
        }
    },

    clickValidator: function(e) {
        var target = e.getTarget();
        return ( this.isValidHandleChild(target) &&
                    (this.id == this.handleElId ||
                        this.DDM.handleWasClicked(target, this.id)) );
    },

    
    addInvalidHandleType: function(tagName) {
        var type = tagName.toUpperCase();
        this.invalidHandleTypes[type] = type;
    },

    
    addInvalidHandleId: function(id) {
        if (typeof id !== "string") {
            id = Ext.id(id);
        }
        this.invalidHandleIds[id] = id;
    },

    
    addInvalidHandleClass: function(cssClass) {
        this.invalidHandleClasses.push(cssClass);
    },

    
    removeInvalidHandleType: function(tagName) {
        var type = tagName.toUpperCase();
        
        delete this.invalidHandleTypes[type];
    },

    
    removeInvalidHandleId: function(id) {
        if (typeof id !== "string") {
            id = Ext.id(id);
        }
        delete this.invalidHandleIds[id];
    },

    
    removeInvalidHandleClass: function(cssClass) {
        for (var i=0, len=this.invalidHandleClasses.length; i<len; ++i) {
            if (this.invalidHandleClasses[i] == cssClass) {
                delete this.invalidHandleClasses[i];
            }
        }
    },

    
    isValidHandleChild: function(node) {

        var valid = true;
        
        var nodeName;
        try {
            nodeName = node.nodeName.toUpperCase();
        } catch(e) {
            nodeName = node.nodeName;
        }
        valid = valid && !this.invalidHandleTypes[nodeName];
        valid = valid && !this.invalidHandleIds[node.id];

        for (var i=0, len=this.invalidHandleClasses.length; valid && i<len; ++i) {
            valid = !Ext.fly(node).hasClass(this.invalidHandleClasses[i]);
        }


        return valid;

    },

    
    setXTicks: function(iStartX, iTickSize) {
        this.xTicks = [];
        this.xTickSize = iTickSize;

        var tickMap = {};

        for (var i = this.initPageX; i >= this.minX; i = i - iTickSize) {
            if (!tickMap[i]) {
                this.xTicks[this.xTicks.length] = i;
                tickMap[i] = true;
            }
        }

        for (i = this.initPageX; i <= this.maxX; i = i + iTickSize) {
            if (!tickMap[i]) {
                this.xTicks[this.xTicks.length] = i;
                tickMap[i] = true;
            }
        }

        this.xTicks.sort(this.DDM.numericSort) ;
    },

    
    setYTicks: function(iStartY, iTickSize) {
        this.yTicks = [];
        this.yTickSize = iTickSize;

        var tickMap = {};

        for (var i = this.initPageY; i >= this.minY; i = i - iTickSize) {
            if (!tickMap[i]) {
                this.yTicks[this.yTicks.length] = i;
                tickMap[i] = true;
            }
        }

        for (i = this.initPageY; i <= this.maxY; i = i + iTickSize) {
            if (!tickMap[i]) {
                this.yTicks[this.yTicks.length] = i;
                tickMap[i] = true;
            }
        }

        this.yTicks.sort(this.DDM.numericSort) ;
    },

    
    setXConstraint: function(iLeft, iRight, iTickSize) {
        this.leftConstraint = iLeft;
        this.rightConstraint = iRight;

        this.minX = this.initPageX - iLeft;
        this.maxX = this.initPageX + iRight;
        if (iTickSize) { this.setXTicks(this.initPageX, iTickSize); }

        this.constrainX = true;
    },

    
    clearConstraints: function() {
        this.constrainX = false;
        this.constrainY = false;
        this.clearTicks();
    },

    
    clearTicks: function() {
        this.xTicks = null;
        this.yTicks = null;
        this.xTickSize = 0;
        this.yTickSize = 0;
    },

    
    setYConstraint: function(iUp, iDown, iTickSize) {
        this.topConstraint = iUp;
        this.bottomConstraint = iDown;

        this.minY = this.initPageY - iUp;
        this.maxY = this.initPageY + iDown;
        if (iTickSize) { this.setYTicks(this.initPageY, iTickSize); }

        this.constrainY = true;

    },

    
    resetConstraints: function() {
        
        if (this.initPageX || this.initPageX === 0) {
            
            var dx = (this.maintainOffset) ? this.lastPageX - this.initPageX : 0;
            var dy = (this.maintainOffset) ? this.lastPageY - this.initPageY : 0;

            this.setInitPosition(dx, dy);

        
        } else {
            this.setInitPosition();
        }

        if (this.constrainX) {
            this.setXConstraint( this.leftConstraint,
                                 this.rightConstraint,
                                 this.xTickSize        );
        }

        if (this.constrainY) {
            this.setYConstraint( this.topConstraint,
                                 this.bottomConstraint,
                                 this.yTickSize         );
        }
    },

    
    getTick: function(val, tickArray) {
        if (!tickArray) {
            
            
            return val;
        } else if (tickArray[0] >= val) {
            
            
            return tickArray[0];
        } else {
            for (var i=0, len=tickArray.length; i<len; ++i) {
                var next = i + 1;
                if (tickArray[next] && tickArray[next] >= val) {
                    var diff1 = val - tickArray[i];
                    var diff2 = tickArray[next] - val;
                    return (diff2 > diff1) ? tickArray[i] : tickArray[next];
                }
            }

            
            
            return tickArray[tickArray.length - 1];
        }
    },

    
    toString: function() {
        return ("DragDrop " + this.id);
    }

};
export default DragDrop;
//})();
