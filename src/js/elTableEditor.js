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
                tp.setHTML({
                    bodyPreview: el.get('body')
                });
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
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget'},
        },
    });

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
                    row: r,
                    col: c
                });
                this.add(cell);
            }, this);
        }
    });

    NS.ElTableCellListEditorWidget = Y.Base.create('ElTableCellListEditorWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            this.rebuild();
        },
        rebuild: function(){
            var tp = this.template,
                cellList = this.get('el').get('cellList');

            cellList.rebuild();

            var lstHead = "",
                rows = [],
                clientid;

            cellList.eachCell(function(r, c, cell){
                clientid = cell.get('clientid');
                if (r === 0){
                    lstHead += tp.replace('th', {
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

            console.log({
                heads: lstHead,
                rows: lst
            });
            tp.setHTML('table', tp.replace('table', {
                heads: lstHead,
                rows: lst
            }));

            var node;

            cellList.eachCell(function(r, c, cell){
                clientid = cell.get('clientid');
                if (r === 0){
                    // node = tp.one('th');
                }
            }, this);

        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'editor,table,tr,th,td'},
            el: {}
        },
    });


};

