var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['editor.js']},
        {name: '{C#MODNAME}', files: ['elEditor.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.ElTextEditorWidget = Y.Base.create('ElTextEditorWidget', SYS.AppWidget, [
        NS.ElEditorWidgetExt
    ], {
        destructor: function(){
            this._destroyEditorWidget();
        },
        _destroyEditorWidget: function(){
            if (!this._editorWidget){
                return;
            }
            this._editorWidget.destroy();
            this._editorWidget = null;
        },
        syncElData: function(tp, el){
            el.set('body', this._editorWidget.get('content'));
        },
        onModeChange: function(mode){
            var tp = this.template,
                el = this.get('el');

            if (mode === 'preview'){
                this._destroyEditorWidget();
                tp.setHTML({
                    bodyPreview: el.get('body')
                });
            } else if (mode === 'edit'){
                if (this._editorWidget){
                    return;
                }
                this._editorWidget = new SYS.Editor({
                    appInstance: this.get('appInstance'),
                    srcNode: tp.append('bodyEditor', '<div></div>'),
                    content: el.get('body'),
                    toolbar: SYS.Editor.TOOLBAR_MINIMAL
                });
            }
        },
        toJSON: function(el){
            return {
                body: el.get('body')
            };
        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget'},
        },
    });
};
