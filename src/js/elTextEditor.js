var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['editor.js']},
        {name: '{C#MODNAME}', files: ['lib.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.ElTextEditorWidget = Y.Base.create('ElTextEditorWidget', SYS.AppWidget, [
        NS.ElementEditorWidgetExt
    ], {
        destructor: function(){
            if (this._editorWidget ){
                this._editorWidget.destroy();
            }
        },
        onInitAppWidget: function(err, appInstance){
            var tp = this.template;
            this._editorWidget = new SYS.Editor({
                appInstance: this.get('appInstance'),
                srcNode: tp.one('editor'),
                toolbar: SYS.Editor.TOOLBAR_MINIMAL
            });
            this.initElementEditor();
        },
        toJSON: function(){
            var ret = {
                body: this._editorWidget.get('content')
            };

            return ret;
        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget'},
            elementType: {value: 'text'}
        },
        parseURLParam: function(args){
            return {
                docid: args[0] | 0
            }
        }
    });
};
