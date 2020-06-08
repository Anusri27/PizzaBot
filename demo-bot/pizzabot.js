// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');
const { bookorderDialog } = require('./componentDialogs/bookorderDialog');
const { CancelOrderDialog } = require('./componentDialogs/cancelorderDialog');

class Pizzabot extends ActivityHandler {
    constructor(conversationState,userState) {
        super();
        
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogState = conversationState.createProperty("dialogState");
        this.BookOrderDialog = new bookorderDialog(this.conversationState, this.userState);
        this.cancelorderDialog = new CancelOrderDialog(this.conversationState, this.userState);


        this.previousIntent = this.conversationState.createProperty("previousIntent");
        this.conversationData = this.conversationState.createProperty("conversationData");

        this.onMessage(async (context, next) => {
        
            await this.dispatchToIntentAsync(context);
            
            await next();
    
            });

        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
            await next();
        });   

        this.onMembersAdded(async (context, next) => {
            await this.sendWelcomeMessage(context)
            await next();
        });
    }
    
    async sendWelcomeMessage(turnContext){
        const { activity } = turnContext;

        for (const idx in activity.membersAdded) {
            if (activity.membersAdded[idx].id !== activity.recipient.id) {
                const welcomeMessage = `Welcome to Pizza Bot ${ activity.membersAdded[idx].name }. `;
                await turnContext.sendActivity(welcomeMessage);
                await this.sendSuggestedActions(turnContext);
            }
        }
    }

    async sendSuggestedActions(turnContext) {
        var reply = MessageFactory.suggestedActions(['Order Pizza for Delivery','Cancel Order','Pizza Store Address'],'What would you like to do today ?');
        await turnContext.sendActivity(reply);
    }

    async dispatchToIntentAsync(context){

        var currentIntent = '';
        const previousIntent = await this.previousIntent.get(context,{});
        const conversationData = await this.conversationData.get(context,{})
        if(previousIntent.intentName && conversationData.endDialog === false){

            currentIntent = previousIntent.intentName;

        }
        else if(previousIntent.intentName && conversationData.endDialog === true)
        {
            currentIntent = context.activity.text;
        }
        else{
            currentIntent = context.activity.text;

            await this.previousIntent.set(context,{ intentName : context.activity.text});
        }
        switch(currentIntent){
            
            case 'Order Pizza for Delivery':
            console.log("inside order pizza intent");
            await this.conversationData.set(context , {endDialog : false});
            await this.BookOrderDialog.run(context,this.dialogState);
            conversationData.endDialog = await this.BookOrderDialog.isDialogComplete();
            if(conversationData.endDialog)
            {
                await this.previousIntent.set(context,{ intentName : null});
                await this.sendSuggestedActions(context);
            }
            break;

            case 'Cancel Order':
            console.log("inside cancel intent");
            await this.conversationData.set(context , {endDialog : false});
            await this.cancelorderDialog.run(context,this.dialogState);
            conversationData.endDialog = await this.cancelorderDialog.isDialogComplete();
            if(conversationData.endDialog)
            {
                await this.previousIntent.set(context,{ intentName : null});
                await this.sendSuggestedActions(context);
            }
            break;
            default:
            console.log("Did not match case");
            break;
        }

    }

}




module.exports.Pizzabot = Pizzabot;
