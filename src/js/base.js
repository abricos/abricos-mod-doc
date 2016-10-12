var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['application.js']},
        {name: '{C#MODNAME}', files: ['model.js']}
    ]
};
Component.entryPoint = function(NS){

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
    };

};
