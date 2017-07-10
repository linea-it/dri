Ext.define('visiomatic.catalog.CatalogOverlayWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'visiomatic.catalog.Catalogs',
        'visiomatic.catalog.CatalogViewModel',
        'visiomatic.catalog.CatalogController',
        'visiomatic.catalog.Submit',
        'visiomatic.catalog.OverlayGrid'
    ],

    xtype: 'visiomatic-catalog-overlay',

    controller: 'catalogoverlay',
    viewModel: 'catalogoverlay',

    config: {
        // Instancia atual do visiomatic onde serao feitos os overlays
        visiomatic: null,

        // Instancia de um common.model.Dataset com todas as informacoes sobre a tile, release, tag
        dataset: null
    },

    initComponent: function () {
        var me = this;
        Ext.apply(this, {
            title: 'Catalog Overlay',
            width: 600,
            height: 450,
            closeAction: 'hide',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'panel',
                    split: true,
                    flex: 1,
                    framed: true,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'visiomatic-catalogs-tree',
                            reference: 'CatalogsTree',
                            flex: 1,
                            split: true,
                            bind: {
                                store: '{catalogs}'
                            }
                        },
                        {
                            xtype: 'visiomatic-catalogs-submit',
                            split: true,
                            height: 150,
                            bind: {
                                disabled: '{!CatalogsTree.selection}'
                            }
                        }
                    ]
                },
                {
                    xtype: 'visiomatic-catalogs-overlays-grid',
                    split: true,
                    framed: true,
                    flex: 1,
                    bind: {
                        store: '{overlays}'
                    }
                }
            ]

        });

        me.callParent(arguments);

    },

    setVisiomatic: function(visiomatic) {
        this.visiomatic = visiomatic;
        this.getViewModel().set('visiomatic', visiomatic);

    },


    /**
     * Setar o Dataset que esta visivel no visiomatic,
     * esse dataset sera usado para fazer a query dos objetos.
     * se o dataset for diferente do anterior dispara o evento changedataset.
     * se for igual nao faz nada
     */
    setDataset: function (dataset) {
        var me = this,
            oldDataset = me.getDataset(),
            is_dirty = false;

        // Se ja existir um dataset setado checar se e diferente do atual
        if ((oldDataset !== null) && (oldDataset.get('id') > 0)) {
            if (oldDataset.get('id') === dataset.get('id')) {
                is_dirty = false;

            } else {
                is_dirty = true;
            }

        } else {
            is_dirty = true;

        }

        // se for um dataset novo disparar o evento.
        if (is_dirty) {
            me.dataset = dataset;
            me.getViewModel().set('dataset', dataset);

            me.fireEvent('changedataset', dataset, me);
        }

    }
});