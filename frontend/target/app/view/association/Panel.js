Ext.define('Target.view.association.Panel', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Target.view.association.AssociationController',
        'Target.view.association.AssociationModel',
        'Target.view.association.Grid',
        'Target.view.association.ClassContent',
        'Target.view.association.ClassContentForm',
        'Ext.ux.dd.CellFieldDropZone',
        'Ext.ux.CellDragDrop',
        'Target.view.association.CellDragDrop',
        'common.SearchField'
    ],

    xtype: 'targets-association',

    controller: 'association',

    viewModel: 'association',

    config: {
        product: null
    },

    layout: 'border',

    initComponent: function () {
        var me = this,
            group1 = me.id + 'group1',
            group2 = me.id + 'group2';

        Ext.apply(this, {
            items: [
                {
                    xtype: 'panel',
                    region: 'north',
                    height: 80,
                    bodyPadding: 10,
                    html: [
                        '<p>The properties in your catalog must be associated with the available properties for the target class.</br>' +
                        'It is necessary to make association for property ID, RA and Dec.' +
                        '</p>'
                    ]
                },
                {
                    xtype: 'targets-association-grid',
                    itemId: 'grid1',
                    bind: {
                        store: '{fakeassociation}'
                    },
                    region: 'center',
                    reference: 'productcontentgrid',
                    viewConfig: {
                        markDirty: false,
                        plugins: {
                            ptype: 'customcelldragdrop',
                            ddGroup: group1,
                            containerScroll: true,
                            enableDrag: false,
                            enableDrop: true,
                            dropColumn: 'pcc_display_name'
                        },
                        listeners: {
                            celldrop: 'onCellDrop'
                        }
                    },
                    tbar: [
                        {
                            xtype: 'common-searchfield',
                            minSearch: 1,
                            listeners: {
                                'search': 'onSearchAssociation',
                                'cancel': 'onCancelAssociation'
                            },
                            flex: 1
                        },
                        {
                            xtype: 'button',
                            text: 'Remove',
                            iconCls: 'x-fa fa-minus-circle',
                            tooltip: 'Remove the selected association.',
                            handler: 'onRemove',
                            bind: {
                                disabled: '{!productcontentgrid.selection}'
                            }
                        },
                        {
                            xtype: 'button',
                            text: 'Clear',
                            iconCls: 'x-fa fa-eraser',
                            tooltip: 'Removes all associations.',
                            handler: 'onRemoveAll'
                        }
                    ]
                },
                {
                    xtype: 'panel',
                    split: true,
                    resizable: true,
                    region: 'east',
                    width: 400,
                    layout: {
                        type: 'vbox',
                        pack: 'start',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'targets-association-class-content',
                            itemId: 'grid2',
                            reference: 'classcontentgrid',
                            bind: {
                                store: '{auxclasscontent}'
                            },
                            flex: 2,
                            viewConfig: {
                                plugins: {
                                    ptype: 'customcelldragdrop',

                                    applyEmptyText: true,

                                    ddGroup: group1,

                                    enableDrag: true,

                                    enableDrop: false
                                }
                            }
                        },
                        {
                            xtype: 'targets-association-class-content-form',
                            reference: 'classcontentform',
                            height: 220
                        }
                    ],
                    tbar: [
                        {
                            xtype: 'common-searchfield',
                            minSearch: 1,
                            listeners: {
                                'search': 'onSearchClassContent',
                                'cancel': 'onCancelClassContent'
                            },
                            flex: 1
                        }
                    ]
                }
            ],
            buttons: [
                // {
                //     text: 'Previous',
                //     scope: me,
                //     handler: function () {
                //         this.fireEvent('previous');
                //     }
                // },
                // {
                //     text: 'Next',
                //     scope: me,
                //     handler: function () {
                //         this.fireEvent('next');
                //     }
                // },
                {
                    text: 'Cancel',
                    scope: me,
                    handler: 'onCancel'
                },
                {
                    text: 'OK',
                    itemId: 'AssociationBtnFinish',
                    ui: 'soft-green',
                    scope: me,
                    handler: 'onFinish',
                    hidden: true
                }
            ]
        });

        me.callParent(arguments);
    },

    setProduct: function (product) {
        if (product) {
            this.product = product;
            this.fireEvent('changeproduct', product, this);

        }
    },

    setCatalog: function (catalog) {
        if (catalog) {
            this.product = catalog.get('id');
            this.fireEvent('changeCatalog', catalog, this);
        }
    },

    getCatalog: function () {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog');

        return currentCatalog;
    },

    onFinish: function () {
        this.fireEvent('finish', this);

    },

    onCancel: function () {
        this.fireEvent('cancel', this);

    },

    checkFinish: function () {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('displayContents'),
            product = me.getProduct();

        store.addFilter([
            {'property': 'pcn_product_id', value: product}
        ]);
        store.load({
            callback: function () {

                if (this.check_ucds()) {
                    me.down('#AssociationBtnFinish').setVisible(true);
                } else {
                    me.down('#AssociationBtnFinish').setVisible(false);
                }
            }
        });
    }

});
