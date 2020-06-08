const {WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const {ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt  } = require('botbuilder-dialogs');

const {ListStyle} = require('botbuilder-dialogs');
const {DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const { CardFactory } = require('botbuilder');

const DetailsCard = require("../resources/adaptivecards/Details.json");

const CARDS = [
    DetailsCard
];

const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog = '';

class bookorderDialog extends ComponentDialog{

    constructor(conversationState,userState){
        super('bookorderDialog');
    this.addDialog(new TextPrompt(TEXT_PROMPT));
    this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
    this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
    this.addDialog(new NumberPrompt(NUMBER_PROMPT));
    this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
        this.okorder.bind(this),
        this.getName.bind(this),
        this.getNumber.bind(this),
        this.getaddress.bind(this),
        this.pizzabase.bind(this),
        this.pizzasize.bind(this),
        this.toppings.bind(this),
        this.confirmation.bind(this),
        this.ordersummary.bind(this)        
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

    async okorder(step){
        endDialog = false;
        await step.context.sendActivity({
            text: "Welcome to Pizza Mate",
            attachments : [CardFactory.adaptiveCard(CARDS[0])]
        })
        return await step.prompt(CONFIRM_PROMPT, 'Would you like to place an order?',['yes','no']);
    }

    async getName(step){
        if(step.result === true){
        return await step.prompt(TEXT_PROMPT,'Please enter your name');}

        else if(step.result === false){
            await step.context.sendActivity("You chose not to go ahead");
            endDialog=true;
            return await step.endDialog();
        }
    }

    async getNumber(step){

        step.values.name = step.result;
        return await step.prompt(NUMBER_PROMPT,'Please enter your 10 digit mobile number');
    }

    async getaddress(step){
        step.values.numbr == step.result;
        return await step.prompt(TEXT_PROMPT,'Please enter your complete address where the delivery has to be made');
    }
    async pizzabase(step){
        step.values.addr == step.result;
        return await step.prompt(CHOICE_PROMPT,{
            prompt : 'Select base',
            choices : ['Thin Crust','Cheese Burst','Pan'],
            style : ListStyle.heroCard
        });
    }
    async pizzasize(step){
        step.values.base == step.result;
        return await step.prompt(CHOICE_PROMPT,{
            prompt : 'Select base',
            choices : ['Small','Regular','Large'],
            style : ListStyle.heroCard
        });
    }
    async toppings(step){
        step.values.size == step.result;
        return await step.prompt(TEXT_PROMPT,'enter toppings , available toppings are olives ,beel peppers, tomato , capsicum , onions , corn , jalapeno, pepparoni , soya , mushroom , broccoli ');
    }
    async confirmation(step){
        step.values.topp == step.result;

        var msg = ` You have entered : \n Name : ${step.values.name} \n Phone Number : ${step.values.numbr} \n Address : ${step.values.addr} \n Pizza Base : ${step.values.base} \n  Pizza Size : ${step.values.size} \n Pizza Toppings : ${step.values.topp}`
        
        await step.context.sendActivity(msg);
        return await step.prompt(CONFIRM_PROMPT, 'Are the entered values correct?',['yes','no']);
    }

    async ordersummary(step){
        if(step.result === true){

            await step.context.sendActivity("Order has  been placed.....Your Order ID is 12345");
            endDialog = true;
            return await step.endDialog();
        }
        
        else if(step.result === false){
            await step.context.sendActivity("You chose not to go ahead");
            endDialog=true;
            return await step.endDialog();
        }
    }

    async isDialogComplete(){
        return endDialog;
    }
}

module.exports.bookorderDialog = bookorderDialog;