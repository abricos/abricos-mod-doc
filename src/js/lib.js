var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['model.js']}
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
            ElSection: {value: NS.ElSection},
            ElSectionList: {value: NS.ElSectionList},
            ElRow: {value: NS.ElRow},
            ElRowList: {value: NS.ElRowList},
            ElCol: {value: NS.ElCol},
            ElColList: {value: NS.ElColList},
            ElImage: {value: NS.ElImage},
            ElImageList: {value: NS.ElImageList},
            ElTable: {value: NS.ElTable},
            ElTableList: {value: NS.ElTableList},
            ElTableCell: {value: NS.ElTableCell},
            ElTableCellList: {value: NS.ElTableCellList},
            Link: {value: NS.Link},
            LinkList: {value: NS.LinkList},
            Owner: {value: NS.Owner},
            ownerList: {
                readOnly: true,
                getter: function(){
                    if (!this._ownerListAttr){
                        this._ownerListAttr = new NS.OwnerList({appInstance: this});
                    }
                    return this._ownerListAttr;
                }
            },
            isBosURL: {
                value: true
            }
        },
        REQS: {
            docList: {
                attribute: true,
                type: "modelList:DocList"
            },
            docSave: {
                args: ['data'],
                type: 'response:DocSave',
                onResponse: function(r){
                    this.set('docList', null);
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
            docListSort: {
                args: ['orders']
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
                args: ['docid'],
                onResponse: function(){
                    this.set('docList', null);
                }
            },
            elementTypeList: {
                attribute: true,
                type: "modelList:ElementTypeList"
            },
            docStructure: {
                args: ['docid'],
                type: "modelList:ElementList"
            },
            linkList: {
                args: ['owner'],
                type: "modelList:LinkList"
            }
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
                    if (this.get('isBosURL')){
                        return this.getURL('ws') + 'docViewer/DocViewerWidget/' + (docid | 0) + '/';
                    } else {
                        return '/doc/doc' + (docid | 0) + '-doc/';
                    }
                },
                remove: function(docid){
                    return this.getURL('ws') + 'docRemove/DocRemoveWidget/' + (docid | 0) + '/';
                },
            }
        }
    });
};