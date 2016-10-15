var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['base.js']}
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
            changed: {value: false},
            el: {}
        }
    });

    NS.ElementList = Y.Base.create('elementList', SYS.AppModelList, [], {
        appItem: NS.Element,
        getPath: function(elementid){
            elementid = elementid | 0;

            if (!this._cachePath){
                this._cachePath = {};
            }
            if (this._cachePath[elementid]){
                return this._cachePath[elementid];
            }

            var path = [],
                element;

            while (elementid > 0){
                element = this.getById(elementid);
                if (!element){
                    path = [];
                    break;
                }
                path[path.length] = elementid;
                elementid = element.get('parentid');
            }

            path = path.reverse();

            this._cachePath[elementid] = path;
            return path;
        }
    });

    NS.ElementType = Y.Base.create('elementType', SYS.AppModel, [], {
        structureName: 'ElementType',
    });

    NS.ElementTypeList = Y.Base.create('elementTypeList', SYS.AppModelList, [], {
        appItem: NS.ElementType,
    });

    NS.ElText = Y.Base.create('elText', SYS.AppModel, [], {
        structureName: 'ElText',
        toSave: function(){
            return {
                body: this.get('body')
            };
        }
    });

    NS.ElTextList = Y.Base.create('elTextList', SYS.AppModelList, [], {
        appItem: NS.ElText,
    });

    NS.ElPage = Y.Base.create('elPage', SYS.AppModel, [], {
        structureName: 'ElPage',
        toSave: function(){
            return {
                title: this.get('title')
            };
        }
    });

    NS.ElPageList = Y.Base.create('elPageList', SYS.AppModelList, [], {
        appItem: NS.ElPage,
    });

    NS.ElSection = Y.Base.create('elSection', SYS.AppModel, [], {
        structureName: 'ElSection',
        toSave: function(){
            return {
                title: this.get('title')
            };
        }
    });

    NS.ElSectionList = Y.Base.create('elSectionList', SYS.AppModelList, [], {
        appItem: NS.ElSection,
    });

    NS.Link = Y.Base.create('link', SYS.AppModel, [], {
        structureName: 'Link',
    }, {
        ATTRS: {
            clientid: NS.ATTRIBUTE.clientid
        }
    });

    NS.LinkList = Y.Base.create('linkList', SYS.AppModelList, [], {
        appItem: NS.Link,
    });

    NS.Owner = Y.Base.create('owner', SYS.AppModel, [], {
        structureName: 'Owner',
        compare: function(val){
            if (!NS.isOwner(val)){
                return false;
            }
            return val.get('module') === this.get('module')
                && val.get('type') === this.get('type')
                && val.get('ownerid') === this.get('ownerid');
        }
    }, {
        ATTRS: {
            id: {
                readOnly: true,
                getter: function(){
                    return this.get('module') + '|'
                        + this.get('type') + '|'
                        + this.get('ownerid');
                }
            },
        }
    });

    NS.OwnerList = Y.Base.create('ownerList', SYS.AppModelList, [], {
        appItem: NS.Owner,
        getOwner: function(module, type, ownerid){
            var app = this.appInstance,
                Owner = app.get('Owner'),
                id;

            if (Y.Lang.isObject(module)){
                var tempOwner = new Owner(Y.merge(module, {appInstance: app}));
                id = tempOwner.get('id');
            } else {
                id = module + '|' + type + '|' + ownerid;
            }

            var owner = this.getById(id);
            if (owner){
                return owner;
            }

            if (Y.Lang.isObject(module)){
                owner = new Owner(Y.merge(module, {appInstance: app}));
            } else {
                owner = new Owner({
                    module: module,
                    type: type,
                    ownerid: ownerid,
                    appInstance: app
                });
            }

            this.add(owner);

            return owner;
        },
    });

};
