Ext.define('common.account.ApiToken', {
    extend: 'Ext.window.Window',

    requires: [
        'common.account.AccountController'
    ],

    xtype: 'apitoken-window',

    title: 'API Token',

    controller: 'account',

    config: {
        store: null
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            width: 450,
            height: 250,
            minWidth: 300,
            minHeight: 250,
            resizable: true,
            maximizable: false,
            modal: true,
            closeAction: 'destroy',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'panel',
                    bodyPadding: 20,
                    items: [
                        {
                            xtype: 'panel',
                            html: [
                                "<p>",
                                "Generate a personal token to be used in the Science Server API.",
                                "</br>",
                                "Only one token can be used at a time.",
                                "</br>",
                                "By clicking on \"Generate new token\" the old token will be removed.",
                                "</br>",
                                "Copy the token and keep it in a safe place.",
                                "</br>",
                                "The token will not be visible after the window is closed.",
                                "</br>",
                                "</p>"
                            ]
                        },
                        {
                            xtype: 'container',
                            items: [{
                                xtype: 'toolbar',
                                // padding: '0 0 8 0',
                                items: [
                                    {
                                        xtype: 'button',
                                        handler: 'newApiToken',
                                        tooltip: 'Generate API Token',
                                        text: 'Generate API Token',
                                    },

                                    {
                                        xtype: 'textfield',
                                        readOnly: true,
                                        flex: 1,
                                        reference: 'txtToken',
                                    },
                                    {
                                        xtype: 'button',
                                        iconCls: 'x-fa fa-files-o',
                                        handler: 'copyToken',
                                        tooltip: 'Copy to clipboard',
                                        reference: 'btnCopy',
                                        disabled: true
                                    }
                                ],
                            }]
                        }]
                },
            ]
        });

        me.callParent(arguments);
    }

});
