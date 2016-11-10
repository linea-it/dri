/**
 *
 */
Ext.define('Target.view.catalog.Tree', {
    extend: 'Ext.tree.Panel',

    xtype: 'targets-catalog-tree',

    requires: [
        'Target.view.catalog.CatalogController',
        'Target.view.catalog.CatalogModel',
        // 'common.process.ViewProcessButton',
        'Ext.grid.filters.Filters'
    ],

    controller: 'catalog',

    viewModel: 'catalog',

    rootVisible: false,

    useArrows: true,

    selModel: {
        mode: 'SINGLE'
    },

    layout: 'fit',

    plugins: 'gridfilters',

    bind: {
        store: '{catalogs}',
        selection: '{selectedCatalog}'
    },

    config: {
        bsfilters: null
    },

    emptyText: 'No data to dysplay.',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            columns: [
                {
                    xtype: 'treecolumn',
                    text: 'Name',
                    flex: 2,
                    sortable: true,
                    dataIndex: 'text'
                },
                {
                    text: 'Owner',
                    flex: 1,
                    dataIndex: 'epr_username',
                    sortable: true,
                    filter: {
                        type: 'string'
                    }
                },
                {
                    xtype: 'datecolumn',
                    text: 'Date',
                    dataIndex: 'epr_end_date',
                    sortable: true,
                    filter: {
                        type: 'date'
                    }
                },
                // {
                //     text: 'Pipeline',
                //     dataIndex: 'epr_name',
                //     sortable: true,
                //     filter: {
                //         type: 'string'
                //     }
                // },
                {
                    text: 'Process',
                    dataIndex: 'epr_original_id',
                    sortable: true,
                    filter: {
                        type: 'number'
                    }
                },
                {
                    text: 'Rows',
                    dataIndex: 'ctl_num_objects',
                    sortable: true,
                    renderer: function (value, metadata, record) {
                        if (record.data.leaf) {
                            return value;
                        }
                    },
                    filter: {
                        type: 'number'
                    }
                }
                // {
                //     text: 'Release',
                //     dataIndex: 'release_display_name',
                //     sortable: true,
                //     filter: {
                //         type: 'string'
                //     }
                // }
            ],
            listeners: {
                load: function (treeStore) {
                    // var root = treeStore.getRootNode();
                    // root.expand();
                },
                rowdblclick: function (grid, record) {
                    me.viewRecord(record);
                }
            },
            tbar: [
//                {
//                    tooltip: 'Open this catalog',
//                    iconCls: 'x-fa fa-folder-open-o',
//                    width: 60,
//                    scope: this,
//                    handler: me.onClickView,
//                    bind: {
//                        disabled: '{!selectedCatalog}'
//                    }
//                },
                // {
                //     xtype: 'viewprocess-button',
                //     tooltip:'More Information',
                //     iconCls: 'x-fa fa-info-circle',
                //     width: 60,
                //     bind: {
                //         disabled: '{!selectedCatalog.process_id}',
                //         process: '{selectedCatalog.process_id}'
                //     }
                // },
                // Button Starred Catalog
                {
                    xtype: 'splitbutton',
                    tooltip:'Bookmark This Catalog',
                    iconCls: 'x-fa fa-bookmark',
                    handler: 'onStarredCatalog',
                    width: 60,
                    enableToggle: true,
                    disabled: true,
                    bind: {
                        // disabled: '{!selectedCatalog.markable}',
                        pressed: '{selectedCatalog.starred}'
                    },
                    menu: [{
                        text:'Show only bookmarked',
                        handler: 'filterByStarred'
                    }]
                },
                // Button Remove Catalog
                {
                    tooltip:'Remove Catalog',
                    iconCls: 'x-fa fa-trash',
                    handler: 'onRemoveCatalog',
                    width: 60,
                    bind: {
                        // disabled: '{!selectedCatalog.editable}'
                    }
                },
                {
                    xtype: 'textfield',
                    emptyText: 'Search by name',
                    width: 250,
                    triggers: {
                        clear: {
                            cls: 'x-form-clear-trigger',
                            handler: this.cancelFilter,
                            hidden: true
                        },
                        search: {
                            cls: ' x-form-search-trigger'
                        }
                    },
                    listeners: {
                        change: me.filterByname,
                        buffer: 500
                    }
                },
                {
                    tooltip: 'Refresh and Clear filters',
                    iconCls: 'x-fa fa-refresh',
                    handler: me.refreshAndClear
                },{
                    tooltip: 'Cutout',
                    iconCls: 'x-fa fa-cut',
                    handler: me.cutout
                }
            ]
        });

        me.callParent(arguments);
    },

    selecteNodeTree: function (record) {
        this.getSelectionModel().select(record);
    },

    getSelectedCatalog: function () {
        var records = this.getView().getChecked();

        if (records.length > 0) {
            return records[0];
        } else {
            var sm = this.getSelectionModel();
            records = sm.getSelection();
            return records[0];
        }
    },

    loadCatalogs: function (type) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('catalogs'),
            filters = [],
            baseFilters = [];

        // me.getView().setLoading({
        //     store: store
        // });

        // // Catalog not removed
        // filters.push({
        //     property:'product_flag_removed',
        //     value: false
        // });

        // Product Type = 'targets'
        filters.push({
            property:'group',
            value: type.toLowerCase()
        });


        // Guardar os filtros usados no load dos catologos
        baseFilters = Ext.clone(filters);
        me.setBsfilters(baseFilters);

        store.filter(filters);
    },

    onClickView: function () {
        // console.log('onClickView()');
        var me = this,
            record = me.getSelectedCatalog();

        me.viewRecord(record);

    },

    onActionView: function (grid, rowIndex, colIndex, actionItem, event, record, row) {
        // console.log('onActionView(%o)', arguments);
        this.viewRecord(record);
    },

    viewRecord: function (record) {
        // console.log('viewRecord(%o)', arguments);

        this.fireEvent('selectcatalog', record, this);
    },

    filterByname: function () {

        var tree = this.up('treepanel'),
            store = tree.getStore(),
            value = this.getValue(),
            fts = [],
            f;

        if (value.length > 0) {

            this.getTrigger('clear').show();

            // checar se a store esta em loading
            if (store.isLoading()) {
                // Se a store estiver carregando ainda cancelar o ultimo
                // request antes de fazer um novo
                console.log('Store is Loading: %o', store.isLoading());

                var proxy = store.getProxy();
                proxy.abort();

                console.log('Store proxy abort');
            }

            f = {
                property: 'search',
                value: value
                // operator: 'like'
            };

            fts.push(f);

            tree.filterCatalogs(fts);
        } else {
            this.getTrigger('clear').hide();
        }

    },

    filterCatalogs: function (search) {

        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('catalogs'),
            baseFilters = me.getBsfilters(),
            f,
            fts = Ext.clone(baseFilters);

        me.filters.clearFilters();
        store.clearFilter(true);
        store.removeAll();

        if ((search) && (Array.isArray(search))) {

            for (index in search) {
                f = search[index];
                fts.push(f);
            }
        }

        store.filter(fts);
    },

    cancelFilter: function () {

        var tree = this.up('treepanel');

        this.reset();

        tree.filterCatalogs();

        this.getTrigger('clear').hide();
    },

    refreshAndClear: function () {

        var tree = this.up('treepanel');

        tree.filterCatalogs();
    },
    cutout: function () {
        var me = this,
        win = Ext.create('Ext.window.Window', {
            title: 'Cutout',
            height: 300,
            width: 400,
            layout: 'fit',
            items: {
                xtype: 'form',
                id: 'formcut',
                items: {
                    xtype: 'fieldset',
                    margin: '5 5 5 5',
                    // title: 'Cutout',
                    defaultType: 'textfield',
                    defaults: {
                        anchor: '100%'
                    },
                    
                    items: [{
                        margin: '5 0 5 0',
                        fieldLabel: 'Cutout Name',
                        emptyText: 'Cutout Name',
                        name: 'name'
                    }, {
                        fieldLabel: 'xsize',
                        name: 'xsize',
                        emptyText:'Ex: 1.0',
                        triggers: {
                        clear: {
                            cls: 'fa fa-question-circle',
                            tooltip: 'help',
                                handler : function() {
                                    Ext.Msg.alert('xsize', 'xsize of cutout in arcmin, can be single number or list');
                                }
                            }
                        }
                    }, {
                        fieldLabel: 'ysize',
                        name: 'ysize',
                        emptyText:'Ex: 1.0',
                        triggers: {
                        clear: {
                            cls: 'fa fa-question-circle',
                            tooltip: 'help',
                                handler : function() {
                                    Ext.Msg.alert('ysize', 'ysize of cutout in arcmin, can be single number or list');
                                }
                            }
                        }
                    }, {
                        xtype: 'combobox',
                        fieldLabel: 'Job Type',
                        name: 'jobType',
                        store: [
                            ['coadd', 'Coadd'],
                            ['single', 'Single Epochs']
                        ],
                        valueField: 'abbr',
                        displayField: 'state',
                        typeAhead: true,
                        queryMode: 'local',
                        emptyText: 'Select a Type...',
                        listeners: {
                            change: function(ele, newValue, oldValue) { 
                                if (newValue == 'single'){
                                    Ext.getCmp('band').getEl().show();
                                    Ext.getCmp('blacklist').getEl().show();
                                }else{
                                    Ext.getCmp('band').getEl().hide();
                                    Ext.getCmp('blacklist').getEl().hide();
                                }
                            }
                        }
                    },{
                        xtype: 'checkbox',
                        fieldLabel: 'No Blacklist',
                        hidden : true,
                        id: 'blacklist',
                        name: 'blacklist'     
                    },{
                        fieldLabel: 'Band',
                        name: 'band',
                        id: 'band',
                        emptyText:'Ex: g,r,i',
                        hidden: true,
                        triggers: {
                        clear: {
                            cls: 'fa fa-question-circle',
                            tooltip: 'help',
                                handler : function() {
                                    Ext.Msg.alert('Band', 'List of bands for single epoch exposures "g,r,i,z,Y"');
                                }
                            }
                        }
                    },{
                        xtype: 'panel',
                        layout: 'hbox',
                        items:[
                        {
                        xtype: 'button',
                        text: 'Submit',
                        width: 150,
                            handler: function() {
                                console.log(me)
                                values = Ext.getCmp('formcut').getValues()
                                console.log(values)

                                balacklist = null
                                band = null
                           
                                if (values.jobType == "single"){
                                    blacklist = values.blacklist
                                    band = values.band
                                }
                                var myStore = Ext.create('Ext.data.Store', {
                                    // model: 'User',
                                    proxy: {
                                        type: 'ajax',
                                        url: '/dri/api/CutOutJob/',
                                        reader: {
                                            type: 'json',
                                            rootProperty: 'users'
                                        }
                                    },
                                    // autoLoad: true
                                });

                                myStore.add ({
                                    "cjb_product": 20,
                                    "cjb_display_name": values.name,
                                    "cjb_status": "st",
                                    "cjb_job_id": "---",
                                    'cjb_xsize': values.xsize,
                                    'cjb_ysize': values.ysize,
                                    'cjb_job_type': values.jobType,
                                    'cjb_band': band,
                                    'cjb_Blacklist': blacklist,
                                    // 'cjb_status': 'st'
                                });
                                console.log(myStore)
                                myStore.sync()                                
                            }
                        }]
                    }]
                }
            }
        })
        win.show();
    }
    
});