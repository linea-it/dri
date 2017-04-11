Ext.define('Target.view.association.Grid', {
    extend: 'Ext.grid.Panel',

    xtype: 'targets-association-grid',

    columns: [
        {
            text     : 'My properties',
            dataIndex: 'pcn_column_name',
            flex: 1
        },
        {
            text     : 'Class Properties',
            dataIndex: 'pcc_display_name',
            flex: 1,
            renderer: function (value, meta, record) {
                if (record.get('pcc_unit') != '') {
                    return value + ' (' + record.get('pcc_unit') + ')' ;
                } else {
                    return value;
                }

            }
        }
    ],

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
        });

        me.callParent(arguments);
    }

});
