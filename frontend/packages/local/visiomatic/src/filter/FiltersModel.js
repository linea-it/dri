/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('visiomatic.filter.FiltersModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.overlay_filters',

    requires: [
        'visiomatic.model.CatalogTree',
        'visiomatic.model.CatalogContent',
        'visiomatic.model.FilterCondition',
        'visiomatic.store.FilterConditions',
        'visiomatic.store.ProductDisplayContents'
    ],

    stores: {
        contents: {
            type: 'overlay-product-display-contents',
            storeId: 'productContents',
            autoLoad: false
        },
        filters: {
            type: 'overlay-filter-conditions',
            storeId: 'filterConditions',
            autoLoad: false
        },
        operators: {
            fields: ['name', 'display_name', 'type'],
            data: [
                {name: '=',  display_name: 'is equal to', type: 'text'},
                {name: '!=', display_name: 'is not equal to', type: 'text'},
                {name: '>',  display_name: 'is greater than', type: 'text'},
                {name: '>=', display_name: 'is greater than or equal to', type: 'text'},
                {name: '<',  display_name: 'is less than', type: 'text'},
                {name: '<=', display_name: 'is less than or equal to', type: 'text'}
            ]
        }
    },

    data: {
        operator: null,
        value: null,
        haveFilters: false,
        afilters: []
    },

    links: {
        currentCatalog: {
            type: 'visiomatic.model.CatalogTree',
            create: true
        },
    }
});
