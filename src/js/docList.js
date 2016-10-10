var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['lib.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.DocListWidget = Y.Base.create('docListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance, options){
            this.reloadDocList();
        },
        reloadDocList: function(){
            this.set('waiting', true);

            var appInstance = this.get('appInstance');
            appInstance.docList(function(err, result){
                this.set('waiting', false);
                if (err){
                    return;
                }
                this.set('docList', result.docList);
                this.renderDocList();
            }, this);
        },
        renderDocList: function(){
            var docList = this.get('docList');
            if (!docList){
                return;
            }

            var tp = this.template,
                lst = "";

            docList.each(function(doc){
                var attrs = doc.toJSON();
                lst += tp.replace('row', attrs);
            });
            tp.gel('list').innerHTML = tp.replace('list', {
                'rows': lst
            });

            this.appURLUpdate();
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget,list,row'}
        },
    });
};