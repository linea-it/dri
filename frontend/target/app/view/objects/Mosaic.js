/**
 *
 */
Ext.define('Target.view.objects.Mosaic', {
    extend: 'Ext.panel.Panel',

    xtype: 'targets-objects-mosaic',

    scrollable: true,

    columns: [
        Ext.create('Ext.grid.RowNumberer'),
        {text: 'Tilename',  dataIndex: 'tilename', flex: 1},
        {text: 'Count',  dataIndex: 'num_objects', width: 60}
    ],

    config: {
        store: null,
        ready: true
    },

    setStore: function (store) {
        this.store = store;
        this.createView();
    },

    createView: function () {
        // console.log("Targets Mosaic - createView()");
        var me = this,
            store = me.getStore();

        if (me._view) {
            me.remove(me._view);
            me._view = null;
        }

        var tpl =  Ext.create('Ext.XTemplate',
            '<tpl for=".">',
                '<div class="thumb-wrap" id="target_{_meta_ra}-{_meta_dec}">',
                    '<div class="thumb">',
                        // Usando timestamp com Unique id para a imagem não ficar em cache
                        '<img style="width:200px; height:200px;" src="{postage_stamps}?_dc={timestamp}" title="ID: {_meta_id} RA: {[this.formatNumber(values._meta_ra)]} Dec: {[this.formatNumber(values._meta_dec)]}" onError="this.onerror=null;this.src=\'resources/cutout_placeholder.png\';" >',
                    '</div>',
                    '<div>',
                        '<p>Id: {_meta_id}</p>',
                        '<tpl if=\'name != ""\'>',
                            '<p>Name: {name}</p>',
                        '</tpl>',
                        '<p>RA: {[this.formatNumber(values._meta_ra)]} Dec: {[this.formatNumber(values._meta_dec)]}</p>',
                    '</div>',
                '</div>',
            '</tpl>',
            '<div class="x-clear"></div>',
            {
                formatNumber: function (value) {
                    return value.toFixed(4);
                }
            });

        var _view = Ext.create('Ext.view.View', {
            tpl: tpl,
            store:  store ,
            itemSelector: 'div.thumb-wrap',
            emptyText: 'No images to display',
            multiSelect: false,
            trackOver: true,
            overItemCls:'x-item-over',
            itemSelector: 'div.thumb-wrap',
            emptyText:'No images to display',
            listeners: {
                scope: me,
                select: function (selModel, record, index) {
                    me.fireEvent('select', selModel, record, index);
                }
            }
        });

        me._view = _view;
        me.add(_view);

    },

    getSelectionModel: function () {
        if (this._view) {
            return this._view.getSelectionModel();
        } else {
            return null;
        }
    }
});

