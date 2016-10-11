var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['application.js']},
        {name: '{C#MODNAME}', files: ['model.js']}
    ]
};
Component.entryPoint = function(NS){

    NS.clientid = 1;
    NS.incClientId = function(){
        return NS.clientid++;
    };

    NS.upperFirstChar = function(s){
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    var number = {
        value: 0,
        setter: function(val){
            return val | 0;
        }
    };

    NS.ATTRIBUTE = {
        number: number,
        docid: number,
        doc: {value: null},
        element: {value: null},
        el: {
            readOnly: true,
            getter: function(){
                var element = this.get('element');
                return element ? element.get('el') : null;
            }
        },
        clientid: {
            readOnly: true,
            getter: function(){
                if (!this._elClientId){
                    this._elClientId = NS.incClientId();
                }
                return this._elClientId;
            },
        }
    };

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
                switch(val){
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
            var ret = Y.merge({
                    type: this.get('elementType'),
                    clientid: this.get('clientid'),
                    childs: []
                }, this.toJSON() || {}),
                wList = this._wChilds;

            for (var i = 0; i < wList.length; i++){
                ret.childs[ret.childs.length] = wList[i]._toJSON();
            }

            return ret;
        },
        toJSON: function(){
            return {};
        },
    };
    NS.ElementEditorWidgetExt = ElementEditorWidgetExt;

};
