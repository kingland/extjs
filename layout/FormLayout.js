import Ext from '../Base';
import AnchorLayout from './AnchorLayout';

var FormLayout = Ext.extend(AnchorLayout, {
    labelSeparator : ':',
    
    trackLabels: false,

    type: 'form',

    onRemove: function(c){
        FormLayout.superclass.onRemove.call(this, c);
        if(this.trackLabels){
            c.un('show', this.onFieldShow, this);
            c.un('hide', this.onFieldHide, this);
        }
        
        var el = c.getPositionEl(),
            ct = c.getItemCt && c.getItemCt();
        if (c.rendered && ct) {
            if (el && el.dom) {
                el.insertAfter(ct);
            }
            Ext.destroy(ct);
            Ext.destroyMembers(c, 'label', 'itemCt');
            if (c.customItemCt) {
                Ext.destroyMembers(c, 'getItemCt', 'customItemCt');
            }
        }
    },

    
    setContainer : function(ct){
        FormLayout.superclass.setContainer.call(this, ct);
        if(ct.labelAlign){
            ct.addClass('x-form-label-'+ct.labelAlign);
        }

        if(ct.hideLabels){
            Ext.apply(this, {
                labelStyle: 'display:none',
                elementStyle: 'padding-left:0;',
                labelAdjust: 0
            });
        }else{
            this.labelSeparator = ct.labelSeparator || this.labelSeparator;
            ct.labelWidth = ct.labelWidth || 100;
            if(Ext.isNumber(ct.labelWidth)){
                var pad = Ext.isNumber(ct.labelPad) ? ct.labelPad : 5;
                Ext.apply(this, {
                    labelAdjust: ct.labelWidth + pad,
                    labelStyle: 'width:' + ct.labelWidth + 'px;',
                    elementStyle: 'padding-left:' + (ct.labelWidth + pad) + 'px'
                });
            }
            if(ct.labelAlign == 'top'){
                Ext.apply(this, {
                    labelStyle: 'width:auto;',
                    labelAdjust: 0,
                    elementStyle: 'padding-left:0;'
                });
            }
        }
    },

    
    isHide: function(c){
        return c.hideLabel || this.container.hideLabels;
    },

    onFieldShow: function(c){
        c.getItemCt().removeClass('x-hide-' + c.hideMode);

        
        if (c.isComposite) {
            c.doLayout();
        }
    },

    onFieldHide: function(c){
        c.getItemCt().addClass('x-hide-' + c.hideMode);
    },

    
    getLabelStyle: function(s){
        var ls = '', items = [this.labelStyle, s];
        for (var i = 0, len = items.length; i < len; ++i){
            if (items[i]){
                ls += items[i];
                if (ls.substr(-1, 1) != ';'){
                    ls += ';';
                }
            }
        }
        return ls;
    },

    

    
    renderItem : function(c, position, target){
        if(c && (c.isFormField || c.fieldLabel) && c.inputType != 'hidden'){
            var args = this.getTemplateArgs(c);
            if(Ext.isNumber(position)){
                position = target.dom.childNodes[position] || null;
            }
            if(position){
                c.itemCt = this.fieldTpl.insertBefore(position, args, true);
            }else{
                c.itemCt = this.fieldTpl.append(target, args, true);
            }
            if(!c.getItemCt){
                
                
                Ext.apply(c, {
                    getItemCt: function(){
                        return c.itemCt;
                    },
                    customItemCt: true
                });
            }
            c.label = c.getItemCt().child('label.x-form-item-label');
            if(!c.rendered){
                c.render('x-form-el-' + c.id);
            }else if(!this.isValidParent(c, target)){
                Ext.fly('x-form-el-' + c.id).appendChild(c.getPositionEl());
            }
            if(this.trackLabels){
                if(c.hidden){
                    this.onFieldHide(c);
                }
                c.on({
                    scope: this,
                    show: this.onFieldShow,
                    hide: this.onFieldHide
                });
            }
            this.configureItem(c);
        }else {
            FormLayout.superclass.renderItem.apply(this, arguments);
        }
    },

    
    getTemplateArgs: function(field) {
        var noLabelSep = !field.fieldLabel || field.hideLabel;

        return {
            id            : field.id,
            label         : field.fieldLabel,
            itemCls       : (field.itemCls || this.container.itemCls || '') + (field.hideLabel ? ' x-hide-label' : ''),
            clearCls      : field.clearCls || 'x-form-clear-left',
            labelStyle    : this.getLabelStyle(field.labelStyle),
            elementStyle  : this.elementStyle || '',
            labelSeparator: noLabelSep ? '' : (Ext.isDefined(field.labelSeparator) ? field.labelSeparator : this.labelSeparator)
        };
    },

    
    adjustWidthAnchor: function(value, c){
        if(c.label && !this.isHide(c) && (this.container.labelAlign != 'top')){
            var adjust = Ext.isIE6 || (Ext.isIE && !Ext.isStrict);
            return value - this.labelAdjust + (adjust ? -3 : 0);
        }
        return value;
    },

    adjustHeightAnchor : function(value, c){
        if(c.label && !this.isHide(c) && (this.container.labelAlign == 'top')){
            return value - c.label.getHeight();
        }
        return value;
    },

    
    isValidParent : function(c, target){
        return target && this.container.getEl().contains(c.getPositionEl());
    }

    
});

//Move To ContainnerLayout
//Container.LAYOUTS['form'] = FormLayout;

export default FormLayout;