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
                            disabled: true,
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
                                store: '{classcontent}'
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
            ]
        });

        me.callParent(arguments);
    },

    setProduct: function (product) {

        this.product = product;

        if (product) {
            this.fireEvent('changeproduct', product, this);
        }
    }

});
