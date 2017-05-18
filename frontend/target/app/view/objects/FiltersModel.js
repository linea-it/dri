/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('Target.view.objects.FiltersModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.filters',

    requires: [
        'Target.model.Catalog',
        'Target.model.CatalogContent',
        'Target.model.FilterSet',
        'Target.model.FilterCondition',
        'Target.store.FilterSets',
        'Target.store.FilterConditions',
        'Target.store.ProductDisplayContents'
    ],

    stores: {
        contents: {
            type: 'product-display-contents',
            storeId: 'productContents',
            autoLoad: false
        },
        filterSets: {
            type: 'target-filtersets',
            autoLoad: false
        },
        filters: {
            type: 'target-filter-conditions',
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
        value: '14087',
        haveFilters: false,
        filterName: null
    },

    links: {
        currentCatalog: {
            type: 'Target.model.Catalog',
            create: true
        },
        filterSet: {
            type: 'Target.model.FilterSet',
            create: true
        },
        content: {
            type: 'Target.model.CatalogContent',
            create: true
        }
    }
});
