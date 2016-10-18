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

    NS.ElTableEditorWidget = Y.Base.create('ElTableEditorWidget', SYS.AppWidget, [
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
        onSyncElData: function(tp, el, forced){
            var body = this._editorWidget.get('content');
            if (!forced && el.get('body') === body){
                return false;
            }

            el.set('body', body);
            this.syncTitle(body, true);

            return true;
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
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget'},
        },
    });
};
