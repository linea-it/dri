/**
 * BaseDialog
 * Events:
 *  "cancel"
 *      event.cancelClose impede a janela de fechar
 *  "confirm" 
 *  "open"
 */

Ext.define('UserQuery.view.dialog.BaseDialog', {
    alternateClassName: 'BaseDialog',

    extend: 'Ext.window.Window',

    height: 350,
    width: 500,
    title: 'Base Dialog',
    scrollable: true,
    bodyPadding: 10,
    constrain: true,
    modal: true,

    config:{
        buttonCancelText : 'Cancel',
        buttonConfirmText: 'Confirm'
    },

    initComponent:function(){
        this.buttons = [
            {text:this.getButtonCancelText(), reference:'btnCancel', handler:function(){
                var win = this.up('window');
                var event = {};
    
                win.fireEvent('cancel', event);
    
                if (!event.cancelClose) {
                    win.close();
                }                
            }},
            {text:this.getButtonConfirmText(), reference:'btnConfirm', handler:function(){
                var win = this.up('window');
                var event = {};
    
                win.fireEvent('confirm', event);
    
                if (!event.cancelClose) {
                    win.close();
                }
            }}
        ];

        this.callParent(arguments);
    },

    open: function(callback){
        this.show();
        this.fireEvent('open', callback);
    },

    setLoading: function(state, text){
        if (!this.loadingMask){
            this.loadingMask = new Ext.LoadMask({
                msg    : 'Please wait...',
                target : this
            });
        }

        //this.loadingMask.useMsg = text ? true : false;
        this.loadingMask.msg = text || 'Loading...';
        this.loadingMask[state ? 'show' : "hide"]();
    }
});