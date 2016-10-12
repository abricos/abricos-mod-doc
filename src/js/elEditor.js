var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['lib.js']}
    ]
};
Component.entryPoint = function(NS){

    var ElementEditorWidgetExt = function(){
    };
    ElementEditorWidgetExt.ATTRS = {
        doc: NS.ATTRIBUTE.doc,
        element: NS.ATTRIBUTE.element,
        el: NS.ATTRIBUTE.el,
        clientid: NS.ATTRIBUTE.clientid,
        mode: {
            value: 'preview',
            validator: function(val){
                switch (val) {
                    case 'edit':
                    case 'preview':
                    case 'view':
                        return true;
                }
                return false;
            }
        },
        owner: {}
    };
    ElementEditorWidgetExt.prototype = {
        initializer: function(){
            this._wChilds = [];
        },
        onInitAppWidget: function(err, appInstance){
            this.initElementEditor();
        },
        destructor: function(){
            if (this._elAppendWidget){
                this._elAppendWidget.destroy();
                this._elAppendWidget = null;
            }
            if (this._toolModeWidget){
                this._toolModeWidget.destroy();
                this._toolModeWidget = null;
            }
            this.cleanChilds();
        },
        initElementEditor: function(){
            var tp = this.template,
                element = this.get('element');

            if (tp.one('toolModeWidget')){
                this._toolModeWidget = new NS.ElementToobarWidget({
                    srcNode: tp.one('toolModeWidget'),
                    element: element,
                    owner: this
                });
            }

            if (tp.one('container') && tp.one('elementAppend')){
                this._elAppendWidget = new NS.ButtonElementAppendWidget({
                    srcNode: tp.one('elementAppend'),
                    doc: this.get('doc'),
                    context: this,
                    callback: this.elementAppendByType
                });

                var parentid = element ? element.get('parentid') : 0;
                this.get('doc').elEach(parentid, function(element){
                    this.elementAppend(element);
                }, this);
            }

            this.after('modeChange', function(e){
                this._onModeChange(e.newVal);
            }, this);

            this._onModeChange(this.get('mode'));
        },
        syncElData: function(){
        },
        _onModeChange: function(mode){
            this.syncElData();

            this.triggerHide('mode');
            this.triggerShow('mode', mode);

            this.onModeChange(mode)
        },
        onModeChange: function(mode){
        },
        cleanChilds: function(){
            var wList = this._wChilds;
            for (var i = 0; i < wList.length; i++){
                wList[i].destroy();
            }
            this._wChilds = [];
        },
        childEach: function(fn, context){
            var wList = this._wChilds;
            for (var i = 0; i < wList.length; i++){
                fn.call(context || this, wList[i]);
            }
        },
        removeChild: function(w){
            var wList = this._wChilds,
                nList = [];

            for (var i = 0; i < wList.length; i++){
                if (wList[i] === w){
                    wList[i].destroy();
                } else {
                    nList[nList.length] = wList[i];
                }
            }
            this._wChilds = nList;
        },
        elementAppendByType: function(type){
            var appInstance = this.get('appInstance'),
                element = this.get('element'),
                Element = appInstance.get('Element'),
                childElement = new Element({
                    appInstance: appInstance,
                    type: type,
                    parentid: element ? element.get('parentid') : 0,
                    el: appInstance.instanceElItem(type)
                });

            this.elementAppend(childElement, true);
        },
        elementAppend: function(element, isEditMode){
            var tp = this.template,
                type = element.get('type'),
                upName = NS.upperFirstChar(type),
                component = 'el' + upName + 'Editor',
                widgetName = 'El' + upName + 'EditorWidget',
                wList = this._wChilds;

            this.set('waiting', true);
            Brick.use('{C#MODNAME}', component, function(){
                this.set('waiting', false);

                var widget = new (NS[widgetName])({
                    srcNode: tp.append('container', '<div></div>'),
                    doc: this.get('doc'),
                    owner: this,
                    element: element
                });
                wList[wList.length] = widget;
                if (isEditMode){
                    widget.set('mode', 'edit');
                }

            }, this);
        },
        remove: function(){
            this.get('owner').removeChild(this);
        },
        _toJSON: function(){
            this.syncElData();

            var element = this.get('element'),
                ret = Y.merge({
                    clientid: this.get('clientid'),
                    childs: []
                }, this.toJSON() || {});

            if (element){
                ret = Y.merge({
                    elementid: element.get('id'),
                    parentid: element.get('parentid'),
                    type: element.get('type'),
                }, ret || {});
            }
            this.childEach(function(child){
                ret.childs[ret.childs.length] = child._toJSON();
            }, this);

            return ret;
        },
        toJSON: function(){
            return {};
        },
        _onSave: function(docSave){
            this.childEach(function(child){
                child._onSave(docSave);
            }, this);

            var element = this.get('element');

            if (!element || element.get('id') > 0){
                return;
            }

            var clientid = this.get('clientid'),
                eSave = docSave.getByClientId(clientid);

            if (eSave){
                element.set('id', eSave.get('elementid'));
            }
        }
    };
    NS.ElementEditorWidgetExt = ElementEditorWidgetExt;

};
