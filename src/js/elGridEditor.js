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

    NS.ElRowEditorWidget = Y.Base.create('ElRowEditorWidget', SYS.AppWidget, [
        NS.ElEditorWidgetExt,
        NS.ElContainerEditorWidgetExt,
    ], {
        onSyncElData: function(tp, el, forced){
        },
        onModeChange: function(mode){
            var tp = this.template,
                el = this.get('el');

            if (mode === 'preview'){
            } else if (mode === 'edit'){
            }
        },        
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'row'},
        }
    });

    NS.ElColEditorWidget = Y.Base.create('ElColEditorWidget', SYS.AppWidget, [
        NS.ElEditorWidgetExt,
        NS.ElContainerEditorWidgetExt,
    ], {
        onSyncElData: function(tp, el, forced){
        },
        onModeChange: function(mode){
            var tp = this.template,
                el = this.get('el');

            if (mode === 'preview'){
            } else if (mode === 'edit'){
            }
        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'col'},
        }
    });

};
