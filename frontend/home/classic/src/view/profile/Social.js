Ext.define('Admin.view.profile.Social', {
    extend: 'Ext.panel.Panel',
    xtype: 'profilesocialpanel',

    requires: [
        'Ext.button.Button',
        'Ext.container.Container',
        'Ext.layout.container.VBox'
    ],

    height: 190,
    width: 310,
    bodyPadding: 10,

    layout: {
        type: 'vbox',
        align: 'middle'
    },

    cls: 'social-panel shadow-panel',

    items: [
        {
            xtype: 'panel',
            layout: 'hbox',
            width: 300,
            items: [
            {
                xtype: 'image',
                // cls: 'userProfilePic',
                height: 120,
                width: 150,
                alt: 'profile-picture',
                // src: '/dri-frontend/home/resources/view.png'
                src: 'resources/view.png'
            },{
                xtype: 'component',
                // cls: 'userProfileName',
                height: '',
                html: '<br><br>All-sky visualization of DES releases in grizY and RGB with overlay of tile grid and objects'
            }]
        },

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
            width: 280,
            text: 'Sky Viewer',
            handler : function () {
                window.open('#skyv', '_self');
            }
        }
    ]
});
