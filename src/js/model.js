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
    }, {
        ATTRS: {}
    });

    NS.DocList = Y.Base.create('docList', SYS.AppModelList, [], {
        appItem: NS.Doc,
    });

    NS.DocSave = Y.Base.create('docSave', SYS.AppResponse, [], {
        structureName: 'DocSave',
    });

    NS.Element = Y.Base.create('element', SYS.AppModel, [], {
        structureName: 'Element',
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

    NS.ElementText = Y.Base.create('elementText', SYS.AppModel, [], {
        structureName: 'ElementText',
    });

    NS.ElementTextList = Y.Base.create('elementTextList', SYS.AppModelList, [], {
        appItem: NS.ElementText,
    });

    NS.ElementArticle = Y.Base.create('elementArticle', SYS.AppModel, [], {
        structureName: 'ElementArticle',
    });

    NS.ElementArticleList = Y.Base.create('elementArticleList', SYS.AppModelList, [], {
        appItem: NS.ElementArticle,
    });

};
