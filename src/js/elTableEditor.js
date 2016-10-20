var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['editor.js']},
        {name: '{C#MODNAME}', files: ['elEditor.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.ElTableCellListEditor = Y.Base.create('elTableCellListEditor', NS.ElTableCellList, [], {
        idField: 'clientid',
        rebuild: function(){
            var appInstance = this.appInstance,
                ElTableCell = appInstance.get('ElTableCell');

            this.eachCell(function(r, c, cell){
                if (cell){
                    return;
                }

                cell = new ElTableCell({
                    appInstance: appInstance,
                    row: r, col: c,
                    type: NS.ElTableCell.SIMPLE
                });
                this.add(cell);
            }, this);
        }
    });

    NS.ElTableEditorWidget = Y.Base.create('ElTableEditorWidget', SYS.AppWidget, [
        NS.ElEditorWidgetExt
    ], {
        onBeforeInitElEditor: function(){
            var el = this.get('el'),
                cellList = el.get('cellList');

            if (el.get('id') === 0){
                el.set('colCount', 2);
                el.set('rowCount', 2);
            }

            if (cellList.name !== 'elTableCellList'){
                return;
            }

            var cellListEditor = new NS.ElTableCellListEditor({
                appInstance: this.get('appInstance'),
                el: el
            });

            cellList.each(function(cell){
                cellListEditor.add(cell);
            }, this);

            el.set('cellList', cellListEditor);
        },
        destructor: function(){
            this._destroyEditorWidget();
        },
        _destroyEditorWidget: function(){
            if (!this._cellListEditorWidget){
                return;
            }
            this._cellListEditorWidget.destroy();
            this._cellListEditorWidget = null;
        },
        onSyncElData: function(tp, el, forced){
            var body = this._cellListEditorWidget.get('content');
            if (!forced && el.get('body') === body){
                return false;
            }

            el.set('body', body);
            this.syncTitle(body, true);

            return true;
        },
        onModeChange: function(mode){
            var tp = this.template,
                el = this.get('el');

            if (mode === 'preview'){
                this._destroyEditorWidget();

            } else if (mode === 'edit'){
                if (this._cellListEditorWidget){
                    return;
                }

                tp.setValue({
                    rowCount: el.get('rowCount'),
                    colCount: el.get('colCount'),
                });

                this._cellListEditorWidget = new NS.ElTableCellListEditorWidget({
                    srcNode: tp.one('cellListEditor'),
                    el: el
                });

            }
        },
        applyOptions: function(){
            var tp = this.template,
                el = this.get('el'),
                rowCount = Math.max(tp.getValue('rowCount') | 0, 1),
                colCount = Math.max(tp.getValue('colCount') | 0, 1);

            el.set('rowCount', rowCount);
            el.set('colCount', colCount);

            this._cellListEditorWidget.rebuild();
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget'},
        },
    });

    NS.ElTableCellListEditorWidget = Y.Base.create('ElTableCellListEditorWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            this.rebuild();
        },
        destructor: function(){
            this._cleanWidgets();
        },
        _cleanWidgets: function(){
            this.get('el').get('cellList').each(function(cell){
                if (cell.widget){
                    cell.widget.destroy();
                    cell.widget = null;
                }
            }, this);
        },
        rebuild: function(){
            var tp = this.template,
                el = this.get('el'),
                cellList = el.get('cellList');

            this._cleanWidgets();

            cellList.rebuild();

            var lstHead = "",
                rows = [],
                clientid;

            cellList.eachCell(function(r, c, cell){
                clientid = cell.get('clientid');
                if (r === 0){
                    lstHead += tp.replace('td', {
                        clientid: clientid
                    });
                } else {
                    if (c === 0){
                        rows[r - 1] = "";
                    }
                    rows[r - 1] += tp.replace('td', {
                        clientid: clientid
                    });
                }
            }, this);

            var lst = "";
            for (var i = 0; i < rows.length; i++){
                lst += tp.replace('tr', {
                    cols: rows[i]
                });
            }

            tp.setHTML('table', tp.replace('table', {
                heads: lstHead,
                rows: lst
            }));

            cellList.eachCell(function(r, c, cell){
                clientid = cell.get('clientid');

                cell.widget = new NS.ElTableCellEditorWidget({
                    srcNode: tp.append('td.id-' + clientid, '<div></div>'),
                    el: el,
                    cell: cell
                });

            }, this);

        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'editor,table,tr,td'},
            el: {}
        },
    });


    NS.ElTableCellEditorWidget = Y.Base.create('ElTableCellEditorWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            var tp = this.template,
                cell = this.get('cell');

            tp.setValue('typeSelect', cell.get('type'));

            tp.one('typeSelect').on('change', this._onTypeChange, this);

            this._onTypeChange();
        },
        destructor: function(){
            this.onSyncElData();

            this._editorDestroy();
            var tp = this.template;

            tp.one('typeSelect').detachAll();
        },
        _editorDestroy: function(){
            if (!this._editorWidget){
                return;
            }
            this._editorWidget.destroy();
            this._editorWidget = null;
        },
        onSyncElData: function(){
            if (!this._currentType){
                return;
            }

            var tp = this.template,
                body = "";

            switch (this._currentType) {
                case NS.ElTableCell.SIMPLE:
                    body = tp.getValue('simple');
                    break;
                case NS.ElTableCell.VISUAL:
                    body = this._editorWidget.get('content');
                    break;
            }
            this.get('cell').set('body', body);
        },
        _onTypeChange: function(){
            var tp = this.template,
                type = tp.getValue('typeSelect'),
                cell = this.get('cell'),
                TYPE = NS.ElTableCell;

            if (this._currentType === type){
                return;
            }

            this.onSyncElData();

            tp.hide('simple,visual');
            tp.show(type);

            switch (type) {
                case TYPE.SIMPLE:
                    tp.setValue('simple', cell.get('body'));
                    break;
                case TYPE.VISUAL:
                    if (!this._editorWidget){
                        this._editorWidget = new SYS.Editor({
                            appInstance: this.get('appInstance'),
                            srcNode: tp.append('visual', '<div></div>'),
                            content: cell.get('body'),
                            toolbar: SYS.Editor.TOOLBAR_MINIMAL
                        });
                    } else {
                        this._editorWidget.set('content', cell.get('body'));
                    }
                    break;
            }

            cell.set('type', type);

            this._currentType = type;
        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'cell'},
            el: {},
            cell: {}
        },
    });

};

