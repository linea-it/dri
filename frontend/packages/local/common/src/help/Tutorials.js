Ext.define('common.help.Tutorials', {
    extend: 'Ext.window.Window',

    requires: [
        'Ext.ux.IFrame',
        'common.help.TutorialsController'
    ],

    xtype: 'tutorials-window',

    title: 'Tutorials',

    controller: 'tutorials',

    config: {
        store: null
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            layout: 'border',
            width: 700,
            height: 400,
            minWidth: 300,
            minHeight: 280,
            resizable: true,
            modal: true,
            closeAction: 'destroy',
            items: [
                {
                    xtype: 'grid',
                    reference: 'tutorials_grid',
                    region: 'west',
                    split: true,
                    hideHeaders: true,
                    width: 200,
                    store: me.getStore(),
                    columns: [
                        {
                            dataIndex: 'ttr_title',
                            flex: 1
                        }
                    ],
                    listeners: {
                        select: 'onSelect'
                    }
                },
                {
                    xtype: 'panel',
                    region: 'center',
                    reference: 'video',
                    split: true,
                    layout: {
                        type: 'vbox',
                        pack: 'start',
                        align: 'stretch'
                    }
                }
            ]
        });

        me.callParent(arguments);
    }

});
