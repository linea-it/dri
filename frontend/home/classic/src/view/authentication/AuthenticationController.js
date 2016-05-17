Ext.define('Admin.view.authentication.AuthenticationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.authentication',

    //TODO: implement central Facebook OATH handling here

    onFaceBookLogin : function(button, e) {
        this.redirectTo("profile");
    },

    onLoginButton: function(button, e, eOpts) {
        this.redirectTo("profile");
    },

    onLoginAsButton: function(button, e, eOpts) {
        this.redirectTo("profile");
    },

    onNewAccount:  function(button, e, eOpts) {
        this.redirectTo("profile");
    },

    onSignupClick:  function(button, e, eOpts) {
        this.redirectTo("profile");
    },

    onResetClick:  function(button, e, eOpts) {
        this.redirectTo("profile");
    }
});
