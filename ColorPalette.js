import Ext from './Base';
import Component from './Component';

var ColorPalette = Ext.extend(Component, {
	
    
    itemCls : 'x-color-palette',
    
    value : null,
    
    clickEvent :'click',
    
    ctype : 'Ext.ColorPalette',

    
    allowReselect : false,

    
    colors : [
        '000000', '993300', '333300', '003300', '003366', '000080', '333399', '333333',
        '800000', 'FF6600', '808000', '008000', '008080', '0000FF', '666699', '808080',
        'FF0000', 'FF9900', '99CC00', '339966', '33CCCC', '3366FF', '800080', '969696',
        'FF00FF', 'FFCC00', 'FFFF00', '00FF00', '00FFFF', '00CCFF', '993366', 'C0C0C0',
        'FF99CC', 'FFCC99', 'FFFF99', 'CCFFCC', 'CCFFFF', '99CCFF', 'CC99FF', 'FFFFFF'
    ],

    
    
    
    
    initComponent : function(){
        ColorPalette.superclass.initComponent.call(this);
        this.addEvents(
            
            'select'
        );

        if(this.handler){
            this.on('select', this.handler, this.scope, true);
        }    
    },

    
    onRender : function(container, position){
        this.autoEl = {
            tag: 'div',
            cls: this.itemCls
        };
        ColorPalette.superclass.onRender.call(this, container, position);
        var t = this.tpl || new XTemplate(
            '<tpl for="."><a href="#" class="color-{.}" hidefocus="on"><em><span style="background:#{.}" unselectable="on">&#160;</span></em></a></tpl>'
        );
        t.overwrite(this.el, this.colors);
        this.mon(this.el, this.clickEvent, this.handleClick, this, {delegate: 'a'});
        if(this.clickEvent != 'click'){
        	this.mon(this.el, 'click', Ext.emptyFn, this, {delegate: 'a', preventDefault: true});
        }
    },

    
    afterRender : function(){
        ColorPalette.superclass.afterRender.call(this);
        if(this.value){
            var s = this.value;
            this.value = null;
            this.select(s, true);
        }
    },

    
    handleClick : function(e, t){
        e.preventDefault();
        if(!this.disabled){
            var c = t.className.match(/(?:^|\s)color-(.{6})(?:\s|$)/)[1];
            this.select(c.toUpperCase());
        }
    },

    
    select : function(color, suppressEvent){
        color = color.replace('#', '');
        if(color != this.value || this.allowReselect){
            var el = this.el;
            if(this.value){
                el.child('a.color-'+this.value).removeClass('x-color-palette-sel');
            }
            el.child('a.color-'+color).addClass('x-color-palette-sel');
            this.value = color;
            if(suppressEvent !== true){
                this.fireEvent('select', this, color);
            }
        }
    }

    
});
Ext.reg('colorpalette', ColorPalette);

export default ColorPalette;