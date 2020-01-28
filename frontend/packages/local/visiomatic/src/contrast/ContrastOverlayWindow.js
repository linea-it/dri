Ext.define('visiomatic.contrast.ContrastOverlayWindow', {
  extend: 'Ext.window.Window',

  requires: [
    'visiomatic.contrast.ContrastViewModel',
    'visiomatic.contrast.ContrastController',
    ],

  xtype: 'visiomatic-contrast-overlay',
  controller: 'contrastoverlay',
  viewModel: 'contrastoverlay',

  config: {
      // Instancia atual do visiomatic onde serao feitos os overlays
      visiomatic: null,
  },

  initComponent: function () {
      var me = this;
      Ext.apply(this, {
          title: 'Contrast Overlay',
          width: 200,
          height: 185,
          closeAction: 'hide',
          layout: {
              type: 'vbox',
              align: 'stretch'
          },
          items: [
              {
                  xtype: 'panel',
                  flex: 1,
                  framed: true,
                  bodyPadding: 5,
                  layout: {
                        type: 'vbox',
                        align: 'stretch'
                  },
                  items: [
                    {
                        xtype: 'fieldset',
                        flex: 1,
                        border: false,
                        items: [
                            {
                                xtype: 'radiogroup',
                                layout: 'vbox',
                                name: 'contrast',
                                bind: '{contrast}',
                                items: [
                                    {
                                        inputValue: 'normal',
                                        fieldLabel: 'Normal contrast',
                                        height: 30,
                                        checked: true,
                                    },
                                    {

                                        inputValue: 'medium',
                                        fieldLabel: 'Medium contrast',
                                        height: 30,
                                    },
                                    {
                                        inputValue: 'high',
                                        fieldLabel: 'High contrast',
                                        height: 30,
                                    },
                                ]
                            },
                        ]
                    }
                  ]
              },
          ],
          buttons: [
            {
                text: 'Apply',
                handler: 'onClickContrast'
            }
        ],
      });

      me.callParent(arguments);

  },

  setVisiomatic: function(visiomatic) {
      this.visiomatic = visiomatic;
      this.getViewModel().set('visiomatic', visiomatic);

  },
});
