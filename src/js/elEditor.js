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
            setter: function(val){
                switch (val) {
                    case 'edit':
                    case 'preview':
                    case 'view':
                        return val;
                }
                return 'preview';
            },
        }
    };
    ElementEditorWidgetExt.prototype = {
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
        initElementEditor: function(){
            var tp = this.template;

            if (!tp.one('container') || !tp.one('elementAppend')){
                return;
            }

            this._elAppendWidget = new NS.ButtonElementAppendWidget({
                srcNode: tp.one('elementAppend'),
                doc: this.get('doc'),
                context: this,
                callback: this.elementAppendByType
            });

            var element = this.get('element'),
                parentid = element ? element.get('parentid') : 0;

            this.get('doc').elEach(parentid, function(element){
                this.elementAppend(element);
            }, this);
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

            this.elementAppend(childElement);
        },
        elementAppend: function(element){
            var tp = this.template,
                type = element.get('type'),
                upName = NS.upperFirstChar(type),
                component = 'el' + upName + 'Editor',
                widgetName = 'El' + upName + 'EditorWidget',
                wList = this._wChilds;

            this.set('waiting', true);
            Brick.use('{C#MODNAME}', component, function(){
                this.set('waiting', false);

                var Widget = NS[widgetName];
                wList[wList.length] = new Widget({
                    srcNode: tp.append('container', '<div></div>'),
                    doc: this.get('doc'),
                    element: element
                });
            }, this);
        },
        _setMode: function(isEdit){
            this.set('isEditMode', isEdit);
            this.set('isViewMode', !isEdit);
            this.appTriggerUpdate();
            this.onChangeMode(isEdit);
        },
        onChangeMode: function(isEdit){
        },
        setEditMode: function(){
            this._setMode(true);
        },
        setViewMode: function(){
            this._setMode(false);
        },
        _toJSON: function(){
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
