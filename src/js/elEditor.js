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

    NS.ElementTitleEditorWidget = Y.Base.create('ElementTitleEditorWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            var tp = this.template,
                element = this.get('element'),
                checked = element.get('isAutoTitle');

            tp.setValue({
                isAuto: checked,
                title: element.get('title')
            });
            tp.one('title').set('disabled', checked);

            tp.one('isAuto').on('change', this._onAutoChecked, this);
        },
        destructor: function(){
            this.template.one('isAuto').detachAll();
        },
        isAutoTitle: function(){
            return !!this.template.getValue('isAuto');
        },
        getTitle: function(){
            return this.template.getValue('title');
        },
        setTitle: function(title){
            return this.template.setValue('title', title);
        },
        _onAutoChecked: function(){
            var tp = this.template,
                element = this.get('element'),
                checked = this.isAutoTitle();

            tp.one('title').set('disabled', checked);
            element.set('changed', true);
            this.get('parent')._syncElData();
        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'miniTitle'},
            element: NS.ATTRIBUTE.element,
            parent: {}
        },
    });


    var ElEditorWidgetExt = function(){
    };
    ElEditorWidgetExt.ATTRS = {
        doc: NS.ATTRIBUTE.doc,
        element: NS.ATTRIBUTE.element,
        el: NS.ATTRIBUTE.el,
        clientid: NS.ATTRIBUTE.clientid,
        mode: {
            value: 'preview',
            validator: function(val){
                switch (val) {
                    case 'edit':
                    case 'preview':
                    case 'view':
                        return true;
                }
                return false;
            }
        },
        accordion: {
            value: 'collapse',
            validator: function(val){
                switch (val) {
                    case 'collapse':
                    case 'expand':
                        return true;
                }
                return false;
            }
        },
        owner: {}
    };
    ElEditorWidgetExt.prototype = {
        onInitAppWidget: function(err, appInstance){
            if (Y.Lang.isFunction(this.onBeforeInitElEditor)){
                this.onBeforeInitElEditor();
            }
            this.initElementEditor();
            if (Y.Lang.isFunction(this.onAfterInitElEditor)){
                this.onAfterInitElEditor();
            }
        },
        destructor: function(){
            if (this._toolbarWidget){
                this._toolbarWidget.destroy();
                this._toolbarWidget = null;
            }
            if (this._titleEditorWidget){
                this._titleEditorWidget.destroy();
                this._titleEditorWidget = null;
            }
        },
        initElementEditor: function(){
            var tp = this.template,
                element = this.get('element');

            if (tp.one('toolbarWidget')){
                this._toolbarWidget = new NS.ElementToobarWidget({
                    srcNode: tp.one('toolbarWidget'),
                    element: element,
                    owner: this
                });
            }

            if (tp.one('elementTitleWidget')){
                this._titleEditorWidget = new NS.ElementTitleEditorWidget({
                    srcNode: tp.one('elementTitleWidget'),
                    element: element,
                    parent: this
                });
            }

            if (this.get('isElContainer')){
                this._initElContainerEditor();
            }

            this.after('modeChange', function(e){
                this._onModeChange(e.newVal, e.prevVal);
            }, this);

            this._onModeChange(this.get('mode'), this.get('mode'));

            this.after('accordionChange', function(e){
                this._onAccordionChange(e.newVal, e.prevVal);
            }, this);

            this._onAccordionChange(this.get('accordion'));
        },
        _syncElData: function(mode){
            mode = mode || this.get('mode');

            if (mode !== 'edit'){
                return;
            }
            var tp = this.template,
                element = this.get('element'),
                el = this.get('el');

            if (this.onSyncElData(tp, el, element.get('changed'))){
                element.set('changed', true);
            }
        },
        onSyncElData: function(tp, el){
        },
        _parseTitle: function(text, isParse){
            if (isParse){
                var div = document.createElement('DIV');
                div.innerHTML = text;
                text = div.textContent || div.innerText || "";
            }

            text = text.replace(/(\r\n|\n|\r)/gm, " ")
                .replace(/\s{2,}/g, ' ')
                .replace(/^\s+|\s+$/g, '');

            var len = 50;

            if (text.length > len){
                text = text.substring(0, len - 3) + '...';
            }
            return text;
        },
        syncTitle: function(text, isParse){
            var titleWidget = this._titleEditorWidget,
                element = this.get('element');

            text = this._parseTitle(text, isParse);

            if (!titleWidget){
                element.set('title', text);
                element.set('isAutoTitle', true);
                return;
            }

            var isAutoPrev = element.get('isAutoTitle'),
                isAutoCurr = titleWidget.isAutoTitle();

            element.set('isAutoTitle', isAutoCurr);

            if (!isAutoCurr){
                element.set('title', titleWidget.getTitle());
            } else {
                if (isAutoPrev !== isAutoCurr){
                    titleWidget.setTitle(text);
                }
                element.set('title', text);
            }
        },
        _onModeChange: function(mode, prevMode){
            this._syncElData(prevMode);

            var tp = this.template;

            tp.toggleView(mode === 'edit', 'editorPanel', 'previewPanel');
            if (this._toolbarWidget){
                this._toolbarWidget.updateMode(mode);
            }

            this.onModeChange(mode)
        },
        onModeChange: function(mode){
        },
        _onAccordionChange: function(val){
            var tp = this.template;
            tp.toggleView(val === 'expand', 'panelBody,panelFooter', 'collapsePanel');

            if (this._toolbarWidget){
                this._toolbarWidget.updateAccordion(val);
            }

            this.onAccordionChange(val);
        },
        onAccordionChange: function(val){
        },
        remove: function(){
            this.get('owner').childRemove(this);
        },
        moveUp: function(){
            this.get('owner').childMoveUp(this);
        },
        moveDown: function(){
            this.get('owner').childMoveDown(this);
        },
        _toJSON: function(){
            this._syncElData(this.get('mode'));

            var element = this.get('element'),
                el = this.get('el'),
                ret = {
                    clientid: this.get('clientid'),
                };

            if (element){
                ret = Y.merge({
                    elementid: element.get('id'),
                    parentid: element.get('parentid'),
                    title: element.get('title'),
                    isAutoTitle: element.get('isAutoTitle'),
                    type: element.get('type'),
                    el: {},
                    changed: element.get('changed')
                }, ret || {});

                if (element.get('changed')){
                    ret.el = el.toSave();
                }
            }

            if (this.get('isElContainer')){
                this.childEach(function(child){
                    if (!ret.childs){
                        ret.childs = [];
                    }
                    ret.childs[ret.childs.length] = child._toJSON();
                }, this);
            }

            return ret;
        },
        toJSON: function(el){
            return {};
        },
        _onSave: function(docSave){
            if (this.get('isElContainer')){
                this.childEach(function(child){
                    child._onSave(docSave);
                }, this);
            }

            var element = this.get('element');

            if (!element){
                return;
            }

            var clientid = this.get('clientid'),
                eSave = docSave.getByClientId(clientid);

            if (!eSave){
                return;
            }
            element.set('id', eSave.get('elementid'));
            element.set('changed', false);

            if (Y.Lang.isFunction(this.onSave)){
                this.onSave(eSave);
            }
        }
    };
    NS.ElEditorWidgetExt = ElEditorWidgetExt;

    var ElContainerEditorWidgetExt = function(){
    };
    ElContainerEditorWidgetExt.ATTRS = {
        isElContainer: {
            readOnly: true,
            value: true
        }
    };
    ElContainerEditorWidgetExt.prototype = {
        initializer: function(){
            this._wChilds = [];
        },
        destructor: function(){
            if (this._elAppendWidget){
                this._elAppendWidget.destroy();
                this._elAppendWidget = null;
            }
            this.cleanChilds();
        },
        _initElContainerEditor: function(){
            var tp = this.template,
                element = this.get('element');

            if (tp.one('elementAppend')){
                this._elAppendWidget = new NS.ButtonElementAppendWidget({
                    srcNode: tp.one('elementAppend'),
                    doc: this.get('doc'),
                    context: this,
                    callback: this.elementAppendByType
                });
            }
        },
        cleanChilds: function(){
            var wList = this._wChilds;
            for (var i = 0; i < wList.length; i++){
                wList[i].destroy();
            }
            this._wChilds = [];
        },
        childEach: function(fn, context){
            var wList = this._wChilds;
            for (var i = 0; i < wList.length; i++){
                fn.call(context || this, wList[i]);
            }
        },
        elementAppendByType: function(type, elOptions){
            var appInstance = this.get('appInstance'),
                element = this.get('element'),
                Element = appInstance.get('Element'),
                childElement = new Element({
                    appInstance: appInstance,
                    isAutoTitle: true,
                    changed: true,
                    type: type,
                    parentid: element ? element.get('parentid') : 0,
                    el: appInstance.instanceElItem(type, elOptions),
                    ord: this._wChilds.length
                });

            var w = this.elementAppend(childElement);
            w.set('mode', 'edit');
            w.set('accordion', 'expand');
        },
        elementAppend: function(element){
            var tp = this.template,
                type = element.get('type'),
                upName = NS.upperFirstChar(type),
                widgetName = 'El' + upName + 'EditorWidget',
                wList = this._wChilds,
                srcNode = tp.append('container', '<div></div>');

            var widget = new (NS[widgetName])({
                srcNode: srcNode,
                doc: this.get('doc'),
                owner: this,
                element: element
            });
            wList[wList.length] = widget;
            return widget;
        },
        childRemove: function(w){
            var wList = this._wChilds,
                nList = [];

            for (var i = 0; i < wList.length; i++){
                if (wList[i] === w){
                    wList[i].destroy();
                } else {
                    nList[nList.length] = wList[i];
                }
            }
            this._wChilds = nList;
        },
        _childMove: function(w, method){
            var wList = this._wChilds,
                item, prevItem, nextItem,
                ord, prevOrd, nextOrd,
                el, prevEl, nextEl,
                isChange = false;

            for (var i = 0; i < wList.length; i++){
                item = wList[i];
                if (item === w){
                    el = item.get('element');
                    ord = el.get('ord');
                    if (method === 'up' && i > 0){
                        prevItem = wList[i - 1];
                        prevEl = prevItem.get('element');
                        prevOrd = prevEl.get('ord');
                        prevEl.set('ord', ord);
                        prevEl.set('changed', true);
                        el.set('ord', prevOrd);
                        el.set('changed', true);
                    } else if (method === 'down' && i < wList.length - 1){
                        nextItem = wList[i + 1];
                        nextEl = nextItem.get('element');
                        nextOrd = nextEl.get('ord');
                        nextEl.set('ord', ord);
                        nextEl.set('changed', true);
                        el.set('ord', nextOrd);
                        el.set('changed', true);
                    } else {
                        return;
                    }
                    isChange = true;
                }
            }
            if (!isChange){
                return;
            }

            var list = this._createTempElList();
            list = list.sort(function(i1, i2){
                if (i1.ord > i2.ord){
                    return 1;
                } else if (i1.ord < i2.ord){
                    return -1;
                }
                return 0;
            });
            this.cleanChilds();
            this._renderChildElements(list, this);
        },
        _createTempElList: function(){
            var list = [], item, element;

            this.childEach(function(w){
                element = w.get('element');
                item = {
                    element: element,
                    ord: element.get('ord')
                };
                if (w._createTempElList){
                    item.childs = w._createTempElList();
                }
                list[list.length] = item;
            }, this);

            return list;
        },
        _renderChildElements: function(list, widget){
            for (var i = 0, item, childWidget; i < list.length; i++){
                item = list[i];
                childWidget = widget.elementAppend(item.element);
                if (item.childs && childWidget._renderChildElements){
                    childWidget._renderChildElements(item.childs, childWidget);
                }
            }
        },
        childMoveUp: function(w){
            this._childMove(w, 'up');
        },
        childMoveDown: function(w){
            this._childMove(w, 'down');
        }
    };
    NS.ElContainerEditorWidgetExt = ElContainerEditorWidgetExt;
};
