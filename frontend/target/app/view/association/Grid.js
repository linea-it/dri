Ext.define('Target.view.association.Grid', {
    extend: 'Ext.grid.Panel',

    xtype: 'targets-association-grid',

    columns: [
        {
            text     : 'Product',
            dataIndex: 'pcn_column_name',
            flex: 1
        },
        {
            text     : 'Class',
            dataIndex: 'pcc_display_name',
            flex: 1
        }
    ],

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
        });

        me.callParent(arguments);
    }

});
