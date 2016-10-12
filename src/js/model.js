var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['appModel.js']}
    ]
};
Component.entryPoint = function(NS){
    var Y = Brick.YUI,
        SYS = Brick.mod.sys;

    NS.Doc = Y.Base.create('doc', SYS.AppModel, [], {
        structureName: 'Doc',
        elEach: function(parentid, fn, contenxt){
            parentid = parentid | 0;
            this.get('elementList').each(function(element){
                if (parentid !== element.get('parentid')){
                    return;
                }

                fn.call(contenxt || this, element);
            }, this)
        }
    }, {
        ATTRS: {
            extends: {
                value: {}
            }
        }
    });

    NS.DocList = Y.Base.create('docList', SYS.AppModelList, [], {
        appItem: NS.Doc,
    });

    NS.DocSave = Y.Base.create('docSave', SYS.AppResponse, [], {
        structureName: 'DocSave',
        getByClientId: function(clientid){
            clientid = clientid | 0;
            var elements = this.get('elements');
            for (var i = 0; i < elements.length; i++){
                if (elements[i].get('clientid') === clientid){
                    return elements[i];
                }
            }
            return null;
        }
    }, {
        ATTRS: {
            elements: {value: []}
        }
    });

    NS.ElementSave = Y.Base.create('elementSave', SYS.AppResponse, [], {
        structureName: 'ElementSave',
    });

    NS.Element = Y.Base.create('element', SYS.AppModel, [], {
        structureName: 'Element',
    }, {
        ATTRS: {
            el: {}
        }
    });

    NS.ElementList = Y.Base.create('elementList', SYS.AppModelList, [], {
        appItem: NS.Element,
    });

    NS.ElementType = Y.Base.create('elementType', SYS.AppModel, [], {
        structureName: 'ElementType',
    });

    NS.ElementTypeList = Y.Base.create('elementTypeList', SYS.AppModelList, [], {
        appItem: NS.ElementType,
    });

    NS.ElText = Y.Base.create('elText', SYS.AppModel, [], {
        structureName: 'ElText',
    });

    NS.ElTextList = Y.Base.create('elTextList', SYS.AppModelList, [], {
        appItem: NS.ElText,
    });

    NS.ElPage = Y.Base.create('elPage', SYS.AppModel, [], {
        structureName: 'ElPage',
    });

    NS.ElPageList = Y.Base.create('elPageList', SYS.AppModelList, [], {
        appItem: NS.ElPage,
    });

};
