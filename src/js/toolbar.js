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

    var ButtonElementAppendExt = function(){
    };
    ButtonElementAppendExt.prototype = {
        _renderTypeList: function(){
            var tp = this.template,
                i18n = this.language,
                lst = "";

            this.get('appInstance').get('elementTypeList').each(function(type){
                lst += tp.replace('option', {
                    id: type.get('id'),
                    title: i18n.get('element.' + type.get('id'))
                });
            }, this);

            tp.setHTML('typeList', lst);
        },
    };

    NS.ButtonElementAppendWidget = Y.Base.create('ButtonElementAppendWidget', SYS.AppWidget, [
        ButtonElementAppendExt
    ], {
        onInitAppWidget: function(err, appInstance){
            this._renderTypeList();
        },
        elementAppend: function(){
            var tp = this.template,
                context = this.get('context'),
                callback = this.get('callback');

            if (!Y.Lang.isFunction(callback)){
                return;
            }

            callback.call(context || this, tp.getValue('typeList'));
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget,option'},
            context: {value: null},
            callback: {value: null}
        },
    });

    NS.ElementToobarWidget = Y.Base.create('ElementToobarWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            var tp = this.template,
                i18n = this.language,
                element = this.get('element');

            var type = appInstance.get('elementTypeList').getById(element.get('type'));

            tp.setHTML({
                typeTitle: i18n.get('element.' + type.get('id'))
            });
        },
        updateAccordion: function(val){
            this.triggerHide('accordion');
            this.triggerShow('accordion', val);

            var tp = this.template,
                element = this.get('element');

            tp.toggleView(val === 'collapse', 'elMiniTitle');
            if (element && val === 'collapse'){
                tp.setHTML('elMiniTitle', element.get('title'));
            }
        },
        expand: function(){
            this.get('owner').set('accordion', 'expand');
        },
        collapse: function(){
            this.setPreviewMode();
            this.get('owner').set('accordion', 'collapse');
        },
        moveUp: function(){
            this.get('owner').moveUp();
        },
        moveDown: function(){
            this.get('owner').moveDown();
        },
        updateMode: function(mode){
            this.triggerHide('mode');
            this.triggerShow('mode', mode);
        },
        setEditMode: function(){
            this.expand();
            this.get('owner').set('mode', 'edit');
        },
        setPreviewMode: function(){
            this.get('owner').set('mode', 'preview');
        },
        showRemove: function(){
            var tp = this.template;
            tp.setHTML('removePanel', tp.replace('remove'));
            tp.toggleView(true, 'removePanel', 'buttons');
        },
        closeRemove: function(){
            var tp = this.template;
            tp.toggleView(false, 'removePanel', 'buttons');
        },
        remove: function(){
            this.get('owner').remove();
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'mode,remove'},
            element: NS.ATTRIBUTE.element,
            owner: {}
        },
    });

};
