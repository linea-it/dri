Ext.define('Target.view.association.Panel', {
    extend: 'Ext.panel.Panel',

    /**
     * @requires AssociationController
     */
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
                        store: '{association}'
                    },
                    region: 'center',
                    reference: 'productcontentgrid',
                    viewConfig: {
                        plugins: {
                            ptype: 'customcelldragdrop',
                            ddGroup: group1,
                            containerScroll: true,
                            enableDrag: false,
                            enableDrop: true,
                            dropColumn: 'pcc_display_name'
                        },
                        listeners: {
                            drop: function (node, data, dropRec, dropPosition) {
                                console.log('DROP');
                                console.log(node, data, dropRec, dropPosition);
                                // var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
                                // console.log('Drag from right to left Dropped ' + data.records[0].get('pcc_name') + dropOn);
                            }
                        }
                    },
                    tbar: [
                        {
                            xtype: 'button',
                            text: 'CLEAR'
                        },
                        {
                            xtype: 'button',
                            text: 'CLEAR ALL'
                        },
                        {
                            xtype: 'common-searchfield',
                            minSearch: 1,
                            listeners: {
                                'search': 'onSearchAssociation',
                                'cancel': 'onCancelAssociation'
                            },
                            flex: 1
                        }
                    ]

                    // listeners: {
                    //     drop: function (node, data, dropRec, dropPosition) {
                    //         console.log('DROP');
                    //         console.log(node, data, dropRec, dropPosition);
                    //         // var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
                    //         // console.log('Drag from right to left Dropped ' + data.records[0].get('pcc_name') + dropOn);
                    //     }
                    // }
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
                                    ptype: 'celldragdrop',

                                    applyEmptyText: true,

                                    ddGroup: group1,

                                    enableDrag: true,

                                    enableDrop: false
                                },
                                listeners: {

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

        this.fireEvent('changeproduct', product, this);

    }

});
