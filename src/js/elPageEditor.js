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
        syncElData: function(tp, el){
            el.set('title', tp.getValue('title'));
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
        toJSON: function(el){
            return {
                title: el.get('title')
            };
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
