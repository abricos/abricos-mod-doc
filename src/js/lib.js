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
            Element: {value: NS.Element},
            ElementList: {value: NS.ElementList},
            ElementSave: {value: NS.ElementSave},
            ElementType: {value: NS.ElementType},
            ElementTypeList: {value: NS.ElementTypeList},
            ElText: {value: NS.ElText},
            ElTextList: {value: NS.ElTextList},
            ElPage: {value: NS.ElPage},
            ElPageList: {value: NS.ElPageList},
        },
        REQS: {
            docList: {
                attribute: false,
                type: "modelList:DocList"
            },
            docSave: {
                args: ['data'],
                type: 'response:DocSave',
                onResponse: function(r){
                    var ElementSave = this.get('ElementSave'),
                        dEls = r.get('elements'),
                        els = [];

                    for (var i = 0; i < dEls.length; i++){
                        els[els.length] = new ElementSave(Y.merge({
                            appInstance: this
                        }, dEls[i]));
                    }
                    r.set('elements', els)
                }
            },
            doc: {
                args: ['docid'],
                type: "model:Doc",
                onResponse: function(doc, data){
                    var docExtends = doc.get('extends');
                    for (var n in data.extends){
                        docExtends[n] = this.instanceElList(n, data.extends[n]);
                    }
                    var type, el;
                    doc.get('elementList').each(function(element){
                        type = element.get('type');
                        if (!docExtends[type]){
                            return;
                        }
                        el = docExtends[type].getById(element.get('id'));
                        element.set('el', el);
                    }, this);
                }
            },
            docRemove: {
                args: ['docid']
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
                view: function(docid){
                    return this.getURL('ws') + 'docViewer/DocViewerWidget/' + (docid | 0) + '/';
                },
                remove: function(docid){
                    return this.getURL('ws') + 'docRemove/DocRemoveWidget/' + (docid | 0) + '/';
                },
            }
        }
    });
};