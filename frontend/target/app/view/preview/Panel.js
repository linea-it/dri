/**
 *
 */
Ext.define('Target.view.preview.Panel', {
    extend: 'Ext.panel.Panel',

    xtype: 'targets-preview-panel',

    requires: [
        'Ext.layout.container.Border',
        'Ext.grid.property.Grid',
        'Ext.ux.rating.Picker',
        'Target.view.preview.PreviewController',
        'Target.view.preview.PreviewModel',
        'Target.view.preview.CoaddProperties',
        'Target.view.preview.Image'
    ],

    controller: 'preview',

    viewModel: 'preview',

    layout: 'border',

    config: {
        currentRecord: null,
        currentCoaddRecord: null,
        currentImage: null,
        classColumns: null,
        release: null,
        field: null,
        tiles: null
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            items: [
                {
                    xtype: 'panel',
                    region: 'center',
                    layout: 'fit',
                    items: [
                        {
                            xtype: 'targets-preview-image',
                            reference:'ImageView'
                        }
                    ],
                    tbar: [
                        {
                            xtype: 'button',
                            text: 'More Info',
                            reference: 'BtnExplorer',
                            tooltip: 'View the object in Explorer',
                            disabled: true
                            // bind: {
                            //     disabled: '{!currentRecord.id_auto}'
                            // }
                        },
                        {
                            xtype: 'combobox',
                            reference: 'previewCurrentTile',
                            publishes: 'tiletag_id',
                            width: 200,
                            // fieldLabel: 'Image',
                            displayField: 'display_name',
                            bind: {
                                store: '{tiles}',
                                disabled: '{!currentRecord.id_auto}'
                            },
                            queryMode: 'local',
                            listConfig: {
                                itemTpl: [
                                    '<div data-qtip="{release_display_name} - {display_name}">{release_display_name} - {display_name}</div>'
                                ]
                            },
                            listeners: {
                                scope: this,
                                change: this.onChangeImage
                            }
                        }
                    ],
                    bbar: [
                        {
                            xtype: 'checkboxfield',
                            name: 'acceptTerms',
                            reference: 'reject',
                            hideLabel: true,
                            boxLabel: 'Reject',
                            bind: {
                                value: '{currentRecord.reject}',
                                disabled: '{!currentRecord.id_auto}'
                            }
                        },
                        {
                            xtype: 'tbtext',
                            html: 'Rating'
                        },
                        {
                            xtype: 'rating',
                            scale: '200%',
                            rounding: 1,
                            minimum: 0,
                            selectedStyle: 'color: rgb(96, 169, 23);',
                            style: {
                                'color': '#777777'
                            },
                            bind: {
                                value: '{currentRecord.rating}'
                            }
                        },
                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-comments',
                            bind: {
                                disabled: '{!currentRecord.id_auto}'
                            },
                            handler: 'onComment'
                        }
                    ]
                },
                {
                    region: 'south',
                    height: 200,
                    split: true,
                    // collapsible: true,
                    resizable: true,
                    layout: 'accordion',
                    items:[
                        {
                            title: 'Class Properties',
                            xtype: 'propertygrid',
                            reference: 'ClassProperties',
                            hideHeaders: true
                        },
                        {
                            xtype: 'targets-preview-coaddproperties',
                            title:'Object Properties',
                            reference: 'CoaddProperties',
                            bind: {
                                // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                                source: {
                                    coadd_objects_id: '{currentCoaddRecord.coadd_objects_id}',
                                    display_ra: '{currentCoaddRecord.display_ra}',
                                    display_dec: '{currentCoaddRecord.display_dec}',
                                    l: '{currentCoaddRecord.l}',
                                    b: '{currentCoaddRecord.b}',
                                    mag_auto_magerr_g: '{currentCoaddRecord.mag_auto_magerr_g}',
                                    mag_auto_magerr_r: '{currentCoaddRecord.mag_auto_magerr_r}',
                                    mag_auto_magerr_i: '{currentCoaddRecord.mag_auto_magerr_i}',
                                    mag_auto_magerr_z: '{currentCoaddRecord.mag_auto_magerr_z}',
                                    mag_auto_magerr_y: '{currentCoaddRecord.mag_auto_magerr_y}'
                                }
                                // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
                            }
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    },

    /**
     * @method clearPanel [description]
     *
     */
    clearPanel: function () {
        // console.log('clearPanel(%o)', arguments);

        var me = this;
        //     refs = me.getReferences(),
        //     properties = refs.CoaddProperties;

        // limpar o image viewer
        me.setCurrentImage(null);

    },

    setCurrentRecord: function (record) {
        // console.log('setCurrentRecord(%o)', record);

        var me = this,
            vm = me.getViewModel();

        // Limpar o painel antes de setar o record atual
        me.clearPanel();

        // Setar o currentRecord no Painel
        me.currentRecord = record;
        // Setar o currentRecord no viewModel
        vm.set('currentRecord', record);

        // Carregar a propertygrid ClassProperties
        me.loadClassProperties();

        // Setar Url para o Explorer
        me.setUrlToExplorerButton();

        // disparar evento before load
        me.fireEvent('beforeload', record, me);
    },

    /**
     * @method setCurrentCoaddRecord [description]
     * @param {[type]} record    [Description of record]

     * @return {void}
     */
    setCurrentCoaddRecord: function (record) {
        // console.log('setCurrentCoaddRecord(%o)', arguments);

        var me = this,
            vm = me.getViewModel();

        if ((record !== null) && (record.get('coadd_objects_id') > 0)) {

            me.currentCoaddRecord = record;

            vm.set('currentCoaddObject', record);
        }
    },

    loadClassProperties: function () {
        // console.log('loadClassProperties(%o)', arguments);

        var me = this,
            refs = me.getReferences(),
            classproperties = refs.ClassProperties,
            record = me.getCurrentRecord(),
            store = me.getClassColumns(),
            sourceConfig = {},
            source = {};

        classproperties.setLoading(true);

        store.each(function (column) {

            if (column.get('catalog_column_name')) {

                sourceConfig[column.get('catalog_column_name')] = {
                    displayName: column.get('property_name')
                };

                source[column.get('catalog_column_name')] = record.get(column.get('catalog_column_name'));
            }
        }, this);

        classproperties.setSource(source, sourceConfig);

        classproperties.setLoading(false);
    },

    setUrlToExplorerButton : function () {

        var me = this,
            refs = me.getReferences(),
            btn = refs.BtnExplorer,
            record = me.getCurrentRecord(),
            host = window.location.hostname,
            route = 'ps';

        // sy = Explorer System (cluster objects)
        // ps = Explorer Point Source (single object)

        if (record.get('_meta_is_system') === true) {
            route = 'sys';
        }

        var url = Ext.String.format('http://{0}/static/ws/build/production/Explorer/index.html#{1}/{2}/{3}',
                host, route, record.get('_meta_catalog_id'), record.get('_meta_id'));

        btn.setHref(url);
    },

    /**
     * @method setImages [descriptitileon]

     * @return {void}
     */
    setImages: function (store) {
        // console.log('setImages(%o)', store);

        var me = this,
            refs = me.getReferences(),
            cmb = refs.previewCurrentTile;

        if (store.count() == 1) {
            // Apenas uma tile na coordenada do objeto,
            // setar essa tile no imagepreview
            me.setCurrentImage(store.first());

            // Desabilitar a combobox Image
            cmb.setReadOnly(true);

        } else if (store.count() > 1) {

            me.setTiles(store);

            // Desabilitar a combobox Image
            cmb.setReadOnly(false);

            // Localizar a tile para o release e field do catalogo
            var tile = store.findRecord('field_id', me.getField());

            if (tile) {
                me.setCurrentImage(tile);

            } else {
                // caso nao tenha no mesmo release e field
                me.setCurrentImage(null);

                //  Seta a primeira que tiver
                me.setCurrentImage(store.first());
            }

        } else {
            console.log('Nenhuma tile encontrada para o objeto');
        }

    },

    setCurrentImage: function (record) {

        var me = this,
            refs = me.getReferences(),
            cmb = refs.previewCurrentTile,
            value;

        if (record) {
            value = record.get('display_name');
        } else {
            value = '';
        }

        cmb.setValue(value);

    },

    onChangeImage: function (rowModel) {
        // console.log('onChangeImage(%o)', record);

        var me = this,
            record = rowModel.getSelectedRecord();

        if (record) {

            me.setRelease(record.get('tag_id'));
            me.setField(record.get('field_id'));

            me.loadCurrentImage(record);

            // Disparar evento que a imagem o release e o field foi alterado
            me.fireEvent('changeimages', me, record);
        }
    },

    loadCurrentImage: function (record) {

        var me = this,
            refs = me.getReferences(),
            imageView = refs.ImageView,
            object = me.getCurrentRecord();

        if (!record) {
            imageView.removeTile();
            return false;
        }

        imageView.setTile(record);

        if (object) {

            imageView.setTarget(object);

        } else {
            imageView.setViewSky(
                record.get('ra'),
                record.get('dec'),
                imageView.getMaxZoom(),
                true
            );
        }
    }

});

