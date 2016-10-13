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

    NS.DocViewerWidget = Y.Base.create('DocViewerWidget', SYS.AppWidget, [], {
        buildTData: function(){
            return {
                docid: this.get('docid')
            };
        },
        onInitAppWidget: function(err, appInstance){
            var docid = this.get('docid');

            appInstance.doc(docid, function(err, result){
                this.set('waiting', false);
                if (err){
                    return;
                }
                this.set('doc', result.doc);
                this.renderDoc();
            }, this);
        },
        renderDoc: function(){
            var tp = this.template,
                doc = this.get('doc');

            var body = this._renderElements(0);

            tp.setHTML({
                title: doc.get('title'),
                body: body
            });
        },
        _renderElements: function(parentid){
            var tp = this.template,
                lst = "",
                el, type, id;
            this.get('doc').elEach(parentid, function(element){
                id = element.get('id');
                type = element.get('type');
                el = element.get('el');

                switch (type) {
                    case 'page':
                    case 'section':
                        lst += tp.replace(type, {
                            id: id,
                            title: el.get('title'),
                            childs: this._renderElements(id)
                        });
                        break;
                    case 'text':
                        lst += tp.replace(type, {
                            id: id,
                            body: el.get('body')
                        });
                        break;
                }
            }, this);

            return lst;
        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {
                value: 'widget,page,section,text'
            },
            docid: NS.ATTRIBUTE.docid,
            doc: NS.ATTRIBUTE.doc
        },
        parseURLParam: function(args){
            return {
                docid: args[0] | 0
            }
        }
    });
};
