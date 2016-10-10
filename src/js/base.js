var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['application.js']},
        {name: '{C#MODNAME}', files: ['model.js']}
    ]
};
Component.entryPoint = function(NS){

    NS.ATTRIBUTE = {
        docid: {
            value: 0,
            setter: function(val){
                return val | 0;
            }
        },
        doc: {value: null},
        body: {value: null},
        isEditMode: {value: false},
        isViewMode: {value: false},
    };

    NS.upperFirstChar = function(s){
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    var ElementEditorWidgetExt = function(){
    };
    ElementEditorWidgetExt.ATTRS = {
        doc: NS.ATTRIBUTE.doc,
    };
    ElementEditorWidgetExt.prototype = {
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
        }
    };
    NS.ElementEditorWidgetExt = ElementEditorWidgetExt;

    var ElementContainerWidgetExt = function(){
    };
    ElementContainerWidgetExt.ATTRS = {};
    ElementContainerWidgetExt.prototype = {
        initializer: function(){
            this._elWidgetList = [];
        },
        destructor: function(){
            if (this._buttonElementAppendWidget){
                this._buttonElementAppendWidget.destroy();
                this._buttonElementAppendWidget = null;
            }
            this.cleanElementListWidget();
        },
        cleanElementListWidget: function(){
            var wList = this._elWidgetList;
            for (var i = 0; i < wList.length; i++){
                wList[i].destroy();
            }
            this._elWidgetList = [];
        },
        initElementContainer: function(){
            var tp = this.template;

            if (!tp.one('container') || !tp.one('elementAppend')){
                return;
            }

            this._buttonElementAppendWidget = new NS.ButtonElementAppendWidget({
                srcNode: tp.one('elementAppend'),
                context: this,
                callback: this.elementAppendByType
            });
        },
        elementAppendByType: function(name){
            var tp = this.template,
                upName = NS.upperFirstChar(name),
                component = 'el' + upName + 'Editor',
                widgetName = 'El' + upName + 'EditorWidget',
                wList = this._elWidgetList;

            this.set('waiting', true)
            Brick.use('{C#MODNAME}', component, function(){
                this.set('waiting', false)

                var Widget = NS[widgetName];
                wList[wList.length] = new Widget({
                    srcNode: tp.append('container', '<div></div>'),
                    doc: this.get('doc')
                });
            }, this);
        }
    };
    NS.ElementContainerWidgetExt = ElementContainerWidgetExt;

};
