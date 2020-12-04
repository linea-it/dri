/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('Target.view.objects.ObjectsModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.objects',

    requires: [
        'Target.model.Catalog',
        'Target.model.CatalogObject',
        'Target.model.CurrentSetting',
        'Target.model.FilterSet',
        'Target.model.CutoutJob',
        'Target.model.Object',
        'Target.store.Objects',
        'Target.store.CurrentSettings',
        'Target.store.ProductDisplayContents',
        'Target.store.FilterSets',
        'Target.store.FilterConditions',
        'Target.store.CutoutJobs',
        'Target.store.Cutouts'
    ],

    data: {
        tag_id: 0,
        field_id: 0,
        catalog: 0,
        filters: null,
        mosaic_is_visible: false,
        haveResults: false,
        // Se houver um filtro salvo ativo
        haveFilter: false,
        currentImageFormat: null,
    },

    stores: {
        catalogs: {
            type: 'catalogs',
            storeId: 'Catalogs',
            autoLoad: false
        },
        objects: {
            type: 'targets-objects',
            storeId: 'objects',
            autoLoad: false
        },
        currentSettings: {
            type: 'currentsettings',
            autoLoad: false
        },
        displayContents: {
            type: 'product-display-contents',
            autoLoad: false
        },
        filterSets: {
            type: 'target-filtersets',
            autoLoad: false
        },
        filterConditions: {
            type: 'target-filter-conditions',
            autoLoad: false
        },
        cutouts: {
            type: 'cutouts',
            autoLoad: false
        },
        cutoutjobs: {
            type: 'cutoutjobs',
            autoLoad: false
        },
        // Tipos de imagens disponiveis dependendo do cutoutJob selecionado.
        // Esta store vai ser preenchida pelo painel Mosaic::setCutoutJob         
        imagesFormat: {
            fields: ['name', 'displayName'],
            data: [],
        },
    },

    links: {
        currentCatalog: {
            type: 'Target.model.Catalog',
            create: true
        },
        currentSetting: {
            type: 'Target.model.CurrentSetting',
            create: true
        },
        filterSet: {
            type: 'Target.model.FilterSet',
            create: true
        },
        currentRecord: {
            type: 'Target.model.Object',
            create: true
        },
        cutoutJob: {
            type: 'Target.model.CutoutJob',
            create: true
        },
    }
});
