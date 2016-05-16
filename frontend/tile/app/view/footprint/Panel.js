Ext.define('Tile.view.footprint.Panel', {
    extend: 'aladin.Aladin',

    xtype: 'tile-footprint',

    requires: [
        'aladin.Aladin'
    ],

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            hideFootprint: false
        });

        me.callParent(arguments);
    }

});
