Ext.define('common.link.LinkPrompt', {
    extend: 'Ext.window.Window',

    config: {
        link: null
    },

    // header: true,
    closable: true,
    title: 'Get Link',

    closeAction: 'destroy',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {

            items:[
                {
                    xtype: 'container',
                    layout: 'hbox',
                    padding: 10,
                    style: {
                        overflow: 'hidden'
                    },
                    items: [
                        {
                            xtype: 'container',
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            items: [
                                {
                                    xtype: 'container',
                                    layout: 'hbox',
                                    margin: '0 0 5 0',
                                    items: [
                                        {
                                            xtype: 'textfield',
                                            value: me.getLink(),
                                            readOnly: true,
                                            width: 400,
                                            flex: 1,
                                            height: 32
                                        },
                                        {
                                            xtype: 'button',
                                            iconCls: 'x-fa fa-clipboard',
                                            tooltip: 'Copy to clipboard',
                                            scope: me,
                                            handler: 'copyClipboard',
                                            scale: 'medium'
                                            // ui: 'linkbtnsgray-toolbar'
                                        },
                                        {
                                            xtype: 'button',
                                            iconCls: 'x-fa fa-external-link',
                                            tooltip: 'Open in new tab',
                                            scope: me,
                                            handler: 'openNew',
                                            scale: 'medium'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
            // buttonAlign: 'center',
            // buttons: [{
            //     text: 'Ok',
            //     scope: me,
            //     handler: 'copyClipboard'
            // }]
        });

        me.callParent(arguments);
    },

    openNew: function () {
        var me = this,
            link = me.getLink();

        window.open(link);
        me.close();
    },

    copyClipboard: function () {
        var me = this,
            textfield = me.down('textfield'),
            el = textfield.getEl(),
            id = '#' + el.id + '-inputEl',
            imputEl;

        imputEl = document.querySelector(id);
        imputEl.select();

        try {
            // execute the copy command
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copy ' + msg);
        } catch (err) {
            console.log(err);
            console.log('Oops, unable to copy');
        }

        me.close();
    }

});
