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

    NS.ElImageEditorWidget = Y.Base.create('ElImageEditorWidget', SYS.AppWidget, [
        NS.ElEditorWidgetExt
    ], {
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
        upload: function(){
            if (this.uploadWindow && !this.uploadWindow.closed){
                this.uploadWindow.focus();
                return;
            }
            var url = '/{C#MODNAME}/imageUpload/';
            this.uploadWindow = window.open(
                url, 'pictabUploadImage',
                'statusbar=no,menubar=no,toolbar=no,scrollbars=yes,resizable=yes,width=550,height=500'
            );
            NS.activeElImageEditor = this;
        },
        setImageByFID: function(fid, fname){
            var tp = this.template,
                el = this.get('el');
            el.set('filehash', fid);

            if (tp.getValue('title') === ''){
                tp.setValue('title', fname);
            }
        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'image'},
        }
    });
};
