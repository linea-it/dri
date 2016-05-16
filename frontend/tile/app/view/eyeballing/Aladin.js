Ext.define('Tile.view.eyeballing.Aladin', {
    extend: 'aladin.Aladin',

    xtype: 'eyeballing-aladin',

    requires: [
        'aladin.Aladin'
    ],

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            hideFootprint: false,
            tilesGridVisible: true
        });

        me.callParent(arguments);
    }

});
