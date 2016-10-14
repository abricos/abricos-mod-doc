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


    NS.LinkListEditorWidget = Y.Base.create('LinkListEditorWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            this.set('waiting', true);
            appInstance.docList(function(err, result){
                if (err){
                    this.set('waiting', false);
                    return;
                }

                var owner = this.get('owner');

                appInstance.linkList(owner, function(err, result){
                    this.set('waiting', false);
                    if (err){
                        return;
                    }
                    this.set('linkList', result.linkList);
                    this._onLoadLinkList();
                }, this);
            }, this);
        },
        _onLoadLinkList: function(docList){

        },
        addLink: function(){

        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget'},
            owner: NS.ATTRIBUTE.owner,
            linkList: {}
        },
    });

    NS.LinkEditorWidget = Y.Base.create('LinkListEditorWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance, options){

        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget'},
            ownerModule: {value: '{C#MODNAME}'},
            ownerType: {value: ''},
            ownerid: {value: 0}
        },
    });
};