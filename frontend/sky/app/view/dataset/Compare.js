Ext.define('Sky.view.dataset.Compare', {
    extend: 'visiomatic.Visiomatic',

    xtype: 'sky-compare',

    requires: [
        'visiomatic.Visiomatic'
    ],

    config: {
        splited: 0,
        originalDataset: null,
        compareDataset: null
    },

    bind: {
        originalDataset: '{currentDataset}'
    },


    mapOptions: {
        fullscreenControl: true,
        zoom: 1,
        enableLineaOverlay: false
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            enableTools: false,

            listeners: {
                changeimage: 'onCompareChangeImage'
            }

        });

        me.callParent(arguments);
    },

    divide: function (width) {
        var me = this;

        if (me.getSplited() === 0) {
            me.setWidth(width);

            me.setSplited(width);

        }
    },

    setCompareDataset: function (dataset) {
        var me = this,
            title;

        me.compareDataset = dataset;

        // Setar o titulo do Painel
        title = dataset.get('release_display_name') + ' - ' + dataset.get('tag_display_name') + ' - ' + dataset.get('tli_tilename');
        me.setTitle(title);

        // Setar a Imagem
        me.changeImage(dataset);

    },

    changeImage: function (dataset) {
        var me = this,
            url = dataset.get('image_src_ptif');

        if (url != '') {
            me.setImage(url);

        } else {
            me.removeImageLayer();

        }
    }

});
