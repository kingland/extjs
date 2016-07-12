import Ext from '../Base';
import Ajax from '../Ajax';
import TreePanel from './TreePanel';
import TreeNode  from './TreeNode';
import AsyncTreeNode  from './AsyncTreeNode';
import Observable from '../util/Observable';
import NodeType from '../data/NodeType';

var TreeLoader = function(config){
    this.baseParams = {};
    Ext.apply(this, config);

    this.addEvents(
        
        "beforeload",
        
        "load",
        
        "loadexception"
    );
    TreeLoader.superclass.constructor.call(this);
    if(Ext.isString(this.paramOrder)){
        this.paramOrder = this.paramOrder.split(/[\s,|]/);
    }
};


Ext.extend(TreeLoader, Observable, {
    
    uiProviders : {},

    
    clearOnLoad : true,

    
    paramOrder: undefined,

    
    paramsAsHash: false,

    
    nodeParameter: 'node',

    
    directFn : undefined,

    
    load : function(node, callback, scope){
        if(this.clearOnLoad){
            while(node.firstChild){
                node.removeChild(node.firstChild);
            }
        }
        if(this.doPreload(node)){ 
            this.runCallback(callback, scope || node, [node]);
        }else if(this.directFn || this.dataUrl || this.url){
            this.requestData(node, callback, scope || node);
        }
    },

    doPreload : function(node){
        if(node.attributes.children){
            if(node.childNodes.length < 1){ 
                var cs = node.attributes.children;
                node.beginUpdate();
                for(var i = 0, len = cs.length; i < len; i++){
                    var cn = node.appendChild(this.createNode(cs[i]));
                    if(this.preloadChildren){
                        this.doPreload(cn);
                    }
                }
                node.endUpdate();
            }
            return true;
        }
        return false;
    },

    getParams: function(node){
        var bp = Ext.apply({}, this.baseParams),
            np = this.nodeParameter,
            po = this.paramOrder;

        np && (bp[ np ] = node.id);

        if(this.directFn){
            var buf = [node.id];
            if(po){
                
                if(np && po.indexOf(np) > -1){
                    buf = [];
                }

                for(var i = 0, len = po.length; i < len; i++){
                    buf.push(bp[ po[i] ]);
                }
            }else if(this.paramsAsHash){
                buf = [bp];
            }
            return buf;
        }else{
            return bp;
        }
    },

    requestData : function(node, callback, scope){
        if(this.fireEvent("beforeload", this, node, callback) !== false){
            if(this.directFn){
                var args = this.getParams(node);
                args.push(this.processDirectResponse.createDelegate(this, [{callback: callback, node: node, scope: scope}], true));
                this.directFn.apply(window, args);
            }else{
                this.transId = Ajax.request({
                    method:this.requestMethod,
                    url: this.dataUrl||this.url,
                    success: this.handleResponse,
                    failure: this.handleFailure,
                    scope: this,
                    argument: {callback: callback, node: node, scope: scope},
                    params: this.getParams(node)
                });
            }
        }else{
            this.runCallback(callback, scope || node, []);
        }
    },

    processDirectResponse: function(result, response, args){
        if(response.status){
            this.handleResponse({
                responseData: Ext.isArray(result) ? result : null,
                responseText: result,
                argument: args
            });
        }else{
            this.handleFailure({
                argument: args
            });
        }
    },

    
    runCallback: function(cb, scope, args){
        if(Ext.isFunction(cb)){
            cb.apply(scope, args);
        }
    },

    isLoading : function(){
        return !!this.transId;
    },

    abort : function(){
        if(this.isLoading()){
            Ajax.abort(this.transId);
        }
    },

    
    createNode : function(attr){
        
        if(this.baseAttrs){
            Ext.applyIf(attr, this.baseAttrs);
        }
        if(this.applyLoader !== false && !attr.loader){
            attr.loader = this;
        }
        if(Ext.isString(attr.uiProvider)){
           attr.uiProvider = this.uiProviders[attr.uiProvider] || eval(attr.uiProvider);
        }
        if(attr.nodeType){
			//Move To NodeType
            //return new TreePanel.nodeTypes[attr.nodeType](attr);
			return new NodeType[attr.nodeType](attr);
			
        }else{
            return attr.leaf ?
                        new TreeNode(attr) :
                        new AsyncTreeNode(attr);
        }
    },

    processResponse : function(response, node, callback, scope){
        var json = response.responseText;
        try {
            var o = response.responseData || Ext.decode(json);
            node.beginUpdate();
            for(var i = 0, len = o.length; i < len; i++){
                var n = this.createNode(o[i]);
                if(n){
                    node.appendChild(n);
                }
            }
            node.endUpdate();
            this.runCallback(callback, scope || node, [node]);
        }catch(e){
            this.handleFailure(response);
        }
    },

    handleResponse : function(response){
        this.transId = false;
        var a = response.argument;
        this.processResponse(response, a.node, a.callback, a.scope);
        this.fireEvent("load", this, a.node, response);
    },

    handleFailure : function(response){
        this.transId = false;
        var a = response.argument;
        this.fireEvent("loadexception", this, a.node, response);
        this.runCallback(a.callback, a.scope || a.node, [a.node]);
    },

    destroy : function(){
        this.abort();
        this.purgeListeners();
    }
});

export default TreeLoader;