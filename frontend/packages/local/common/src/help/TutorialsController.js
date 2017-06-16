Ext.define('common.help.TutorialsController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.tutorials',

    onSelect: function (sm, record) {
        var me = this,
            panel = me.lookupReference('video'),
            iframe;

        iframe = Ext.create('Ext.ux.IFrame', {
            flex: 1,
            src: record.get('ttr_src')
        });

        panel.removeAll();
        panel.add(iframe);

    }

});
