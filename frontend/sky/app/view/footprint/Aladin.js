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
            gotoSetPosition: false
        });
        
        this.callParent(arguments);
    },

    //onAfterrender: function () {
        /*var me = this,
            coordinate = ((location.hash.split('/')[2] || '').replace(/,/g, '.').split('|')) || null,
            fov = ((location.hash.split('/')[3] || '').replace(/,/g, '.')) || null;
        
        console.log('onAfterrender Aladin Sky', this.getId(), me.getAladinId(), this.getAladin());

        me.callParent(arguments);
        
        var aladin = me.getAladin();

        aladin.aladinDiv.setAttribute('aladin-div', 'true');
        aladin.aladinDiv._aladin = aladin;*/

        //me.getAladin().gotoPosition(74,-56);
    //},

    onActive: function(){
        var me = this,
            coordinate = ((location.hash.split('/')[2] || '').replace(/,/g, '.').split('|')) || null,
            zoom = ((location.hash.split('/')[3] || '').replace(/,/g, '.')) || null;
        
        var aladin = me.getAladin();

        aladin.gotoPosition(coordinate[0], coordinate[1]);
        aladin.setZoom(zoom);
   }

});