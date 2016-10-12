var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['lib.js']}
    ]
};
Component.entryPoint = function(NS){

    var ElEditorWidgetExt = function(){
    };
    ElEditorWidgetExt.ATTRS = {
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
    ElEditorWidgetExt.prototype = {
        onInitAppWidget: function(err, appInstance){
            this.initElementEditor();
        },
        destructor: function(){
            if (this._toolModeWidget){
                this._toolModeWidget.destroy();
                this._toolModeWidget = null;
            }
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

            if (this.get('isElContainer')){
                this._initElContainerEditor();
            }

            this.after('modeChange', function(e){
                this._onModeChange(e.newVal, e.prevVal);
            }, this);

            this._onModeChange(this.get('mode'), this.get('mode'));
        },
        _syncElData: function(mode){
            if (mode !== 'edit'){
                return;
            }
            this.syncElData();
        },
        syncElData: function(){
        },
        _onModeChange: function(mode, prevMode){
            this._syncElData(prevMode);

            var tp = this.template;

            tp.toggleView(mode === 'edit', 'editorPanel', 'previewPanel');
            if (this._toolModeWidget){
                this._toolModeWidget.updateMode(mode);
            }

            this.onModeChange(mode)
        },
        onModeChange: function(mode){
        },
        remove: function(){
            this.get('owner').removeChild(this);
        },
        _toJSON: function(){
            this._syncElData(this.get('mode'));

            var element = this.get('element'),
                ret = Y.merge({
                    clientid: this.get('clientid'),
                }, this.toJSON() || {});

            if (element){
                ret = Y.merge({
                    elementid: element.get('id'),
                    parentid: element.get('parentid'),
                    type: element.get('type'),
                }, ret || {});
            }

            if (this.get('isElContainer')){
                this.childEach(function(child){
                    if (!ret.childs){
                        ret.childs = [];
                    }
                    ret.childs[ret.childs.length] = child._toJSON();
                }, this);
            }

            return ret;
        },
        toJSON: function(){
            return {};
        },
        _onSave: function(docSave){
            if (this.get('isElContainer')){
                this.childEach(function(child){
                    child._onSave(docSave);
                }, this);
            }

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
    NS.ElEditorWidgetExt = ElEditorWidgetExt;

    var ElContainerEditorWidgetExt = function(){
    };
    ElContainerEditorWidgetExt.ATTRS = {
        isElContainer: {
            readOnly: true,
            value: true
        }
    };
    ElContainerEditorWidgetExt.prototype = {
        initializer: function(){
            this._wChilds = [];
        },
        destructor: function(){
            if (this._elAppendWidget){
                this._elAppendWidget.destroy();
                this._elAppendWidget = null;
            }
            this.cleanChilds();
        },
        _initElContainerEditor: function(){
            var tp = this.template,
                element = this.get('element');

            this._elAppendWidget = new NS.ButtonElementAppendWidget({
                srcNode: tp.one('elementAppend'),
                doc: this.get('doc'),
                context: this,
                callback: this.elementAppendByType
            });
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

            var w = this.elementAppend(childElement);
            w.set('mode', 'edit');
        },
        elementAppend: function(element){
            var tp = this.template,
                type = element.get('type'),
                upName = NS.upperFirstChar(type),
                widgetName = 'El' + upName + 'EditorWidget',
                wList = this._wChilds;

            var widget = new (NS[widgetName])({
                srcNode: tp.append('container', '<div></div>'),
                doc: this.get('doc'),
                owner: this,
                element: element
            });
            wList[wList.length] = widget;
            return widget;
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
    };
    NS.ElContainerEditorWidgetExt = ElContainerEditorWidgetExt;
};
