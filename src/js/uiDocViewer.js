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

    NS.UIDocListWidget = Y.Base.create('UIDocListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            useExistingWidget: {value: true},
        },
    });

};
