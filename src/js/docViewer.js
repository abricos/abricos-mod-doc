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

    NS.DocViewerWidget = Y.Base.create('DocViewerWidget', SYS.AppWidget, [], {
        buildTData: function(){
            return {
                docid: this.get('docid')
            };
        },
        onInitAppWidget: function(err, appInstance){
            var docid = this.get('docid');

            appInstance.doc(docid, function(err, result){
                this.set('waiting', false);
                if (err){
                    return;
                }
                this.set('doc', result.doc);
                this.renderDoc();
            }, this);
        },
        renderDoc: function(){
            var tp = this.template,
                doc = this.get('doc');

            var body = this._renderElements(0);

            tp.setHTML({
                title: doc.get('title'),
                body: body
            });
        },
        _renderElements: function(parentid){
            var tp = this.template,
                lst = "",
                el, type, id;
            this.get('doc').elEach(parentid, function(element){
                id = element.get('id');
                type = element.get('type');
                el = element.get('el');

                switch (type) {
                    case 'page':
                    case 'section':
                        lst += tp.replace(type, {
                            id: id,
                            title: el.get('title'),
                            childs: this._renderElements(id)
                        });
                        break;
                    case 'text':
                        lst += tp.replace(type, {
                            id: id,
                            body: el.get('body')
                        });
                        break;
                    case 'row':
                        lst += tp.replace(type, {
                            id: id,
                            childs: this._renderElements(id)
                        });
                        break;
                    case 'col':
                        lst += this._renderElCol(el);
                        break;
                    case 'image':
                        lst += this._renderElImage(el);
                        break;
                    case 'table':
                        lst += this._renderElTable(el);
                        break;
                }
            }, this);

            return lst;
        },
        _renderElCol: function(el){
            var tp = this.template,
                id = el.get('id'),
                classes = [];

            classes[classes.length] = 'col-sm-'+el.get('sm');

            return tp.replace('col', {
                id: id,
                classes: classes.join(' '),
                childs: this._renderElements(id)
            });
        },
        _renderElImage: function(el){
            var tp = this.template,
                id = el.get('id');

            return tp.replace('image', {
                id: id,
                filehash: el.get('filehash')
            });
        },
        _renderElTable: function(el){
            var tp = this.template,
                cellList = el.get('cellList'),
                lstHead = "",
                rows = [];

            cellList.eachCell(function(r, c, cell){
                if (!cell){
                    return;
                }
                if (r === 0){
                    lstHead += tp.replace('th', {
                        body: cell.get('body')
                    });
                } else {
                    c === 0 ? rows[r - 1] = "" : null;
                    rows[r - 1] += tp.replace('td', {
                        body: cell.get('body')
                    });
                }
            }, this);

            var lst = "";
            for (var i = 0; i < rows.length; i++){
                lst += tp.replace('tr', {cols: rows[i]});
            }

            return tp.replace('table', {
                heads: lstHead,
                rows: lst
            });
        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {
                value: 'widget,page,section' +
                ',text,table,tr,th,td' +
                ',row,col,image'
            },
            docid: NS.ATTRIBUTE.docid,
            doc: NS.ATTRIBUTE.doc
        },
        parseURLParam: function(args){
            return {
                docid: args[0] | 0
            }
        }
    });
};
