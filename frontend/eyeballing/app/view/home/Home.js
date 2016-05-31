/**
 * This view is an example list of people.
 */
Ext.define('Eyeballing.view.home.Home', {
    extend: 'Ext.grid.Panel',
    xtype: 'home',

    requires: [
        'Eyeballing.store.Personnel'
    ],

    title: 'Releases',

    store: {
        type: 'personnel'
    },

    columns: [
        {text: 'Name',  dataIndex: 'name'},
        {text: 'Date', dataIndex: 'email'},
        {text: 'Tiles', dataIndex: 'email'},
        {text: 'Inspected', dataIndex: 'email'},
        {text: 'Flagged', dataIndex: 'phone'},
        {text: 'Defects', dataIndex: 'phone', flex: 1}
    ],

    listeners: {
        select: 'onItemSelected'
    },

    loadPanel: function () {
        this.fireEvent('loadpanel', this);

    }
});
