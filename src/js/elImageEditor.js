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
            var title = tp.getValue('title'),
                filehash = tp.getValue('filehash');

            if (!forced
                && el.get('title') === title
                && el.get('filehash') === filehash){
                return false;
            }

            el.set('title', title);
            el.set('filehash', filehash);
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
                if (el.get('filehash') !== ''){
                    tp.setHTML('imagePreview', tp.replace('imagePreview', {
                        filehash: el.get('filehash')
                    }));
                }
            } else if (mode === 'edit'){
                tp.setValue('title', el.get('title'));
                tp.setValue('filehash', el.get('filehash'));

                this._renderEditImage();
            }
        },
        _renderEditImage: function(){
            var tp = this.template,
                filehash = tp.getValue('filehash');

            if (filehash === ''){
                tp.setHTML('image', tp.replace('empty'));
            } else {
                tp.setHTML('image', tp.replace('image', {
                    filehash: filehash
                }));
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
        setImageByFID: function(filehash, fname){
            var tp = this.template,
                el = this.get('el');

            tp.setValue('filehash', filehash);
            if (tp.getValue('title') === ''){
                tp.setValue('title', fname);
            }
            this._renderEditImage();
        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget,image,empty,imagePreview'},
        }
    });
};
