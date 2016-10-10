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
        onInitAppWidget: function(err, appInstance){
            var tp = this.template;
            this._editorWidget = new SYS.Editor({
                appInstance: this.get('appInstance'),
                srcNode: tp.one('editor'),
                toolbar: SYS.Editor.TOOLBAR_MINIMAL
            });
        },
        save: function(){
            this.set('waiting', true);

            var tp = this.template;

            var sd = {
                docid: this.get('docid'),
                title: tp.getValue('title'),
                // descript: this.getWidget('descriptEditor').get('content')
            };

            this.get('appInstance').docSave(sd, function(err, result){
                this.set('waiting', false);
                if (err){
                    return;
                }
                this.set('docid', result.docSave.docid);
            }, this);
        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget'},
            docid: NS.ATTRIBUTE.docid,
        },
        parseURLParam: function(args){
            return {
                docid: args[0] | 0
            }
        }
    });
};
