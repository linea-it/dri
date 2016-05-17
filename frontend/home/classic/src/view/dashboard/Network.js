Ext.define('Admin.view.dashboard.Network', {
    extend: 'Ext.panel.Panel',
    
   requires: [
        'Ext.button.Button',
        'Ext.container.Container',
        'Ext.layout.container.VBox'
    ],

    height: 220,
    width: 270,
    bodyPadding: 10,

    layout: {
        type: 'vbox',
        align: 'middle'
    },

    cls: 'social-panel shadow-panel',

    items: [
        {
            xtype: 'image',
            // cls: 'userProfilePic',
            height: 150,
            width: 250,
            alt: 'profile-picture',
            src: 'resources/images/destiles.png'
        },
        // {
        //     xtype: 'component',
        //     cls: 'userProfileName',
        //     height: '',
        //     html: 'Sky Viewer'
        // },
        // {
        //     xtype: 'component',
        //     cls: 'userProfileDesc',
        //     html: 'CO-FOUNDER, CEO'
        // },
        // {
        //     xtype: 'container',
        //     layout: 'hbox',
        //     defaults: {
        //         xtype: 'button',
        //         margin: 5
        //     },
        //     margin: 5,
        //     items: [
        //         {
        //             ui: 'blue',
        //             iconCls: 'x-fa fa-facebook'
        //         },
        //         {
        //             ui: 'soft-cyan',
        //             iconCls: 'x-fa fa-twitter'
        //         },
        //         {
        //             ui: 'soft-red',
        //             iconCls: 'x-fa fa-google-plus'
        //         },
        //         {
        //             ui: 'soft-purple',
        //             iconCls: 'x-fa fa-envelope'
        //         }
        //     ]
        // },
        {
            xtype: 'button',
            scale: 'large',
            width: 250,
            text: 'Sky Viewer'
        }
    ]
});
