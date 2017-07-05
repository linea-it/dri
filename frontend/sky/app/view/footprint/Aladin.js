Ext.define('Sky.view.footprint.Aladin', {
    extend: 'aladin.Aladin',

    xtype: 'footprint-aladin',

    requires: [
        'aladin.Aladin'
    ],

    initComponent: function () {
        var me = this,
            coordinate = ((location.hash.split('/')[2] || '').replace(/,/g, '.').split('|')) || null,
            fov = ((location.hash.split('/')[3] || '').replace(/,/g, '.')) || null;
        
        console.log(coordinate, fov);

        Ext.apply(this, {
            fov: fov,
            hideFootprint: false,
            gotoSetPosition: false
        });

        me.callParent(arguments);
    }

});
