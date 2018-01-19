Ext.define('Target.view.preview.Visiomatic', {
    extend: 'visiomatic.Visiomatic',

    requires: [
        'visiomatic.Visiomatic'
    ],

    xtype: 'targets-visiomatic',

    enableTools: false,
    enableMiniMap: true,
    enableContextMenu: true,
    enableComments: true,
    contextMenuItens: [
        // nesse caso o onCustomMenuItemClick deve está no Target.view.main.MainController
        // '-',
        // {
        //     text: 'Custom menu item', 
        //     handler: 'onCustomMenuItemClick'
        // }
    ]
});
