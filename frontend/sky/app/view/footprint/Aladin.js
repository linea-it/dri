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
            tilesGridVisible: true,
        });
        
        this.callParent(arguments);
    }
});