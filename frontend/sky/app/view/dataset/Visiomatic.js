Ext.define('Sky.view.dataset.Visiomatic', {
    extend: 'visiomatic.Visiomatic',

    xtype: 'sky-visiomatic',

    requires: [
        'visiomatic.Visiomatic'
    ],

    config: {
        // Current Dataset
        currentDataset: null
    },

    bind: {
        currentDataset: '{currentDataset}'
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            enableTools: false
        });

        me.callParent(arguments);
    },

    setCurrentDataset: function (dataset) {
        var me = this,
        title;

        me.currentDataset = dataset;

        // Setar o titulo do Painel
        title = dataset.get('release_display_name') + ' - ' + dataset.get('tag_display_name') + ' - ' + dataset.get('tli_tilename');
        me.setTitle(title);

    }
});
