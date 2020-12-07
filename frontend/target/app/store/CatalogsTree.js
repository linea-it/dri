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
    remoteSort: false,

    proxy: {
        api: {
            read: '/dri/api/catalog/get_class_tree_by_group/',
            create: '/dri/api/catalog/',
            update: '/dri/api/catalog/'
        }
    },

    sorters: [
        {
            property: 'prd_date',
            direction: 'DESC'
        }
    ]


});
