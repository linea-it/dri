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
        'Ext.ux.CellDragDrop'
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

                    viewConfig: {
                        plugins: {
                            ptype: 'celldragdrop',
                            ddGroup: group1,

                            enableDrag: false,

                            enableDrop: true
                        },
                        dropZone: {
                            onNodeEnter : function (target, dd, e, data) {
                                console.log('onNodeEnter');
                                console.log(target, dd, e, data);
                                Ext.fly(target).addCls('my-row-highlight-class');
                            }
                        }
                    }
                    // viewConfig: {
                    //     plugins: {
                    //         ptype: 'gridviewdragdrop',
                    //         containerScroll: true,
                    //         ddGroup: group1,
                    //         enableDrag: false,
                    //         enableDrop: true
                    //         // dropZone: {
                    //         //     // On entry into a target node, highlight that node.
                    //         //     onNodeEnter : function (target, dd, e, data) {
                    //         //         console.log('onNodeEnter');
                    //         //         console.log(target, dd, e, data);
                    //         //         Ext.fly(target).addCls('my-row-highlight-class');
                    //         //     },

                    //         //     // On exit from a target node, unhighlight that node.
                    //         //     onNodeOut : function (target, dd, e, data) {
                    //         //         console.log('onNodeOut');
                    //         //         Ext.fly(target).removeCls('my-row-highlight-class');

                    //         //     },

                    //         //     // While over a target node, return the default drop allowed class which
                    //         //     // places a "tick" icon into the drag proxy.
                    //         //     onNodeOver : function (target, dd, e, data) {
                    //         //         console.log('onNodeOver');
                    //         //         return Ext.dd.DropZone.prototype.dropAllowed;

                    //         //     }
                    //         // }
                    //     },
                    //     listeners: {
                    //         drop: function (node, data, dropRec, dropPosition) {
                    //             console.log('DROP');
                    //             console.log(node, data, dropRec, dropPosition);
                    //             // var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
                    //             // console.log('Drag from right to left Dropped ' + data.records[0].get('pcc_name') + dropOn);

                    //         }
                    //     }
                    // }
                },
                {
                    xtype: 'panel',
                    split: true,
                    resizable: true,
                    region: 'east',
                    width: 300,
                    layout: {
                        type: 'vbox',
                        pack: 'start',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'targets-association-class-content-form',
                            reference: 'classcontentform',
                            height: 200
                        },
                        {
                            xtype: 'targets-association-class-content',
                            itemId: 'grid2',
                            reference: 'classcontentgrid',
                            bind: {
                                store: '{classcontent}'
                            },
                            flex: 2,
                            // viewConfig: {
                            //     plugins: {
                            //         ptype: 'gridviewdragdrop',
                            //         containerScroll: true,
                            //         ddGroup: group1,
                            //         // dropGroup: group1,
                            //         enableDrop: false
                            //     },
                            //     listeners: {
                            //         // drop: function(node, data, dropRec, dropPosition) {
                            //         //     var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
                            //         //     Ext.example.msg('Drag from right to left', 'Dropped ' + data.records[0].get('name') + dropOn);
                            //         // }
                            //     }
                            // }
                            // }
                            viewConfig: {
                                plugins: {
                                    ptype: 'celldragdrop',

                                    // Remove text from source cell and replace with value of emptyText.
                                    applyEmptyText: true,

                                    //emptyText: Ext.String.htmlEncode('<<foo>>'),

                                    // Will only allow drops of the same type.
                                    //enforceType: true,

                                    ddGroup: group1,

                                    enableDrag: true,

                                    enableDrop: false
                                },
                                listeners: {

                                }
                            }
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
