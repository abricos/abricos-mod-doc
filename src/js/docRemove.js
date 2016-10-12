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

    NS.DocRemoveWidget = Y.Base.create('DocRemoveWidget', SYS.AppWidget, [], {
        buildTData: function(){
            return {
                docid: this.get('docid')
            };
        },
        onInitAppWidget: function(err, appInstance){
            var tp = this.template,
            docid = this.get('docid');

            appInstance.doc(docid, function(err, result){
                this.set('waiting', false);
                if (err){
                    return;
                }
                var doc = result.doc;
                tp.setHTML({
                    title: doc.get('title')
                });
            }, this);
        },
        remove: function(){
            this.set('waiting', true);
            this.get('appInstance').docRemove(this.get('docid'), function(err, result){
                this.set('waiting', false);
                if (err){
                    return;
                }
                this.go('doc.list');
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
