Ext.define('visiomatic.store.CatalogsTree', {
    extend: 'common.store.MyTreeStore',

    alias: 'store.catalogs-overlay-tree',

    requires: [
        'common.data.proxy.Django',
        'visiomatic.model.CatalogTree'
    ],

    model: 'visiomatic.model.CatalogTree',

    autoLoad: false,

    remoteFilter: true,

    proxy: {
        api: {
            read: '/dri/api/catalog/get_class_tree_by_group/',
        }
    }

});
