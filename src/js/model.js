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

};
