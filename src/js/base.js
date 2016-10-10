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

    var BodyEditorWidgetExt = function(){
    };
    BodyEditorWidgetExt.ATTRS = {
        doc: NS.ATTRIBUTE.doc,
    };
    BodyEditorWidgetExt.prototype = {
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
    NS.BodyEditorWidgetExt = BodyEditorWidgetExt;
};
