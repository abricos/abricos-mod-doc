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

            this._wList = [];
            this._cacheStructs = {};

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
                    this.set('linkList', result.linkList);
                    this._onLoadLinkList();
                }, this);
            }, this);
        },
        destructor: function(){
            this._cleanWList();
            this.closeAction();
        },
        _onLoadLinkList: function(){

        },
        _cleanWList: function(){
            var wList = this._wList;
            for (var i = 0; i < wList.length; i++){
                wList[i].destroy();
            }
            this._wList = [];
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
                srcNode: tp.one('action'),
                parent: this,
                link: link
            });
        },
        _addLink: function(link){
            var tp = this.template;
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
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget'},
            owner: NS.ATTRIBUTE.owner,
            linkList: {}
        },
    });

    NS.LinkEditorWidget = Y.Base.create('LinkListEditorWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance, options){

            this._wList = [];

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
            this.template.one('docSelect').detachAll();
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
        cleanSelectors: function(){
            this.eachElSelector(function(node){
                node.setHTML('');
            }, this);
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
                return this.cleanSelectors();
            }
            this.docStructure(docid, function(docStructure){
                this.set('docStructure', docStructure);
                this.renderSelectors();
            }, this);
        },
        _onElSelectorChange: function(e){
            console.log(e);
        },
        renderSelectors: function(){

        },
        save: function(){
        },
        cancel: function(){
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