Ext.define('Eyeballing.view.eyeballing.Thumb', {
    extend: 'Ext.panel.Panel',

    xtype: 'eyeballing-thumb',

    requires: [
    ],

    config: {
        dataset: null,
        filters: ['g', 'r', 'i', 'z', 'Y'],
        store: null
    },

    scrollable: 'vertical',

    initComponent: function () {
        var me = this,
            xtpl,
            store;

        store = Ext.create('Ext.data.Store', {
            fields: ['src', 'caption', 'filter']
        });

        me.setStore(store);

        xtpl = new Ext.XTemplate(
             '<tpl for=".">',
                 '<div style="margin-bottom: 2px;" class="thumb-wrap">',
                   '<img src="{src}" style="width:150px; height:150px; onError="this.onerror=null;this.src=\'resources/no_image_150x150.png\';"/>',
                   '<br/><span style="font-weight: bold;">{caption}</span>',
                 '</div>',
             '</tpl>'
         );

        Ext.apply(this, {
            items: [
                {
                    xtype: 'dataview',
                    reference: 'DataView',
                    tpl: xtpl,
                    multiSelect: false,
                    trackOver: true,
                    overItemCls: 'x-item-over',
                    itemSelector: 'div.thumb-wrap',
                    emptyText: 'No images available',
                    listeners: {
                        scope: this,
                        select: 'onSelect'
                    }
                }
            ]
        });

        me.callParent(arguments);
    },

    setDataset: function (dataset) {
        var me = this;

        if (dataset.get('id') > 0) {
            me.dataset = dataset;

            me.setStoreImages(dataset);
        }

    },

    setStoreImages: function (dataset) {
        var me = this,
            filters = me.getFilters(),
            store = me.getStore(),
            view = me.down('dataview'),
            image;

        store.removeAll();

        Ext.Array.each(filters, function (f) {

            image = {
                src: dataset.get(f.toLowerCase()),
                caption: f,
                filter: f.toLowerCase()
            };

            store.add(image);

        },this);

        view.setStore(store);
    },

    onSelect: function (vm, record) {
        var me = this;

        me.fireEvent('changefilter', record.get('filter'), me);

    }

});
