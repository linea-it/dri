Ext.define('Sky.view.footprint.Aladin', {
    extend: 'aladin.Aladin',

    xtype: 'footprint-aladin',

    requires: [
        'aladin.Aladin'
    ],

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            hideFootprint: false,
            gotoSetPosition: false,
            enableShift: true,
            tilesGridVisible: false,
            // Disabled Map Viewer Issue: #1466 - https://github.com/linea-it/dri/issues/1466
            enableMaps: false, 
        });

        this.callParent(arguments);
    }
});