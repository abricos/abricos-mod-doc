var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['elEditor.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    var ElSectionEditorWidgetExt = function(){
    };
    ElSectionEditorWidgetExt.prototype = {
        onSyncElData: function(tp, el, forced){
            var title = tp.getValue('title');
            if (!forced && el.get('title') === title){
                return false;
            }

            el.set('title', title);
            this.syncTitle(title);

            return true;
        },
        onModeChange: function(mode){
            var tp = this.template,
                el = this.get('el');

            if (mode === 'preview'){
                tp.setHTML({
                    titlePreview: el.get('title')
                });
            } else if (mode === 'edit'){
                tp.setValue('title', el.get('title'))
            }
        },
    };

    NS.ElPageEditorWidget = Y.Base.create('ElPageEditorWidget', SYS.AppWidget, [
        NS.ElEditorWidgetExt,
        NS.ElContainerEditorWidgetExt,
        ElSectionEditorWidgetExt
    ], {}, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'page'},
        }
    });

    NS.ElSectionEditorWidget = Y.Base.create('ElSectionEditorWidget', SYS.AppWidget, [
        NS.ElEditorWidgetExt,
        NS.ElContainerEditorWidgetExt,
        ElSectionEditorWidgetExt
    ], {}, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'section'},
        }
    });

};
