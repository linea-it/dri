Ext.define('Target.view.association.ClassContent', {
    extend: 'Ext.grid.Panel',

    xtype: 'targets-association-class-content',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            columns: [
                {
                    text     : 'Properties available in this class',
                    dataIndex: 'pcc_display_name',
                    flex: 1,
                    renderer: function (value, meta, record) {
                        if (record.get('pcc_unit') !== '') {
                            return value + ' (' + record.get('pcc_unit') + ')' ;

                        } else {
                            return value;

                        }

                    }
                }
            ],
            viewConfig: {
                getRowClass: function (record) {
                    return record.get('pcc_mandatory') === true ? 'row-bold-unit-mandatory' : '';
                }
            }
        });

        me.callParent(arguments);
    }
});
