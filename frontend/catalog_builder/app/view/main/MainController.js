Ext.require('CatalogBuilder.view.service.Api');
//Ext.require('CatalogBuilder.store.QueryStore');
Ext.require('CatalogBuilder.view.dialog.DownloadDialog');
Ext.require('CatalogBuilder.view.dialog.NewDialog');
Ext.require('CatalogBuilder.view.dialog.OpenDialog');
Ext.require('CatalogBuilder.view.dialog.SaveAsDialog');
Ext.require('CatalogBuilder.view.dialog.StartJobDialog');

var myQueryNumber = 1;

var main = Ext.define('CatalogBuilder.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',
    activeQuery: {},
    activeRelease: {},

    afterRender: function () {
        var me = this;
        var refs = me.getReferences();
        var vm = me.getViewModel();
        this.status = {};

        vm.set('initialized', false);

        vm.set('initialized', true);
        //me.createEmptyQuery();
        refs.ctnArea.setStyle({
            opacity: 1
        });
        removeSplash();
        
        this.trelloPanels = new TrelloPanels({root:refs.panels.el.dom});
        this.propertiesInspector = new Properties({root:refs.propertiesInspector.el.dom});
        this.processesInspector = new Properties({root:refs.processesInspector.el.dom});

        this.processesInspector
            .renderTo(refs.processesInspector)
            .inspect(processes);


        this.propertiesInspector.renderTo(refs.propertiesInspector);
        this.trelloPanels
            .renderTo(refs.panels)
            .onCardActivate = (card, panel) => {
                console.log(card, panel);
                this.propertiesInspector.inspect(card.properties || [], card.label);
            };


        this.loadPanels(panels);
        return;

        // Api.getReleases(function(error, releases){
        //     if (!error){
        //         refs.cmbReleases.setStore(Ext.create('Ext.data.Store', {
        //             fields: ['id', 'rls_display_name'],
        //             data : releases
        //         }));
        //     }
        // })

        Api.parallel([
                // verifica se o usuário está autenticado
                Api.getUser(function (error, user) {
                    if (error) Api.doLogin();
                }),

                // busca a lista de releases
                Api.getReleases({
                    params: {
                        group: 'objects_catalog'
                    },
                    response: function (error, releases) {
                        var release;

                        if (!error) {
                            release = releases[0];

                            refs.cmbReleases.setStore(Ext.create('Ext.data.Store', {
                                fields: ['release_id', 'release_display_name'],
                                data: releases
                            }));

                            refs.cmbReleases.setValue(release.release_id);
                            me.createEmptyQuery(release.release_id);
                        }
                    }
                })
            ],

            // quanto todas as api's responderem, remove o splash screen e exibe a aplicação
            function () {
                vm.set('initialized', true);
                //me.createEmptyQuery();
                refs.ctnArea.setStyle({
                    opacity: 1
                });
                removeSplash();

                me.loadMyQueries();
                me.loadExternalTables();

                // setTimeout(function(){
                //     me.downloadCsv('table_id');
                // }, 400);
            }
        );

        new Ext.dd.DropTarget(refs.sql_sentence.getEl(), {
            ddGroup: 'TreeDD', // mesmo ddGroup definido na treeview
            notifyEnter: function (ddSource, e, data) {
                // 
            },
            notifyDrop: function (ddSource, e) {
                var row = ddSource.dragData.records[0].data;
                var textareafield = Ext.getCmp(this.el.id);
                var value = textareafield.getValue();

                value += (' ' + (row.data_schema ? row.data_schema + '.' : ''));

                if (row.data_field) {
                    value += (row.data_table + '.' + row.data_field);
                } else {
                    value += row.data_table;
                }

                textareafield.setValue(value);
            }
        });
    },

    //////////////////////////////////////////////////////
    /********************  EVENTS   ********************/
    //////////////////////////////////////////////////////

    
    //////////////////////////////////////////////////////
    /********************  METHODS   ********************/
    //////////////////////////////////////////////////////
    loadPanels(panels) {
        
        console.log('setPanels');
        this.trelloPanels.setPanels(panels);
    },    
});

let processes = [
    {
        type: 'multiselect',
        name: 'processes',
        label: null,
        validate: {
            min: 1
        },
        values: [
            {label:'Query Builder', selected:true},
            {label:'Catalog Properties', selected:true}
        ]
    }
];
let panels = [
    {
        label: 'Region Selection',
        name: 'map-selection',
        cards: [{
                label: 'Map Resolution',
                properties: [{
                    type: 'number',
                    name: 'map_resolution',
                    label: 'HEALPix Map Resolution',
                    default: 4096
                }]
            },
            {
                label: 'Mangle Detfrac Map',
                properties: [{
                        type: 'number',
                        name: 'g'
                    },
                    {
                        type: 'number',
                        name: 'r'
                    },
                    {
                        type: 'number',
                        name: 'i',
                        default: '0.8'
                    },
                    {
                        type: 'number',
                        name: 'z'
                    },
                    {
                        type: 'number',
                        name: 'Y'
                    },
                    {
                        type: 'select',
                        name: 'reference_band',
                        label: 'Reference band to report area',
                        default: 'i',
                        values: ['g', 'r', 'i', 'z', 'Y']
                    }
                ]
            },
            {
                label: 'Bad Regions Mask',
                properties: [{
                    type: 'multiselect',
                    label: null,
                    name: 'bad_regions',
                    values: [
                        'Regions with bad astrometric colors',
                        {
                            label: 'Fainter 2MASS star region (8 < J < 12)',
                            selected: true
                        },
                        {
                            label: 'Large nearby object (R3C catalog)',
                            selected: true
                        },
                        {
                            label: 'Bright 2MASS star region (5 < J < 8)',
                            selected: true
                        },
                        'Near the LMC',
                        {
                            label: 'Yale Bright Star region',
                            selected: true
                        },
                        'High density of crazy colors',
                        {
                            label: 'Globular Clusters (William et al. 2010)',
                            selected: true
                        }
                    ]
                }]
            },
            {
                label: 'Depth Map'
            },
            {
                label: 'Systematic Maps - Min,Max'
            },
            {
                label: 'Additional Mask'
            }
        ]
    },
    {
        label: 'Object Selection',
        name: 'object-selection',
        cards: [{
                label: 'Magnitude Type'
            },
            {
                label: 'Signal-to-noise cuts'
            },
            {
                label: 'Bright magnitude cuts'
            },
            {
                label: 'Magnitude limit cuts'
            },
            {
                label: 'Color cuts'
            },
            {
                label: 'Mangle Bitmask'
            },
            {
                label: 'Sextractor reference bands'
            },
            {
                label: 'Niter Model greater than zero'
            },
            {
                label: 'Photo z',
                properties: [
                    {
                        type: 'select',
                        name: 'photoz_input',
                        label: 'Input data',
                        values:[
                            'photoZ product 01',
                            'photoZ product 02'
                        ]
                    },
                    {
                        type: 'number',
                        name: 'z_min',
                        label: 'Z min',
                        default: '0',
                        validate:{
                            min: 0,
                            max: 10
                        }
                    },
                    {
                        type: 'number',
                        name: 'z_max',
                        label: 'Z max',
                        default: '2.0'
                    }
                ]
            }
        ]
    },
    {
        label: 'Output',
        name: 'output',
        cards:[
            {
                label: 'Photometric correction',
                label_properties: 'Photometric correction - columns',
                properties: [{
                    type: 'multiselect',
                    name: 'photometric_correction',
                    label: null,
                    values: [
                        'slr_shift_g', 'slr_shift_r', 'slr_shift_i', 'slr_shift_z', 'slr_shift_y'
                    ]
                }]
            },
            {
                label: 'Depth Maps',
                properties: [{
                    type: 'multiselect',
                    name: 'depth_maps',
                    label: null,
                    values: [
                        'depth_map_g', 'depth_map_r', 'depth_map_i', 'depth_map_z', 'depth_map_Y'
                    ]
                }]
            },
            {
                label: 'Systematic Maps',
                properties: [{
                    type: 'multiselect',
                    name: 'systematic_maps',
                    label: null,
                    values: [
                        'exposure_time_g', 'exposure_time_r', 'exposure_time_i', 'exposure_time_z', 'exposure_time_Y', 'airmass_g', 'airmass_r', 'airmass_i', 'airmass_z', 'airmass_Y', 'fwhm_g', 'fwhm_r', 'fwhm_i', 'fwhm_z', 'fwhm_Y', 'sky_brightness_g', 'sky_brightness_r', 'sky_brightness_i', 'sky_brightness_z', 'sky_brightness_Y', 'sky_sigma_g', 'sky_sigma_r', 'sky_sigma_i', 'sky_sigma_z', 'sky_sigma_Y'
                    ]
                }]
            }
        ]
    }
];
