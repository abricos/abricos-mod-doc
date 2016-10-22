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

    var ColSize = function(template, nodeid, val){
        this.template = template;
        this.nodeid = nodeid;

        this.init();
        if (val){
            this.setValue(val);
        }
    };
    ColSize.prototype = {
        init: function(){
            var tp = this.template,
                lst = "";

            for (var i = 1; i <= 12; i++){
                lst += tp.replace('option', {i: i});
            }

            tp.setHTML(this.nodeid, lst);
        },
        setValue: function(val){
            this.template.setValue(this.nodeid, val);
        },
        getValue: function(){
            return this.template.getValue(this.nodeid) | 0;
        }
    };

    NS.ElRowEditorWidget = Y.Base.create('ElRowEditorWidget', SYS.AppWidget, [
        NS.ElEditorWidgetExt,
        NS.ElContainerEditorWidgetExt,
    ], {
        onBeforeInitElEditor: function(){
            this.colSize = new ColSize(this.template, 'colSize', 3);
        },
        onSyncElData: function(tp, el, forced){
            return false;
        },
        onModeChange: function(mode){
            var tp = this.template,
                el = this.get('el');

            if (mode === 'preview'){
            } else if (mode === 'edit'){

            }
        },
        colAppend: function(){
            var tp = this.template,
                colType = tp.getValue('colType'),
                colSize = tp.getValue('colSize'),
                options = {};
            options[colType] = colSize;

            this.elementAppendByType('col', options);
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'row,option'},
        }
    });

    NS.ElColEditorWidget = Y.Base.create('ElColEditorWidget', SYS.AppWidget, [
        NS.ElEditorWidgetExt,
        NS.ElContainerEditorWidgetExt,
    ], {
        onBeforeInitElEditor: function(){
            var tp = this.template,
                el = this.get('el');

            this.colSize = {
                sm: new ColSize(tp, 'sm', el.get('sm'))
            };

            this.applyOptions();
        },
        onSyncElData: function(tp, el, forced){
            var sm = this.colSize['sm'].getValue();
            if (!forced && el.get('sm') === sm){
                return false;
            }

            el.set('sm', sm);
            this.syncTitle('col-sm-' + sm);

            return true;
        },
        onModeChange: function(mode){
            var tp = this.template,
                el = this.get('el');

            if (mode === 'preview'){
            } else if (mode === 'edit'){
            }
        },
        _cleanColClasses: function(){
            var bBox = this.get('boundingBox');
            for (var i = 1; i <= 12; i++){
                bBox.removeClass('col-sm-' + i);
            }
        },
        applyOptions: function(){
            var bBox = this.get('boundingBox'),
                sm = this.colSize['sm'].getValue();

            this._cleanColClasses();
            bBox.addClass('col-sm-' + sm);
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'col,option'},
        }
    });

};
