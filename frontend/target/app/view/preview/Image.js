Ext.define('Target.view.preview.Image', {
    // extend: 'zoomify.Thumbnail',
    extend: 'Ext.panel.Panel',

    xtype: 'targets-preview-image',

    filters: true,

    allowMousePosition: true,

    allowToogleFocus: true,

    allowCompass: true,

    config: {
        target: null
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            auxButtons:[{
                tooltip: 'Reset Focus',
                iconCls: 'x-fa fa-crosshairs',
                handler: function (btn) {
                    var panel = btn.up('targets-preview-image');

                    panel.resetTarget();
                }
            },
            {
                xtype: 'button',
                itemId: 'BtnRadius',
                iconCls: 'x-fa fa-circle-o',
                enableToggle: true,
                scope: this,
                toggleHandler: this.onDrawRadius
            }]
        });

        me.callParent(arguments);
    },

    setTarget: function (target) {

        var me = this,
            btnRadius = me.down('#BtnRadius');

        me.callParent(arguments);

        // Centralizar no objeto
        me.setViewSky(
            target.get('_meta_ra'),
            target.get('_meta_dec'),
            me.getMaxZoom(),
            true
        );

        // Mostrar ocultar o radius para objetos de sistema
        if (btnRadius.pressed) {
            if (target.get('_meta_radius')) {

                me.onDrawRadius(btnRadius, btnRadius.pressed);
            }
        }
    },

    resetTarget: function () {

        var me = this,
            target = me.getTarget();

        me.setViewSky(
            target.get('_meta_ra'),
            target.get('_meta_dec'),
            me.getMaxZoom(),
            true
        );
    },

    onDrawRadius: function (btn, state) {
        var me = this,
            target = me.getTarget();

        if (state) {
            if (target.get('_meta_radius')) {
                me.drawRadius(target.get('_meta_ra'), target.get('_meta_dec'), target.get('_meta_radius'));
            }
        } else {
            me.showHideRadius();
        }
    }

});
