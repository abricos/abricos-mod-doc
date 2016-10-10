var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['application.js']},
        {name: '{C#MODNAME}', files: ['model.js']}
    ]
};
Component.entryPoint = function(NS){

    NS.ATTRIBUTE = {
        docid: {
            value: 0,
            setter: function(val){
                return val | 0;
            }
        },
        doc: {value: null},
    };
};
