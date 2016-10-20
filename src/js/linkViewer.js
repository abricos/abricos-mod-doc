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

    NS.LinkListViewerWidget = Y.Base.create('LinkListViewerWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            appInstance.set('isBosURL', this.get('isBosURL'));

            if (this.get('linkList')){
                return this.renderLinkList();
            }

            var owner = this.get('owner');
            appInstance.linkList(owner, function(err, result){
                this.set('waiting', false);
                if (err){
                    return;
                }
                this.set('linkList', linkList);
                this.renderLinkList(result.linkList);
            }, this);
        },
        renderLinkList: function(){
            var tp = this.template,
                lst = "";

            this.get('linkList').each(function(link){

                var path = link.get('path') || [],
                    elType = link.get('elType'),
                    el = link.get('el'),
                    body = "",
                    aPath = [tp.replace('docItem', {
                        docid: link.get('docid'),
                        docTitle: link.get('docTitle'),
                    })];

                for (var ii = 0; ii < path.length; ii++){
                    aPath[aPath.length] = tp.replace('pathItem', {
                        docid: link.get('docid'),
                        elementid: path[ii].id,
                        title: path[ii].title,
                    });
                }

                switch (elType) {
                    case 'page':
                    case 'section':
                        body = tp.replace(elType, {
                            title: el.get('title')
                        });
                        break;
                    case 'text':
                        body = tp.replace(elType, {
                            body: el.get('body')
                        });
                        break;
                    case 'table':
                        body = this._renderElTable(el);
                        break;
                }

                lst += tp.replace('linkRow', {
                    docid: link.get('docid'),
                    path: aPath.join(tp.replace('pathDelim')),
                    clientid: link.get('clientid'),
                    body: body
                });

            }, this);

            tp.setHTML({
                list: lst
            });
            this.appURLUpdate();
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
                value: 'widget,linkRow,docItem,pathItem,pathDelim' +
                ',page,section,text,table,tr,th,td'
            },
            owner: NS.ATTRIBUTE.owner,
            linkList: {},
            isBosURL: {value: true}
        },
    });

};