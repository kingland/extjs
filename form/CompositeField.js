import Ext from '../Base';
import Field from './Field';
import MixedCollection from '../util/MixedCollection';
import Container from '../Container';


var CompositeField = Ext.extend(Field, {

    
    defaultMargins: '0 5 0 0',

    
    skipLastItemMargin: true,

    
    isComposite: true,

    
    combineErrors: true,

    
    
    initComponent: function() {
        var labels = [],
            items  = this.items,
            item;

        for (var i=0, j = items.length; i < j; i++) {
            item = items[i];

            labels.push(item.fieldLabel);

            
            Ext.apply(item, this.defaults);

            
            if (!(i == j - 1 && this.skipLastItemMargin)) {
                Ext.applyIf(item, {margins: this.defaultMargins});
            }
        }

        this.fieldLabel = this.fieldLabel || this.buildLabel(labels);

        
        this.fieldErrors = new MixedCollection(true, function(item) {
            return item.field;
        });

        this.fieldErrors.on({
            scope  : this,
            add    : this.updateInvalidMark,
            remove : this.updateInvalidMark,
            replace: this.updateInvalidMark
        });

        CompositeField.superclass.initComponent.apply(this, arguments);
    },

    
    onRender: function(ct, position) {
        if (!this.el) {
            
            var innerCt = this.innerCt = new Container({
                layout  : 'hbox',
                renderTo: ct,
                items   : this.items,
                cls     : 'x-form-composite',
                defaultMargins: '0 3 0 0'
            });

            this.el = innerCt.getEl();

            var fields = innerCt.findBy(function(c) {
                return c.isFormField;
            }, this);

            
            this.items = new MixedCollection();
            this.items.addAll(fields);

            
            
            if (this.combineErrors) {
                this.eachItem(function(field) {
                    Ext.apply(field, {
                        markInvalid : this.onFieldMarkInvalid.createDelegate(this, [field], 0),
                        clearInvalid: this.onFieldClearInvalid.createDelegate(this, [field], 0)
                    });
                });
            }

            
            var l = this.el.parent().parent().child('label', true);
            if (l) {
                l.setAttribute('for', this.items.items[0].id);
            }
        }

        CompositeField.superclass.onRender.apply(this, arguments);
    },

    
    onFieldMarkInvalid: function(field, message) {
        var name  = field.getName(),
            error = {field: name, error: message};

        this.fieldErrors.replace(name, error);

        field.el.addClass(field.invalidClass);
    },

    
    onFieldClearInvalid: function(field) {
        this.fieldErrors.removeKey(field.getName());

        field.el.removeClass(field.invalidClass);
    },

    
    updateInvalidMark: function() {
        var ieStrict = Ext.isIE6 && Ext.isStrict;

        if (this.fieldErrors.length == 0) {
            this.clearInvalid();

            
            if (ieStrict) {
                this.clearInvalid.defer(50, this);
            }
        } else {
            var message = this.buildCombinedErrorMessage(this.fieldErrors.items);

            this.sortErrors();
            this.markInvalid(message);

            
            if (ieStrict) {
                this.markInvalid(message);
            }
        }
    },

    
    validateValue: function() {
        var valid = true;

        this.eachItem(function(field) {
            if (!field.isValid()) valid = false;
        });

        return valid;
    },

    
    buildCombinedErrorMessage: function(errors) {
        var combined = [],
            error;

        for (var i = 0, j = errors.length; i < j; i++) {
            error = errors[i];

            combined.push(String.format("{0}: {1}", error.field, error.error));
        }

        return combined.join("<br />");
    },

    
    sortErrors: function() {
        var fields = this.items;

        this.fieldErrors.sort("ASC", function(a, b) {
            var findByName = function(key) {
                return function(field) {
                    return field.getName() == key;
                };
            };

            var aIndex = fields.findIndexBy(findByName(a.field)),
                bIndex = fields.findIndexBy(findByName(b.field));

            return aIndex < bIndex ? -1 : 1;
        });
    },

    
    reset: function() {
        this.eachItem(function(item) {
            item.reset();
        });

        
        
        (function() {
            this.clearInvalid();
        }).defer(50, this);
    },
    
    
    clearInvalidChildren: function() {
        this.eachItem(function(item) {
            item.clearInvalid();
        });
    },

    
    buildLabel: function(segments) {
        return segments.join(", ");
    },

    
    isDirty: function(){
        
        if (this.disabled || !this.rendered) {
            return false;
        }

        var dirty = false;
        this.eachItem(function(item){
            if(item.isDirty()){
                dirty = true;
                return false;
            }
        });
        return dirty;
    },

    
    eachItem: function(fn, scope) {
        if(this.items && this.items.each){
            this.items.each(fn, scope || this);
        }
    },

    
    onResize: function(adjWidth, adjHeight, rawWidth, rawHeight) {
        var innerCt = this.innerCt;

        if (this.rendered && innerCt.rendered) {
            innerCt.setSize(adjWidth, adjHeight);
        }

        CompositeField.superclass.onResize.apply(this, arguments);
    },

    
    doLayout: function(shallow, force) {
        if (this.rendered) {
            var innerCt = this.innerCt;

            innerCt.forceLayout = this.ownerCt.forceLayout;
            innerCt.doLayout(shallow, force);
        }
    },

    
    beforeDestroy: function(){
        Ext.destroy(this.innerCt);

        CompositeField.superclass.beforeDestroy.call(this);
    },

    
    setReadOnly : function(readOnly) {
        readOnly = readOnly || true;

        if(this.rendered){
            this.eachItem(function(item){
                item.setReadOnly(readOnly);
            });
        }
        this.readOnly = readOnly;
    },

    onShow : function() {
        CompositeField.superclass.onShow.call(this);
        this.doLayout();
    },

    
    onDisable : function(){
        this.eachItem(function(item){
            item.disable();
        });
    },

    
    onEnable : function(){
        this.eachItem(function(item){
            item.enable();
        });
    }
});

Ext.reg('compositefield', CompositeField);

export default CompositeField;