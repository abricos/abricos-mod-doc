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


    NS.LinkListEditorWidget = Y.Base.create('LinkListEditorWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            this._cacheStructs = {};
            this._links = [];

            this.set('waiting', true);
            appInstance.docList(function(err, result){
                if (err){
                    this.set('waiting', false);
                    return;
                }

                var owner = this.get('owner');

                appInstance.linkList(owner, function(err, result){
                    this.set('waiting', false);
                    if (err){
                        return;
                    }
                    this._onLoadLinkList(result.linkList);
                }, this);
            }, this);
        },
        destructor: function(){
            this.closeAction();
        },
        _onLoadLinkList: function(linkList){
            this.set('linkList', linkList);
            var links = [];
            linkList.each(function(link){
                links[links.length] = link;
            }, this);
            this._links = links;
            this.renderLinkList();
        },
        addLink: function(link){
            var links = this._links;
            links[links.length] = link;
            this.renderLinkList();
        },
        removeLinkByClientId: function(clientid){
            clientid = clientid | 0;

            var links = this._links,
                nLinks = [];

            for (var i = 0; i < links.length; i++){
                if (links[i].get('clientid') === clientid){
                    continue;
                }
                nLinks[nLinks.length] = links[i];
            }
            this._links = nLinks;
            this.renderLinkList();
        },
        createLink: function(){
            this.showEditor(0);
        },
        closeAction: function(){
            if (!this._actionWidget){
                return;
            }
            this._actionWidget.destroy();
            this._actionWidget = null;
            this.template.toggleView(true, 'list,buttons', 'action');
        },
        showEditor: function(linkid){
            linkid = linkid | 0;
            var tp = this.template,
                appInstance = this.get('appInstance'),
                link;

            if (linkid === 0){
                link = new (appInstance.get('Link'))({
                    appInstance: appInstance
                });
            } else {
                link = this.get('linkList').getById(linkid);
            }

            if (!link){
                return;
            }

            this.closeAction();

            tp.toggleView(false, 'list,buttons', 'action');

            this._actionWidget = new NS.LinkEditorWidget({
                srcNode: tp.append('action', '<div></div>'),
                parent: this,
                link: link
            });
        },
        docStructure: function(docid, callback, context){
            docid = docid | 0;
            var cache = this._cacheStructs;
            if (cache[docid]){
                return callback.call(context, cache[docid]);
            }
            this.set('waiting', true);
            this.get('appInstance').docStructure(docid, function(err, result){
                this.set('waiting', false);
                if (err){
                    return;
                }
                cache[docid] = result.docStructure;
                callback.call(context, result.docStructure);
            }, this);
        },
        renderLinkList: function(){
            var tp = this.template,
                links = this._links,
                lst = "";

            for (var i = 0; i < links.length; i++){
                var link = links[i],
                    path = link.get('path') || [],
                    aPath = [];

                for (var ii = 0; ii < path.length; ii++){
                    aPath[aPath.length] = tp.replace('pathItem', {
                        docid: link.get('docid'),
                        elementid: path[ii].id,
                        title: path[ii].title,
                    });
                }
                lst += tp.replace('linkRow', {
                    docid: link.get('docid'),
                    docTitle: link.get('docTitle'),
                    path: aPath.join(tp.replace('pathDelim')),
                    clientid: link.get('clientid')
                });
            }

            tp.setHTML({
                list: lst
            });
            this.appURLUpdate();
        },
        toJSON: function(){
            var links = this._links,
                ret = [];

            for (var i = 0; i < links.length; i++){
                var link = links[i];
                ret[ret.length] = {
                    linkid: link.get('id'),
                    clientid: link.get('clientid'),
                    docid: link.get('docid'),
                    elementid: link.get('elementid'),
                };
            }
            return ret;
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget,linkRow,pathItem,pathDelim'},
            owner: NS.ATTRIBUTE.owner,
            linkList: {}
        },
        CLICKS: {
            removeLink: {
                event: function(e){
                    var clientid = e.target.getData('id') | 0;
                    this.removeLinkByClientId(clientid);
                }
            }
        }
    });

    NS.LinkEditorWidget = Y.Base.create('LinkListEditorWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance, options){
            var tp = this.template,
                lst = tp.replace('option', {
                    id: 0, title: ''
                });

            appInstance.get('docList').each(function(doc){
                lst += tp.replace('option', {
                    id: doc.get('id'),
                    title: doc.get('title')
                });
            }, this);

            tp.setHTML({
                docSelect: lst
            });

            tp.one('docSelect').on('change', this._onDocChange, this);

            this.eachElSelector(function(node){
                node.on('change', this._onElSelectorChange, this);
            }, this)
        },
        destructor: function(){
            var tp = this.template;
            tp.one('docSelect').detachAll();
            for (var i = 0; i < 6; i++){
                tp.one('elSelect-' + i).detachAll();
            }
        },
        eachElSelector: function(callback, context){
            var tp = this.template,
                node, value;

            for (var i = 0; i < 6; i++){
                node = tp.one('elSelect-' + i);
                value = node.get('value');
                callback.call(context || this, node, value);
            }
        },
        docStructure: function(docid, callback){
            this.get('parent').docStructure(docid, function(elementList){
                callback.call(this, elementList);
            }, this);
        },
        _onDocChange: function(){
            var tp = this.template,
                docid = tp.getValue('docSelect') | 0;

            if (docid === this.get('docid')){
                return;
            }
            this.set('docid', docid);

            if (docid === 0){
                this.set('docStructure', null);
                this.setValue(0);
                return;
            }

            this.docStructure(docid, function(docStructure){
                this.set('docStructure', docStructure);
                this.setValue(0);
            }, this);
        },
        _onElSelectorChange: function(e){
            if (this._lockElSelectorChange){
                return;
            }

            var tp = this.template,
                level = e.target.getData('level') | 0,
                elementid = e.target.get('value') | 0;

            if (elementid === -1){
                level--;
                for (; level >= 0; level--){
                    elementid = tp.getValue('elSelect-' + level);
                    if (elementid > 0){
                        break;
                    }
                }
            }
            this.setValue(elementid);
        },
        getValue: function(){
            return this.get('elementid');
        },
        setValue: function(elementid){
            elementid = elementid | 0;
            this.set('elementid', elementid);
            this._renderSelectors(elementid)
        },
        _renderSelectors: function(elementid){
            this._lockElSelectorChange = true;

            var tp = this.template,
                docStructure = this.get('docStructure'),
                path = docStructure ? docStructure.getPath(elementid) : [];

            for (var i = 0; i < 6; i++){
                if (tp.getValue('elSelect-' + i) === path[i]){
                    continue;
                }

                if (i <= path.length){
                    this._renderSelector(i, path[i - 1] || 0);
                    tp.setValue('elSelect-' + i, path[i] || 0);
                } else {
                    tp.hide('elSelect-' + i);
                }
            }
            this._lockElSelectorChange = false;
        },
        _renderSelector: function(level, parentid){
            var tp = this.template,
                docStructure = this.get('docStructure');

            var lst = "";
            if (docStructure){
                docStructure.each(function(element){
                    if (element.get('parentid') !== parentid){
                        return;
                    }
                    lst += tp.replace('option', {
                        id: element.get('id'),
                        title: element.get('title')
                    });
                }, this);
            }

            if (lst !== ""){
                lst = tp.replace('option', {
                        id: '-1',
                        title: ''
                    }) + lst;
            }
            tp.toggleView(lst !== '', 'elSelect-' + level);
            tp.setHTML('elSelect-' + level, lst);
        },
        save: function(){
            var docid = this.get('docid') | 0,
                elementid = this.get('elementid') | 0,
                docStructure = this.get('docStructure');

            if (docid === 0 || !docStructure){
                return;
            }
            var doc = this.get('appInstance').get('docList').getById(docid),
                link = this.get('link'),
                path = docStructure.getPath(elementid),
                pathCache = [],
                parentWidget = this.get('parent');

            for (var i = 0; i < path.length; i++){
                var element = docStructure.getById(path[i]);
                pathCache[i] = {
                    id: element.get('id'),
                    title: element.get('title')
                };
            }

            link.set('docid', docid);
            link.set('docTitle', doc.get('title'));
            link.set('elementid', elementid);
            link.set('path', pathCache);

            if (link.get('id') === 0){
                parentWidget.addLink(link);
            } else {
                parentWidget.renderLinkList()
            }
            parentWidget.closeAction();
        },
        cancel: function(){
            this.get('parent').closeAction();
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'editor,select,option'},
            docid: {value: 0},
            elementid: {value: 0},
            parent: {},
            link: {},
        },
    });
};