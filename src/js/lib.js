var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['base.js']}
    ]
};
Component.entryPoint = function(NS){
    var COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.roles = new Brick.AppRoles('{C#MODNAME}', {
        isView: 10,
        isWrite: 30,
        isAdmin: 50
    });

    SYS.Application.build(COMPONENT, {}, {
        initializer: function(){
            NS.roles.load(function(){
                this.elementTypeList(function(){
                    this.initCallbackFire();
                }, this);
            }, this);
        },
    }, [], {
        APPS: {},
        ATTRS: {
            isLoadAppStructure: {value: true},
            Doc: {value: NS.Doc},
            DocList: {value: NS.DocList},
            DocSave: {value: NS.DocSave},
            ElementType: {value: NS.ElementType},
            ElementTypeList: {value: NS.ElementTypeList},
            ElText: {value: NS.ElText},
            ElTextList: {value: NS.ElTextList},
            ElArticle: {value: NS.ElArticle},
            ElArticleList: {value: NS.ElArticleList},
        },
        REQS: {
            docList: {
                attribute: false,
                type: "modelList:DocList"
            },
            docSave: {
                args: ['data'],
                type: 'response:DocSave'
            },
            doc: {
                args: ['docid'],
                type: "model:Doc"
            },
            elementTypeList: {
                attribute: true,
                type: "modelList:ElementTypeList"
            },
        },
        URLS: {
            ws: "#app={C#MODNAME}/wspace/ws/",
            doc: {
                list: function(){
                    return this.getURL('ws') + 'docList/DocListWidget/';
                },
                create: function(){
                    return this.getURL('doc.edit');
                },
                edit: function(docid){
                    return this.getURL('ws') + 'docEditor/DocEditorWidget/' + (docid | 0) + '/';
                },
            }
        }
    });
};