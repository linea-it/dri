/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('Target.view.objects.SaveCatalogModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.savecatalog',

    requires: [
        'Target.model.Catalog',
        'Target.model.FilterSet',
        'Target.store.FilterSets',
        'Target.store.ProductContent'
    ],

    stores: {
        filterSets: {
            type: 'target-filtersets',
            autoLoad: false
        },
        contents: {
            type: 'product-content',
            autoLoad: false
        }
    },

    // data: {
    //     operator: null,
    //     value: null,
    //     haveFilters: false,
    //     filterName: null
    // },

    links: {
        currentCatalog: {
            type: 'Target.model.Catalog',
            create: true
        },
        filterSet: {
            type: 'Target.model.FilterSet',
            create: true
        }
    }
});
