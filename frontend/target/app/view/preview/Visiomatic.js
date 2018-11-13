Ext.define('Target.view.preview.Visiomatic', {
    extend: 'visiomatic.Visiomatic',

    requires: [
        'visiomatic.Visiomatic'
    ],

    xtype: 'targets-visiomatic',

    enableTools: false,
    enableMiniMap: true,
    enableLink: false,
    // Exemplo para adicionar mais items ao menu de contexto.
    // contextMenuItens: [
        // nesse caso o onCustomMenuItemClick deve está no Target.view.main.MainController
        // '-',
        // {
        //     text: 'Custom menu item',
        //     handler: 'onCustomMenuItemClick'
        // }
    // ]
});
