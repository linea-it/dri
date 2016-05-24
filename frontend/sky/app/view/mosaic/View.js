Ext.define('Sky.view.mosaic.View', {
    extend: 'Ext.view.View',

    xtype: 'tile-mosaic-view',

    scrollable: 'vertical',

    initComponent: function () {
        var me = this;

        me.tpl = [
            '<tpl for=".">',
                '<div class="thumb-wrap" id="tilemosaic_{id:stripTags}">',
                    '<div class="thumb"><img src="{default_img}" title="{tilename:htmlEncode}"></div>',
                    '<div>',
                        // '<tpl if="flag_reject == true">',
                        //     '<img title="Sky in Blacklist" alt="Sky in Blacklist" style="border-width:0px;" src="/static/images/warning.gif">',
                        // '</tpl>',
                        '<span class="x-editable">{tilename:htmlEncode}</span>',
                    '</div>',
                '</div>',
            '</tpl>',
            '<div class="x-clear"></div>'
        ];

        me.multiSelect = false,
        me.trackOver = true,
        me.overItemCls = 'x-item-over',
        me.itemSelector = 'div.thumb-wrap',
        me.emptyText = 'No images to display',

        this.callParent(arguments);
    }
});
