Ext.define('Admin.view.email.Email', {
    extend: 'Ext.container.Container',

    xtype: 'email',

    controller: 'email',

    viewModel: {
        type: 'email'
    },

    itemId: 'emailMainContainer',

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    margin: '20 0 0 20',

    items: [
        {
            xtype: 'container',

            itemId: 'navigationPanel',

            layout: {
                type: 'vbox',
                align: 'stretch'
            },

            width: '35%',
            minWidth: 180,
            // maxWidth: 240,

            defaults: {
                cls: 'navigation-email',
                margin: '0 10 10 0'
            },

            items: [
                {
                    html: 'Text and images to the app <a href="/dri/apps/dri-frontend/sky">Click Here</a>',
                    title: 'Sky',
                    frame: true,
                    flex: 1,
                    // margin: '0 20 20 0'
                   
                },
                {
                    html: '  ipsum dolor sit amet, consectetur adipiscing elit. Integer nec lacinia metus. Nulla mollis massa et ornare viverra. Vivamus neque eros, elementum non   quis, iaculis sagittis ipsum. Integer mollis velit urna. Cras venenatis venenatis massa molestie facilisis. Vestibulum dapibus felis neque, vitae blandit metus volutpat eget. Maecenas at ipsum dolor. Aenean sed iaculis tellus, a mattis erat. Nulla bibendum   a fermentum ultricies. Mauris imperdiet tristique iaculis. Pellentesque posuere consequat finibus. Vestibulum accumsan eget purus eget condimentum. Vestibulum ullamcorper dictum enim sed tempus. Etiam fringilla justo at nunc condimentum elementum. Vestibulum vitae lobortis nibh, eget venenatis justo.',
                    title: 'Sky',
                    frame: true,
                    flex: 1,
                    // margin: '0 20 0 0'
                    
                }
            ]
        },{
            xtype: 'container',

            itemId: 'navigation',

            layout: {
                type: 'vbox',
                align: 'stretch'
            },

            width: '60%',
            minWidth: 180,
            // maxWidth: 240,

            defaults: {
                cls: 'navigation-email',
                margin: '0 10 10 0'
            },

            items: [
                {
                    html: '  ipsum dolor sit amet, consectetur adipiscing elit. Integer nec lacinia metus. Nulla mollis massa et ornare viverra. Vivamus neque eros, elementum non   quis, iaculis sagittis ipsum. Integer mollis velit urna. Cras venenatis venenatis massa molestie facilisis. Vestibulum dapibus felis neque, vitae blandit metus volutpat eget. Maecenas at ipsum dolor. Aenean sed iaculis tellus, a mattis erat. Nulla bibendum   a fermentum ultricies. Mauris imperdiet tristique iaculis. Pellentesque posuere consequat finibus. Vestibulum accumsan eget purus eget condimentum. Vestibulum ullamcorper dictum enim sed tempus. Etiam fringilla justo at nunc condimentum elementum. Vestibulum vitae lobortis nibh, eget venenatis justo.<br><br><img src="/dri/apps/dri-frontend/home/resources/images/sky.png" height="200" width="350" align="right" hspace="20">  ipsum dolor sit amet, consectetur adipiscing elit. Integer nec lacinia metus. Nulla mollis massa et ornare viverra. Vivamus neque eros, elementum non   quis, iaculis sagittis ipsum. Integer mollis velit urna. Cras venenatis venenatis massa molestie facilisis. Vestibulum dapibus felis neque, vitae blandit metus volutpat eget. Maecenas at ipsum dolor. Aenean sed iaculis tellus, a mattis erat. Nulla bibendum   a fermentum ultricies. Mauris imperdiet tristique iaculis. Pellentesque posuere consequat finibus. Vestibulum accumsan eget purus eget condimentum. Vestibulum ullamcorper dictum enim sed tempus. Etiam fringilla justo at nunc condimentum elementum. Vestibulum vitae lobortis nibh, eget venenatis justo.  ipsum dolor sit amet, consectetur adipiscing elit. Integer nec lacinia metus. Nulla mollis massa et ornare viverra. Vivamus neque eros, elementum non   quis, iaculis sagittis ipsum. Integer mollis velit urna. Cras venenatis venenatis massa molestie facilisis. Vestibulum dapibus felis neque, vitae blandit metus volutpat eget. Maecenas at ipsum dolor. Aenean sed iaculis tellus, a mattis erat. Nulla bibendum   a fermentum ultricies. Mauris imperdiet tristique iaculis. Pellentesque posuere consequat finibus. Vestibulum accumsan eget purus eget condimentum. Vestibulum ullamcorper dictum enim sed tempus. Etiam fringilla justo at nunc condimentum elementum. Vestibulum vitae lobortis nibh, eget venenatis justo.',
                    title: 'Sky Viewer',
                    frame: true,
                    width: '55%',
                    // margin: '0 20 0 0'
                },
                {
                    xtype: 'dashboardhddusagepanel'
                    
                },
                {
                    xtype: 'dashboardsalespanel'
                    
                },
                {
                    xtype: 'dashboardearningspanel'
                    
                }
            ]
        },
        
        // {
        //     html: '  ipsum dolor sit amet, consectetur adipiscing elit. Integer nec lacinia metus. Nulla mollis massa et ornare viverra. Vivamus neque eros, elementum non   quis, iaculis sagittis ipsum. Integer mollis velit urna. Cras venenatis venenatis massa molestie facilisis. Vestibulum dapibus felis neque, vitae blandit metus volutpat eget. Maecenas at ipsum dolor. Aenean sed iaculis tellus, a mattis erat. Nulla bibendum   a fermentum ultricies. Mauris imperdiet tristique iaculis. Pellentesque posuere consequat finibus. Vestibulum accumsan eget purus eget condimentum. Vestibulum ullamcorper dictum enim sed tempus. Etiam fringilla justo at nunc condimentum elementum. Vestibulum vitae lobortis nibh, eget venenatis justo.<br><br><img src="/dri/apps/dri-frontend/home/resources/images/sky.png" height="200" width="350" align="right" hspace="20">  ipsum dolor sit amet, consectetur adipiscing elit. Integer nec lacinia metus. Nulla mollis massa et ornare viverra. Vivamus neque eros, elementum non   quis, iaculis sagittis ipsum. Integer mollis velit urna. Cras venenatis venenatis massa molestie facilisis. Vestibulum dapibus felis neque, vitae blandit metus volutpat eget. Maecenas at ipsum dolor. Aenean sed iaculis tellus, a mattis erat. Nulla bibendum   a fermentum ultricies. Mauris imperdiet tristique iaculis. Pellentesque posuere consequat finibus. Vestibulum accumsan eget purus eget condimentum. Vestibulum ullamcorper dictum enim sed tempus. Etiam fringilla justo at nunc condimentum elementum. Vestibulum vitae lobortis nibh, eget venenatis justo.  ipsum dolor sit amet, consectetur adipiscing elit. Integer nec lacinia metus. Nulla mollis massa et ornare viverra. Vivamus neque eros, elementum non   quis, iaculis sagittis ipsum. Integer mollis velit urna. Cras venenatis venenatis massa molestie facilisis. Vestibulum dapibus felis neque, vitae blandit metus volutpat eget. Maecenas at ipsum dolor. Aenean sed iaculis tellus, a mattis erat. Nulla bibendum   a fermentum ultricies. Mauris imperdiet tristique iaculis. Pellentesque posuere consequat finibus. Vestibulum accumsan eget purus eget condimentum. Vestibulum ullamcorper dictum enim sed tempus. Etiam fringilla justo at nunc condimentum elementum. Vestibulum vitae lobortis nibh, eget venenatis justo.<br><br>  ipsum dolor sit amet, consectetur adipiscing elit. Integer nec lacinia metus. Nulla mollis massa et ornare viverra. Vivamus neque eros, elementum non   quis, iaculis sagittis ipsum. Integer mollis velit urna. Cras venenatis venenatis massa molestie facilisis. Vestibulum dapibus felis neque, vitae blandit metus volutpat eget. Maecenas at ipsum dolor. Aenean sed iaculis tellus, a mattis erat. Nulla bibendum   a fermentum ultricies. Mauris imperdiet tristique iaculis. Pellentesque posuere consequat finibus. Vestibulum accumsan eget purus eget condimentum. Vestibulum ullamcorper dictum enim sed tempus. Etiam fringilla justo at nunc condimentum elementum. Vestibulum vitae lobortis nibh, eget venenatis justo.',
        //     title: 'Sky Viewer',
        //     frame: true,
        //     width: '55%',
        //     margin: '0 20 0 0'
        // }
        // ,{
        //     html: '  ipsum dolor sit amet, consectetur adipiscing elit. Integer nec lacinia metus. Nulla mollis massa et ornare viverra. Vivamus neque eros, elementum non   quis, iaculis sagittis ipsum. Integer mollis velit urna. Cras venenatis venenatis massa molestie facilisis. Vestibulum dapibus felis neque, vitae blandit metus volutpat eget. Maecenas at ipsum dolor. Aenean sed iaculis tellus, a mattis erat. Nulla bibendum   a fermentum ultricies. Mauris imperdiet tristique iaculis. Pellentesque posuere consequat finibus. Vestibulum accumsan eget purus eget condimentum. Vestibulum ullamcorper dictum enim sed tempus. Etiam fringilla justo at nunc condimentum elementum. Vestibulum vitae lobortis nibh, eget venenatis justo.<br><br>  ',
        //     title: 'Sky Viewer',
        //     frame: true,
        //     width: '27%',
           
        // }
        // {
        //     xtype: 'container',

        //     itemId: 'navigationPanel',

        //     layout: {
        //         type: 'vbox',
        //         align: 'stretch'
        //     },

        //     width: '30%',
        //     minWidth: 180,
        //     maxWidth: 240,

        //     defaults: {
        //         cls: 'navigation-email',
        //         margin: '0 20 20 0'
        //     },

        //     items: [
        //         {
        //             xtype: 'emailmenu',
        //             listeners: {
        //                 click: 'onMenuClick'
        //             }
        //         },
        //         {
        //             xtype: 'emailfriendslist'
        //         }
        //     ]
        // },
        // {
        //     xtype: 'container',
        //     itemId: 'contentPanel',
        //     margin: '0 20 20 0',
        //     flex: 1,
        //     layout: {
        //         type : 'anchor',
        //         anchor : '100%'
        //     }
        // }
    ]
});
