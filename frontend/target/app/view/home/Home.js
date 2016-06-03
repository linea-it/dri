/**
 *
 */
Ext.define('Target.view.home.Home', {
    extend: 'Ext.panel.Panel',

    xtype: 'home',

    requires: [
        'Target.view.home.HomeController',
        'Target.view.catalog.Tree'
    ],

    controller: 'home',

    viewModel: 'home',

    // config: {
    //     release: null,
    //     field: null
    // },

    // initComponent: function () {
    //     var me = this;

    //     Ext.apply(this, {
    //         items: [
    //             {
    //                 xtype: 'targets-catalog-tree',
    //                 reference: 'CatalogTree'
    //             }
    //         ]
    //     });

    //     me.callParent(arguments);
    // },

    loadPanel: function (arguments) {
        // console.log('loadPanel(%o)', arguments);

        var me = this,
            refs = me.getReferences(),
            vm = me.getViewModel();

        this.fireEvent('loadpanel', this);
    },

    updatePanel: function (arguments) {

    },

    getCatalogTree: function () {
        // console.log('getStoreCatalogs()');

        var me = this,
            refs = me.getReferences(),
            tree = refs.CatalogTree;

        return tree;
    }
});

