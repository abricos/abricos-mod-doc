var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['application.js', 'appModel.js']},
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI;

    NS.clientid = 1;
    NS.incClientId = function(){
        return NS.clientid++;
    };

    NS.upperFirstChar = function(s){
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    var number = {
        value: 0,
        setter: function(val){
            return val | 0;
        }
    };

    NS.isOwner = function(val){
        if (!val){
            return false;
        }
        if (val.module && val.type && val.ownerid){
            return true;
        }
        if (!Y.Lang.isFunction(val.get)){
            return false;
        }
        return true;
    };


    NS.ATTRIBUTE = {
        number: number,
        docid: number,
        doc: {value: null},
        element: {value: null},
        el: {
            readOnly: true,
            getter: function(){
                var element = this.get('element');
                return element ? element.get('el') : null;
            }
        },
        clientid: {
            readOnly: true,
            getter: function(){
                if (!this._elClientId){
                    this._elClientId = NS.incClientId();
                }
                return this._elClientId;
            },
        },
        owner: {
            validator: NS.isOwner,
            setter: function(val){
                if (val.module && val.type && val.ownerid){
                    return this.get('appInstance').get('ownerList').getOwner(val.module, val.type, val.ownerid);
                }
                return val;
            }
        },
    };

};
