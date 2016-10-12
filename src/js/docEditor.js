var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['editor.js']},
        {name: '{C#MODNAME}', files: ['elEditor.js', 'toolbar.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.DocEditorWidget = Y.Base.create('DocEditorWidget', SYS.AppWidget, [
        SYS.ContainerWidgetExt,
        NS.ElementEditorWidgetExt
    ], {
        onInitAppWidget: function(err, appInstance){
            var docid = this.get('docid');

            this.set('waiting', true);
            if (docid === 0){
                var doc = new (appInstance.get('Doc'))({
                    appInstance: appInstance
                });
                this.onLoadDoc(doc);
            } else {
                appInstance.doc(docid, function(err, result){
                    if (err){
                        this.set('waiting', false);
                        return;
                    }
                    this.onLoadDoc(result.doc);
                }, this);
            }
        },
        onLoadDoc: function(doc){
            this.set('waiting', false);
            this.set('doc', doc);

            var tp = this.template;

            tp.setValue({
                title: doc.get('title')
            });

            this.initElementEditor();
        },
        toJSON: function(){
            var tp = this.template;
            return {
                docid: this.get('docid'),
                title: tp.getValue('title'),
            };
        },
        save: function(){
            this.set('waiting', true);

            var sd = this._toJSON();

            this.get('appInstance').docSave(sd, function(err, result){
                this.set('waiting', false);
                if (err){
                    return;
                }
                var ds = result.docSave;
                this.set('docid', ds.get('docid'));

                this._onSave(ds);
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
