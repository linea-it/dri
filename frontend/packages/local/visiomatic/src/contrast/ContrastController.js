Ext.define('visiomatic.contrast.ContrastController', {
  extend: 'Ext.app.ViewController',

  alias: 'controller.contrastoverlay',

  onClickContrast: function () {
      var me = this,
          vm = me.getViewModel(),
          visiomatic = vm.get('visiomatic'),
          contrast = vm.get('contrast').contrast;


    visiomatic.overlayContrast(contrast);
  },

});
