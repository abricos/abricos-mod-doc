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

    NS.LinkListViewerWidget = Y.Base.create('LinkListViewerWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            appInstance.set('isBosURL', this.get('isBosURL'));

            if (this.get('linkList')){
                return this.renderLinkList();
            }

            var owner = this.get('owner');
            appInstance.linkList(owner, function(err, result){
                this.set('waiting', false);
                if (err){
                    return;
                }
                this.set('linkList', linkList);
                this.renderLinkList(result.linkList);
            }, this);
        },
        renderLinkList: function(){
            var tp = this.template,
                lst = "";

            this.get('linkList').each(function(link){
                var path = link.get('path') || [],
                    elType = link.get('elType'),
                    elData = link.get('elData'),
                    body = "",
                    aPath = [tp.replace('docItem', {
                        docid: link.get('docid'),
                        docTitle: link.get('docTitle'),
                    })];

                for (var ii = 0; ii < path.length; ii++){
                    aPath[aPath.length] = tp.replace('pathItem', {
                        docid: link.get('docid'),
                        elementid: path[ii].id,
                        title: path[ii].title,
                    });
                }

                switch (elType){
                    case 'page':
                    case 'section':
                        body = elData.title;
                        break;
                    case 'text':
                        body = elData.body;
                        break;
                }

                lst += tp.replace('linkRow', {
                    docid: link.get('docid'),
                    path: aPath.join(tp.replace('pathDelim')),
                    clientid: link.get('clientid'),
                    body: body
                });

            }, this);

            tp.setHTML({
                list: lst
            });
            this.appURLUpdate();
        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget,linkRow,docItem,pathItem,pathDelim,page,section,text'},
            owner: NS.ATTRIBUTE.owner,
            linkList: {},
            isBosURL: {value: true}
        },
    });

};