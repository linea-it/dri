Ext.define('Target.store.CatalogsTree', {
    extend: 'common.store.MyTreeStore',

    alias: 'store.catalogs-tree',

    requires: [
        'common.data.proxy.Django',
        'Target.model.CatalogTree'
    ],

    model: 'Target.model.CatalogTree',

    autoLoad: false,

    remoteFilter: true,

    proxy: {
        api: {
            read    : '/dri/api/catalog/get_class_tree_by_group/'
        }
    }

});
