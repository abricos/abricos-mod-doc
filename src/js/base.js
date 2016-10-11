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
        isEditMode: {value: false},
        isViewMode: {value: false},
        elementType: {value: ''},
        clientid: NS.ATTRIBUTE.clientid,
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

            this.get('doc').elEach(0, function(el, element){
                // this.elementAppend(el);
                console.log(el.toJSON(true));
            }, this);

        },
        cleanChilds: function(){
            var wList = this._wChilds;
            for (var i = 0; i < wList.length; i++){
                wList[i].destroy();
            }
            this._wChilds = [];
        },
        elementAppendByType: function(name){
            var appInstance = this.get('appInstance'),
                tp = this.template,
                upName = NS.upperFirstChar(name),
                component = 'el' + upName + 'Editor',
                elClassName = 'El' + upName,
                el = new (appInstance.get(elClassName))({
                    appInstance: appInstance,
                }),
                widgetName = modelClassName + 'EditorWidget',
                wList = this._wChilds;

            this.set('waiting', true)
            Brick.use('{C#MODNAME}', component, function(){
                this.set('waiting', false)

                var Widget = NS[widgetName];
                wList[wList.length] = new Widget({
                    srcNode: tp.append('container', '<div></div>'),
                    doc: this.get('doc')
                });
            }, this);
        },
        elementAppend: function(el){

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
