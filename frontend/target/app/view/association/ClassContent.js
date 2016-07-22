Ext.define('Target.view.association.ClassContent', {
    extend: 'Ext.grid.Panel',

    xtype: 'targets-association-class-content',

    columns: [
        {
            text     : 'Name',
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
