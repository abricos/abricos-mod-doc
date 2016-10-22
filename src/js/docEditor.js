var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['editor.js']},
        {
            name: '{C#MODNAME}',
            files: [
                'elPageEditor.js',
                'elTextEditor.js',
                'elGridEditor.js',
                'elImageEditor.js',
                'elTableEditor.js',
                'toolbar.js'
            ]
        }
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.DocEditorWidget = Y.Base.create('DocEditorWidget', SYS.AppWidget, [
        SYS.ContainerWidgetExt,
        NS.ElEditorWidgetExt,
        NS.ElContainerEditorWidgetExt
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
                title: doc.get('title'),
                miniTitle: doc.get('miniTitle')
            });

            this.initElementEditor();

            this._initDocElementEditor(0, this);
        },
        _initDocElementEditor: function(parentid, widget){
            this.get('doc').elEach(parentid, function(element){
                var childWidget = widget.elementAppend(element);
                if (childWidget.get('isElContainer')){
                    this._initDocElementEditor(element.get('id'), childWidget);
                }
            }, this);
        },
        save: function(){
            this.set('waiting', true);

            var tp = this.template,
                sd = this._toJSON();

            sd = Y.merge(sd, {
                docid: this.get('docid'),
                title: tp.getValue('title'),
                miniTitle: tp.getValue('miniTitle'),
            });

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
