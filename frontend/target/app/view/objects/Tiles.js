/**
 *
 */
Ext.define('Target.view.objects.Tiles', {
    extend: 'Ext.grid.Panel',

    xtype: 'targets-objects-tiles',

    requires: [
        'Ext.grid.Panel',
        'Ext.grid.RowNumberer'
    ],

    columns: [
        Ext.create('Ext.grid.RowNumberer'),
        {text: 'Tilename',  dataIndex: 'tilename', flex: 1},
        {text: 'Count',  dataIndex: 'num_objects', width: 60}
    ]


    // clearGrid: function () {
    //     // console.log('Targets Tiles Grid - clearGrid()');
    //     var me = this,
    //         store = this.getStore();

    //     // Limpar a Store
    //     if (store != null){
    //         store.removeAll(true);
    //         store.clearFilter(true);
    //     }
    // }
});

