Ext.define('Sky.view.home.Home', {
    extend: 'Ext.grid.Panel',
    xtype: 'home',

    requires: [
        'Sky.view.home.HomeController',
        'Sky.store.Releases',
        'Ext.PagingToolbar'
    ],

    title: 'Releases',

    store: {
        type: 'releases'
    },

    controller: 'home',

    columns: [
        {
            text: 'Name',
            dataIndex: 'rls_display_name',
            flex: 1,
            renderer: function (value, cell, record) {
                console.log(value);
                console.log(record);
                if (record.get('is_new')) {
                    // return value + '    <spam style="color:#e67e22;">New</spam>';
                    return '<spam style="color:#e67e22;">New</spam>    ' + value;

                }
                return value;
            }
        },
        {xtype: 'datecolumn', text: 'Date', dataIndex: 'rls_date', format:'Y-m-d', flex: 1},
        {text: 'Tiles', dataIndex: 'tiles_count', flex: 1}
    ],

    // dockedItems: [
    //     {
    //         xtype: 'toolbar',
    //         dock: 'bottom',
    //         items:{
    //             xtype: 'pagingtoolbar',
    //             displayInfo: true,
    //             store: {
    //                 type: 'releases'
    //             }
    //         }
    //     }
    // ],

    listeners: {
        rowdblclick: 'onRowDblClick'
    },

    loadPanel: function () {
        this.fireEvent('loadpanel', this);

    },

    updatePanel: function () {
        this.fireEvent('updatepanel', this);

    }
});
