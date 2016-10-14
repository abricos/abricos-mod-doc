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

            this._wList = [];

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
        destructor: function(){
            this._cleanWList();
            this.closeAction();
        },
        _onLoadLinkList: function(){

        },
        _cleanWList: function(){
            var wList = this._wList;
            for (var i = 0; i < wList.length; i++){
                wList[i].destroy();
            }
            this._wList = [];
        },
        createLink: function(){
            this.showEditor(0);
        },
        closeAction: function(){
            if (!this._actionWidget){
                return;
            }
            this._actionWidget.destroy();
            this._actionWidget = null;
            this.template.toggleView(true, 'list,buttons', 'action');
        },
        showEditor: function(linkid){
            linkid = linkid | 0;
            var tp = this.template,
                appInstance = this.get('appInstance'),
                link;

            if (linkid === 0){
                link = new (appInstance.get('Link'))({
                    appInstance: appInstance
                });
            } else {
                link = this.get('linkList').getById(linkid);
            }

            if (!link){
                return;
            }

            this.closeAction();

            tp.toggleView(false, 'list,buttons', 'action');

            this._actionWidget = new NS.LinkEditorWidget({
                srcNode: tp.one('action'),
                link: link
            });
        },
        _addLink: function(link){
            var tp = this.template;
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
        save: function(){
        },
        cancel: function(){
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'editor'},
            link: {}
        },
    });
};