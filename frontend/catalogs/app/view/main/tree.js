/**
 * This view is an example list of people.
 */
Ext.define('Catalogs.view.main.tree', {
    extend: 'Ext.tree.Panel',
    xtype: 'maintree',

    requires: [
        'Catalogs.store.treestore'
    ],
    store: {
        type: 'treestore'
    },
    // region: 'west',
    //title: 'Tree',
    // width: 250,
    // height: 150,      
    rootVisible: false,      
    // collapsed : true,
    // collapsible : true,

    listeners: {
        select: 'onItemSelected'
    }
});
