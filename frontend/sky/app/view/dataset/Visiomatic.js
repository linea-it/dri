Ext.define('Sky.view.dataset.Visiomatic', {
    extend: 'visiomatic.Visiomatic',

    xtype: 'sky-visiomatic',

    requires: [
        'visiomatic.Visiomatic'
    ],

    bind: {
        currentDataset: '{currentDataset}'
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            enableTools: false,
            showCrosshair: false,
            enableMiniMap: true,
        });

        me.callParent(arguments);
    },

    setCurrentDataset: function (dataset) {
        var me = this,
        title;

        me.callParent(arguments);

        // Setar o titulo do Painel
        title = dataset.get('release_display_name') + ' - ' + dataset.get('tag_display_name') + ' - ' + dataset.get('tli_tilename');
        me.setTitle(title);
    }
});
