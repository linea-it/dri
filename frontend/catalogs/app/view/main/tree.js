/**
 * This view is an example list of people.
 */
Ext.define('Catalogs.view.main.tree', {
    extend: 'Ext.tree.Panel',
    xtype: 'maintree',

    requires: [
        'Catalogs.view.main.MainController',
        'Catalogs.view.main.MainModel',
    ],
    scrollable : true,
    // controller: 'main',
    viewModel: 'main',
    bind: {
        store: '{catalogs}',
        // selection: '{selectedCatalog}'
    },

    rootVisible: true,


    listeners: {
        select: 'onItemSelected'
    }
});
