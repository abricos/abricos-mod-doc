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

    NS.ElPageEditorWidget = Y.Base.create('ElPageEditorWidget', SYS.AppWidget, [
        NS.ElEditorWidgetExt,
        NS.ElContainerEditorWidgetExt
    ], {
        syncElData: function(){
            var tp = this.template,
                el = this.get('el');

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
        toJSON: function(){
            var el = this.get('el');

            var ret = {
                title: el.get('title')
            };

            return ret;
        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget'},
        },
        parseURLParam: function(args){
            return {
                docid: args[0] | 0
            }
        }
    });
};
