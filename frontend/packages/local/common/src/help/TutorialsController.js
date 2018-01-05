Ext.define('common.help.TutorialsController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.tutorials',

    onSelect: function (sm, record) {
        var me = this,
            panel = me.lookupReference('video'),
            iframe;

        // iframe = Ext.create('Ext.ux.IFrame', {
        //     flex: 1,
        //     src: record.get('ttr_src')
        // });

        iframe = Ext.create('Ext.Component', {
            flex: 1,
            html: '<iframe src=\"'+record.get('ttr_src')+'\"' +
                        'allowfullscreen=\"allowfullscreen\"' +
                        'mozallowfullscreen=\"mozallowfullscreen\"' +
                        'msallowfullscreen=\"msallowfullscreen\"' +
                        'oallowfullscreen=\"oallowfullscreen\"' +
                        'webkitallowfullscreen=\"webkitallowfullscreen\"' +
                        'width=\"100%\" height=\"100%\">' +
                '</iframe>'
        });


        panel.removeAll();
        panel.add(iframe);

    }

});
