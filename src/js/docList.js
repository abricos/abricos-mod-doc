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

    NS.DocListWidget = Y.Base.create('docListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance, options){
            this.reloadDocList();
        },
        reloadDocList: function(){
            this.set('waiting', true);

            var appInstance = this.get('appInstance');
            appInstance.docList(function(err, result){
                this.set('waiting', false);
                if (err){
                    return;
                }
                this.set('docList', result.docList);
                this.renderDocList();
            }, this);
        },
        renderDocList: function(){
            var docList = this.get('docList');
            if (!docList){
                return;
            }

            var tp = this.template,
                lst = "";

            docList.each(function(doc){
                var attrs = doc.toJSON();
                lst += tp.replace('row', attrs);
            });
            tp.gel('list').innerHTML = tp.replace('list', {
                'rows': lst
            });

            this.appURLUpdate();
        },
        _move: function(method, docid){
            docid = docid | 0;

            var list = [],
                index = 0;

            this.get('docList').each(function(doc){
                doc.set('ord', index++);
                list[list.length] = doc;
            }, this);

            var item, prevItem, nextItem,
                ord, prevOrd, nextOrd,
                isChange = false;

            for (var i = 0; i < list.length; i++){
                item = list[i];
                if (item.get('id') === docid){
                    ord = item.get('ord');
                    if (method === 'up' && i > 0){
                        prevItem = list[i - 1];
                        prevOrd = prevItem.get('ord');
                        prevItem.set('ord', ord);
                        item.set('ord', prevOrd);
                    } else if (method === 'down' && i < list.length - 1){
                        nextItem = list[i + 1];
                        nextOrd = nextItem.get('ord');
                        nextItem.set('ord', ord);
                        item.set('ord', nextOrd);
                    } else {
                        return;
                    }
                    isChange = true;
                }
            }
            if (!isChange){
                return;
            }
            var orders = [];
            this.get('docList').each(function(doc){
                orders[orders.length] = {
                    docid: doc.get('id'),
                    ord: doc.get('ord')
                };
            }, this);

            this.set('waiting', true);
            this.get('appInstance').docListSort(orders, function(err, result){
                this.set('waiting', false);
                if (err){
                    return;
                }
                this.set('docList', result.docList);
                this.renderDocList();
            }, this);
        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget,list,row'}
        },
        CLICKS: {
            moveUp: {
                event: function(e){
                    var docid = (e.defineTarget || e.target).getData('id') | 0;
                    this._move('up', docid);
                }
            },
            moveDown: {
                event: function(e){
                    var docid = (e.defineTarget || e.target).getData('id') | 0;
                    this._move('down', docid);
                }
            }
        }
    });
};