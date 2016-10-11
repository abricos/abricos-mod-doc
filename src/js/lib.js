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
        instanceElItem: function(type, d){
            var ElItem = this.get('El' + NS.upperFirstChar(type));

            if (!ElItem){
                return;
            }
            return new ElItem(Y.merge(d || {}, {
                appInstance: this
            }));
        },
        instanceElList: function(type, d){
            var ElList = this.get('El' + NS.upperFirstChar(type) + 'List');

            if (!ElList){
                return;
            }
            return new ElList({
                appInstance: this,
                items: d.list || []
            });
        }
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
                type: "model:Doc",
                onResponse: function(doc, data){
                    var docExtends = doc.get('extends');
                    for (var n in data.extends){
                        docExtends[n] = this.instanceElList(n, data.extends[n]);
                    }
                }
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