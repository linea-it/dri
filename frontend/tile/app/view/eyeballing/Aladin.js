Ext.define('Tile.view.eyeballing.Aladin', {
    extend: 'aladin.Aladin',

    xtype: 'eyeballing-aladin',

    requires: [
        'aladin.Aladin'
    ],

    // Iniciar com footprint visivel
    hideFootprint: false,

    // Inicar com tile grid visivel
    tilesGridVisible: true,

    // Inicar com nivel de zoom mais longe da tile.
    initialFov: 4,

    auxTools: [
        {
            xtype: 'button',
            iconCls: 'x-fa fa-exclamation-triangle',
            text: 'Flag',
            tooltip: 'Flag/Unflag',
            enableToggle: true,
            toggleHandler: 'onFlagDataset',
            bind: {
                pressed: '{flagged.flg_flagged}'
            }
        }
    ]

});
