/**
 *
 */
Ext.define('Target.view.catalog.Tree', {
    extend: 'Ext.tree.Panel',

    xtype: 'targets-catalog-tree',

    requires: [
        'Target.view.catalog.CatalogController',
        'Target.view.catalog.CatalogModel',
        'Target.view.catalog.RegisterWindow',
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

    emptyText: 'No data to display.',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            columns: [
                {
                    xtype: 'treecolumn',
                    text: 'Name',
                    flex: 2,
                    sortable: true,
                    dataIndex: 'text',
                    renderer: me.getTooltipName
                },
                {
                    text: 'Owner',
                    flex: 1,
                    dataIndex: 'owner',
                    sortable: true,
                    filter: {
                        type: 'string'
                    }
                },
                {
                    text: 'Release',
                    flex: 1,
                    dataIndex: 'release_display_name',
                    sortable: true,
                    filter: {
                        type: 'string'
                    }
                },
                {
                    xtype: 'datecolumn',
                    text: 'Date',
                    dataIndex: 'prd_date',
                    width: 150,
                    sortable: true,
                    format: 'Y-m-d H:m:s',
                    filter: {
                        type: 'date'
                    }
                },
                {
                    text: 'Rows',
                    dataIndex: 'tbl_rows',
                    sortable: true,
                    renderer: function (value, metadata, record) {
                        if (record.data.leaf) {
                            return value;
                        }
                    }
                },
                {
                    text: 'Cols',
                    dataIndex: 'tbl_num_columns',
                    sortable: true,
                    renderer: function (value, metadata, record) {
                        if ((record.data.leaf) && (value > 0)) {
                            return value;
                        }
                    }
                }
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
                // Add a New catalog
                {
                    xtype: 'button',
                    iconCls: 'x-fa fa-plus',
                    ui: 'soft-green',
                    tooltip: 'Add a new list of targets.',
                    handler: 'onAddCatalog'
                },

                // Button Remove Catalog
                {
                    tooltip: 'Remove Target List',
                    iconCls: 'x-fa fa-trash',
                    ui: 'soft-red',
                    handler: 'onRemoveCatalog',
                    disabled: true,
                    bind: {
                        disabled: '{!selectedCatalog.editable}'
                    }
                },
                // Button Bookmark Catalog
                {
                    xtype: 'splitbutton',
                    tooltip: 'Bookmark This Catalog',
                    iconCls: 'x-fa fa-bookmark',
                    handler: 'onStarredCatalog',
                    width: 60,
                    enableToggle: true,
                    bind: {
                        pressed: '{selectedCatalog.starred}'
                    },
                    menu: [{
                        text: 'Show only bookmarked',
                        handler: 'filterByStarred'
                    }]
                },
                {
                    xtype: 'textfield',
                    reference: 'searchByName',
                    // itemId: 'searchByName',
                    emptyText: 'Search by name',
                    width: 250,
                    triggers: {
                        clear: {
                            cls: 'x-form-clear-trigger',
                            scope: this,
                            handler: this.cancelFilter,
                            hidden: true
                        },
                        search: {
                            cls: ' x-form-search-trigger'
                        }
                    },
                    listeners: {
                        scope: this,
                        change: me.filterByname,
                        buffer: 500
                    }
                },
                {
                    tooltip: 'Refresh and Clear filters',
                    iconCls: 'x-fa fa-refresh',
                    scope: this,
                    handler: me.refreshAndClear
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

        // Product Type = 'targets'
        filters.push({
            property: 'group',
            value: type.toLowerCase()
        });

        // Guardar os filtros usados no load dos catologos
        baseFilters = Ext.clone(filters);
        me.setBsfilters(baseFilters);

        store.filter(filters);
    },

    onClickView: function () {
        var me = this,
            record = me.getSelectedCatalog();

        me.viewRecord(record);

    },

    onActionView: function (grid, rowIndex, colIndex, actionItem, event, record) {
        this.viewRecord(record);

    },

    viewRecord: function (record) {
        // So disparar o evento se o catalogo tiver a sua tabela disponivel
        // https://github.com/linea-it/dri/issues/662
        if ((record.get('tableExist') == true) &&
            (record.get('leaf') == true)) {

            this.fireEvent('selectcatalog', record, this);

        } else {
            if (record.get('leaf') == true) {
                // Avisar o usuario que a tabela esta indisponivel.
                Ext.MessageBox.alert(
                    'Warning',
                    'The table for this product is not currently available or does not exist');
            }
        }
    },

    filterByname: function () {
        var me = this,
            txt = me.lookup('searchByName'),
            // txt = me.down('#searchByName'),
            store = me.getStore(),
            value = txt.getValue(),
            fts = [],
            f;

        if (value.length > 0) {

            txt.getTrigger('clear').show();

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
            };

            fts.push(f);

            me.filterCatalogs(fts);
        } else {
            me.cancelFilter();
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
        var me = this,
            txt = me.lookup('searchByName');

        txt.reset();

        txt.getTrigger('clear').hide();

        me.filterCatalogs();
    },

    refreshAndClear: function () {
        var me = this;

        me.cancelFilter();
    },

    getTooltipName: function (value, meta, record) {
        var me = this,
            tpl, tooltip;

        tpl = new Ext.XTemplate(
            '<div>',
            //'<spam><b>{prd_display_name}</b></spam>',
            '<tpl if=\'description != ""\'>',
            '<p><spam><b>Description:</b></spam>{description}</p>',
            '</tpl>',
            '<tpl if=\'epr_original_id != ""\'>',
            '<p><spam><b>Proccess: </b></spam>{epr_original_id}</p>',
            '</tpl>',
            '<tpl if=\'tbl_size != null\'>',
            '<p><spam><b>Size: </b></spam>{tbl_size}</p>',
            '</tpl>',
            '<tpl if=\'!tableExist\'>',
            '</br><spam><b class=color-orange>Warning</b>: ',
            'The table for this product is not currently available or does not exist.</spam>',
            '</tpl>',
            '</div>'
        );

        tooltip = tpl.apply(record.data);

        // So exibe popup se tiver descricao ou numero de processo.
        if ((record.get('description') !== '')
            || (record.get('epr_original_id') !== '')) {

            if (record.get('leaf')) {
                meta.tdAttr = 'data-qtip=\"' + tooltip + '\"';
            }

        }

        return value;
    }

});
