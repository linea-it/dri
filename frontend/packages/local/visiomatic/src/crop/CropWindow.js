Ext.define('visiomatic.crop.CropWindow', {
    extend: 'Ext.window.Window',

    xtype: 'target-download-crop',

    title: 'Crop',
    width: 400,
    height: 400,
    modal: true,
    autoShow: true,

    closeAction: 'destroy',

    layout: {
        type: 'hbox',
    },

    initComponent: function () {

        var me = this,
            image = me.image;

        Ext.apply(this, {
            layout: 'ux.center',
            items: [
              {
                  xtype: 'image',
                  src: image.href,
                  alt: image.download,
                  height: me.height - 100,
                  width: me.width-100,
              },
            ],
            buttons: [
                {
                    xtype: 'label',
                    text: 'Right click "Save link as" to download the image',
                    flex: 1,
                },
                {
                    text: 'Cancel',
                    scope: me,
                    handler: 'onCancel'
                }
            ]
        });
        me.callParent(arguments);
    },

    onCancel: function () {
        this.close();
    },

    loadImage: function (image) {
        var me = this;
        this.image = image;
    },
});
