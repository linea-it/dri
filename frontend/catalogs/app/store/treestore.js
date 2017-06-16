Ext.define('Catalogs.store.treestore', {
    extend: 'common.store.MyTreeStore',
    
    alias: 'store.treestore',
    
    requires: [
        'common.data.proxy.Django',
        'Catalogs.model.catalogtree'
    ],

    model: 'Catalogs.model.catalogtree',

    autoLoad: true,
    // rootVisible: true,
    remoteFilter: true,
    // filters: [{
    //     property: 'group',
    //     value: 'targets'
    // }],

    proxy: {
        url: '/dri/api/productgroup/get_group/',
      /**  extraParams:{
            property: 'group',
            value: 'targets'
        }**/       
    },

    
});



// Ext.define('Target.store.CatalogsTree', {
//     extend: 'common.store.MyTreeStore',

//     alias: 'store.catalogs-tree',

//     requires: [
//         'common.data.proxy.Django',
//         'Target.model.Catalog'
//     ],

//     model: 'Target.model.Catalog',

//     autoLoad: false,

//     remoteFilter: true,

//     proxy: {
//         url: '/dri/api/catalog/get_class_tree_by_group/'
//     }

// });