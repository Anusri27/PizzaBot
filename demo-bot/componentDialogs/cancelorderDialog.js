const {WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const {ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt  } = require('botbuilder-dialogs');

const {DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');

const {CardFactory} = require('botbuilder');

const CHOICE_PROMPT    = 'CHOICE_PROMPT';
const CONFIRM_PROMPT   = 'CONFIRM_PROMPT';
const TEXT_PROMPT      = 'TEXT_PROMPT';
const NUMBER_PROMPT    = 'NUMBER_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog ='';

class CancelOrderDialog extends ComponentDialog {
    
    constructor(conservsationState,userState) {
        super('cancelorderDialog');



this.addDialog(new TextPrompt(TEXT_PROMPT));
this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
this.addDialog(new NumberPrompt(NUMBER_PROMPT));
this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
    this.firstStep.bind(this),  // Ask confirmation if user wants to make reservation?
    this.confirmStep.bind(this), // Show summary of values entered by user and ask confirmation to make reservation
    this.summaryStep.bind(this)
           
]));




this.initialDialogId = WATERFALL_DIALOG;


   }

   async run(turnContext, accessor) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
        await dialogContext.beginDialog(this.id);
    }
}

async firstStep(step) {
endDialog = false;
return await step.prompt(TEXT_PROMPT, 'Enter Order ID for cancellation:');
      
}

async confirmStep(step){

    step.values.orderNo = step.result

    var msg = ` You have entered following values: \n ORDER ID: ${step.values.orderNo}`

    await step.context.sendActivity(msg);

    return await step.prompt(CONFIRM_PROMPT, 'Are you sure that all values are correct and you want to CANCEL the order?', ['yes', 'no']);
}

async summaryStep(step){

    if(step.result===true)
    {

      await step.context.sendActivity("Order successfully cancelled.")
      endDialog = true;
      return await step.endDialog();   
    
    }
    
    else if(step.result === false){
        await step.context.sendActivity("You chose not to go ahead");
        endDialog=true;
    }

   
}


async isDialogComplete(){
    return endDialog;
}
}

module.exports.CancelOrderDialog = CancelOrderDialog;

