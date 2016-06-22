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
                src: '/dri/apps/home/resources/view.png'
            },{
                xtype: 'component',
                // cls: 'userProfileName',
                height: '',
                html: '<br><br>All-sky visualization of DES releases in grizY and RGB with overlay of tile grid and objects'
            }]
        },
        {
            xtype: 'button',
            scale: 'large',
            width: 280,
            text: 'Sky Viewer',
            handler : function () {
                window.open('/dri/apps/sky/#home', '_self');
            }
        }
    ]
});
