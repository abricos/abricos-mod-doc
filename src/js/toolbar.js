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

    NS.ButtonElementAppendWidget = Y.Base.create('ButtonElementAppendWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            var tp = this.template,
                i18n = this.language,
                lst = "";

            appInstance.get('elementTypeList').each(function(type){
                lst += tp.replace('option', {
                    id: type.get('id'),
                    title: i18n.get('element.' + type.get('id'))
                });
            }, this);

            tp.setHTML('typeList', lst);
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
        setEditMode: function(){
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
