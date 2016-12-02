Ext.define('Explorer.view.coadd.Properties', {
    extend: 'Ext.grid.Panel',

    xtype: 'coadd-properties',

    // requires: [
    //     'Explorer.view.coadd.CoaddController',
    //     'Explorer.view.coadd.CoaddModel'
    // ],

    // controller: 'coadd',

    // viewModel: 'coadd',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            columns: [
                {text: 'Properties',  dataIndex: 'property', width: 200},
                {text: 'Value',  dataIndex: 'value', renderer: this.formatNumber, flex: 1}
            ]
        });

        me.callParent(arguments);
    },

    formatNumber: function (value) {
        if (typeof(value) === 'number') {
            if (!isNaN(value) && value.toString().indexOf('.') != -1) {

                value =  value.toFixed(4);
            }
        }

        return value;
    }

});
