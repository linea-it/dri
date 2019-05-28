Ext.define('Eyeballing.view.eyeballing.Defects', {
    extend: 'Ext.grid.Panel',

    xtype: 'eyeballing-defects',

    requires: [
        'Ext.grid.column.Action'
    ],

    layout: 'fit',

    hideHeaders: true,

    header: false,

    viewConfig: {
        stripeRows: true,
        markDirty: false
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            columns: [
                {
                    xtype: 'checkcolumn',
                    text: '',
                    dataIndex: 'checked',
                    width: 30
                },
                {
                    text: 'Button',
                    width: 40,
                    xtype: 'widgetcolumn',
                    dataIndex: 'progress',
                    widget: {
                        width: 30,
                        textAlign: 'left',
                        xtype: 'button',
                        iconCls: 'x-fa fa-crosshairs',
                        handler: 'onClickAddDefect',
                        tooltip: 'Mark the current position with this defect.'
                    }
                },
                {
                    text: 'Features',
                    dataIndex: 'ftr_name',
                    flex: 1
                }
            ]
        });

        me.callParent(arguments);
    }

});
