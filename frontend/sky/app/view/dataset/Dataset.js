Ext.define('Sky.view.dataset.Dataset', {
    extend: 'Ext.panel.Panel',

    xtype: 'dataset',

    requires: [
        'Sky.view.dataset.Visiomatic',
        'Sky.view.dataset.DatasetController',
        'Sky.view.dataset.DatasetModel',
        'Sky.view.dataset.Compare'
    ],

    controller: 'dataset',

    viewModel: 'dataset',

    config: {
        dataset: null,
        coordinate: null,
        fov: null,
        radec: null,

        defaultFov: 0.5,

        // Available datasets (store)
        datasets: null,
        currentDataset: null
    },

    bind: {
        currentDataset: '{currentDataset}'
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            layout: 'border',
            items: [
                {
                    xtype: 'sky-visiomatic',
                    reference: 'visiomatic',
                    region: 'center',
                    split: true
                    // bind: {
                    // showCrosshair: '{BtnCrosshair.pressed}'
                    // }
                },{
                    xtype: 'sky-compare',
                    reference: 'compare',
                    region: 'east',
                    width: 400,
                    split: true,
                    hidden: true,
                    closable: true,
                    closeAction: 'hide'
                }
            ],
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    items:[
                        {
                            xtype: 'button',
                            tooltip: 'Switch between Visiomatic / Aladdin.',
                            iconCls: 'x-fa fa-exchange',
                            handler: 'onShift'
                        },
                        {
                            xtype: 'button',
                            tooltip: 'Get link',
                            iconCls: 'x-fa fa-link',
                            scope: me,
                            handler: me.getLinkToPosition
                        },
                        {
                            xtype: 'button',
                            itemId: 'CompareDataset',
                            tooltip: 'Compare images between releases.',
                            iconCls: 'x-fa fa-object-ungroup ',
                            text: 'Compare',
                            scope: me,
                            handler: 'compareImages',
                            bind: {
                                disabled: '{disablecompare}'
                            },
                            menu: []
                        },
                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-map-marker',
                            tooltip: 'Show/Hide Pin',
                            enableToggle: true,
                            pressed: true,
                            toggleHandler: 'showHideMarker'
                        },
                        {
                            xtype: 'button',
                            tooltip: 'Catalog Overlay',
                            iconCls: 'x-fa fa-bullseye',
                            handler: 'showCatalogOverlay'
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    },

    loadPanel: function (arguments) {
        var me = this,
            dataset = me.getDataset(),
            coordinate = me.getCoordinate(),
            fov = me.getFov(),
            vm = this.getViewModel(),
            radec, coordinates;

        if (dataset > 0) {

            vm.set('dataset', dataset);

            me.setParameters(coordinate, fov);

            me.setLoading(true);

            this.fireEvent('loadpanel', dataset, this);
        }
    },

    updatePanel: function (arguments) {
        var me = this,
            old = me.getDataset(),
            dataset = arguments[1],
            coordinate = arguments[2],
            fov = arguments[3],
            vm = this.getViewModel(),
            visiomatic = me.down('sky-visiomatic');

        me.setParameters(coordinate, fov);

        // Remover a ImageLayer do Visiomatic
        visiomatic.removeImageLayer();

        if ((dataset > 0) && (dataset != old)) {
            me.setDataset(dataset);

            vm.set('dataset', dataset);

            this.fireEvent('updatePanel', dataset, this);

        } else {
            this.fireEvent('updatePosition', dataset, this);

        }
    },

    setParameters: function (coordinate, fov) {
        var me = this,
            coordinates, radec;

        coordinate = decodeURIComponent(coordinate);
        if (coordinate.includes('+')) {
            coordinates = coordinate.split('+');

        } else {
            coordinates = coordinate.split('-');
            coordinates[1] = '-' + coordinates[1];
        }

        radec = {
            ra: parseFloat(coordinates[0].replace(',', '.')),
            dec: parseFloat(coordinates[1].replace(',', '.'))
        };

        me.setRadec(radec);

        if (fov) {
            me.setFov(fov.replace(',', '.'));
        } else {
            me.setFov(me.getDefaultFov());
        }

        coordinate = radec.ra + ', ' + radec.dec;
        me.setCoordinate(coordinate);

    },

    setDatasets: function (store) {
        var me = this;

        me.datasets = store;

        me.updateCompareOptions();

    },

    updateCompareOptions: function () {
        var me = this,
            store = me.getDatasets(),
            btn = me.down('#CompareDataset'),
            currentDataset = me.getCurrentDataset(),
            items = [],
            item;

        // Limpar os menus anteriores
        btn.getMenu().removeAll();

        // Desabilita o botao
        btn.disable();

        if (!currentDataset) {
            return false;
        }

        if (store.count() > 1) {
            store.each(function (dataset) {
                if (dataset.get('id') != currentDataset.get('id')) {
                    item = {
                        xtype: 'menucheckitem',
                        text: dataset.get('release_display_name') + ' - ' + dataset.get('tag_display_name'),
                        group: 'compareDatasets',
                        dataset: dataset,
                        scope: me,
                        checkHandler: me.compareImages
                    };

                    items.push(item);
                }
            });

            // Adicionar o botao magnetic
            items.push('-');
            items.push({
                xtype: 'menucheckitem',
                text: 'Magnetic',
                iconCls: 'x-fa fa-magnet',
                itemId: 'btnMagnetic',
                checked: true
            });


            // Adicionar os novos items
            btn.getMenu().add(items);

            // Habilita o botao
            btn.enable();

        }
    },

    compareImages: function (item) {
        if (item.dataset) {
            this.fireEvent('compare', item.dataset, this);

        }
    },

    getLinkToPosition: function () {
        var me = this,
            refs = me.getReferences(),
            visiomatic = refs.visiomatic;

        visiomatic.getLinkToPosition();

    }
});
