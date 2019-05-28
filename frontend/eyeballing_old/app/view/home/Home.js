/**
 * This view is an example list of people.
 */
Ext.define('Eyeballing.view.home.Home', {
    extend: 'Ext.grid.Panel',
    xtype: 'home',

    requires: [
        'Eyeballing.view.home.HomeController',
        'Eyeballing.store.Releases'
    ],

    title: 'Releases',

    store: {
        type: 'releases'
    },

    controller: 'home',

    columns: [
        {text: 'Name',  dataIndex: 'rls_display_name', flex: 1},
        {xtype: 'datecolumn', text: 'Date', dataIndex: 'rls_date', format:'Y-m-d', flex: 1},
        {text: 'Tiles', dataIndex: 'tiles_count', flex: 1},
        {text: 'Flagged', dataIndex: '', flex: 1},
        {text: 'Defects', dataIndex: '', flex: 1}
    ],

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
