// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is your bot's main entry point to handle incoming activities.
const { AttachmentLayoutTypes, ActivityTypes, CardFactory } = require('botbuilder');
const IntroCard = require('./resources/IntroCard.json');
const WELCOMED_USER = 'welcomedUserProperty';
const { DialogSet, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const DIALOG_STATE_PROPERTY = 'dialogState';
const USER_NAME_PROP = 'user_name';
const WHO_ARE_YOU = 'who_are_you';
const HELLO_USER = 'hello_user';
const NAME_PROMPT = 'name_prompt';
var request = require('request');
class EchoBot {
    /**
     *
     * @param {ConversationState} conversation state object
     * @param {Object} userState
     */
    constructor(conversationState,userState) {
        // Creates a new state accessor property.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors
        //this.countProperty = conversationState.createProperty(TURN_COUNTER_PROPERTY);
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.userState = this.conversationState.createProperty(USER_NAME_PROP);
        this.dialogs = new DialogSet(this.dialogState);
        this.welcomedUserProperty = conversationState.createProperty(WELCOMED_USER);
    
        // Add prompts
        this.dialogs.add(new TextPrompt(NAME_PROMPT));

        // Create a dialog that asks the user for their name.
        this.dialogs.add(new WaterfallDialog(WHO_ARE_YOU, [
            this.askForName.bind(this),
            this.collectAndDisplayName.bind(this)
        ]));
         // Create a dialog that displays a user name after it has been collected.
         this.dialogs.add(new WaterfallDialog(HELLO_USER, [
            this.displayName.bind(this)
        ]));

    }
       
      //First we will ask their name
      async askForName(dc){
          await dc.prompt(NAME_PROMPT,`what is your name?`)
      }
      
      //collect and display name
      async collectAndDisplayName(dc){
        await this.userName.set(step.context, step.result);
        await step.context.sendActivity(`Got it. You are ${ step.result }.`);
        await step.endDialog();
      }

      // This step loads the user's name from state and displays it.
    async displayName(step) {
        const userName = await this.userName.get(step.context, null);
        await step.context.sendActivity(`Your name is ${ userName }.`);
        await step.endDialog();
    }

    /**
     *
     * Use onTurn to handle an incoming activity, received from a user, process it, and reply as needed
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext) {
        // Handle message activity type. User's responses via text or speech or card interactions flow back to the bot as Message activity.
        // Message activities may contain text, speech, interactive cards, and binary or unknown attachments.
        // see https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
        
       
        if (turnContext.activity.type === ActivityTypes.Message) {

            const didBotWelcomedUser = await this.welcomedUserProperty.get(turnContext, false);
            console.log(`didbotwelcomeduser ${ didBotWelcomedUser}`)
            // Your bot should proactively send a welcome message to a personal chat the first time
            // (and only the first time) a user initiates a personal chat with your bot.
            if (didBotWelcomedUser === false) {
                // The channel should send the user name in the 'From' object
                //let userName = turnContext.activity.from.name;
                await turnContext.sendActivity(`Nice to meet you , What can i do for you? type help if needed`);
                // Set the flag indicating the bot handled the user's first message.
                await this.welcomedUserProperty.set(turnContext, true);
            }
            else {
                let text = turnContext.activity.text.toLowerCase();
                console.log(text);
                if(text.includes('hello') || text.includes('hi')){
                    //await turnContext.sendActivity(`Hello "${ turnContext.activity.text }" wass up how can i help you?`);
                    await turnContext.sendActivity({ attachments: [this.createWelcomeCard()] });
                }
                else if(text.includes('help')){
                    await turnContext.sendActivity('Type introduction,location, project details,about us,how to contact us to know more about us');
                }
                else if(text.includes('intro')){
                    await turnContext.sendActivity({
                        text: 'Introduction',
                        attachments: [CardFactory.adaptiveCard(IntroCard)]
                   });
                }
                else if(text.includes('location')){
                    await turnContext.sendActivity(`We are located at 25 Milling Road, Unit 303, Cambridge, ON`);
                   
                }
                else if(text.includes('details')){
                    await turnContext.sendActivity(`The project is all about parsing PDF documents and extracting required fields in it.`);
                  
                }
                else if(text.includes('about')){
                    await turnContext.sendActivity({ attachments: [this.aboutUsHeroCard()] , attachmentLayout: AttachmentLayoutTypes.Carousel});
                }
                else if(text.includes('contact')){
                    await turnContext.sendActivity({ attachments: [this.contactAnimationCard()] , attachmentLayout: AttachmentLayoutTypes.Carousel});
                }
               else{
                    
                    await turnContext.sendActivity(`Type help to see what all i can do`);
                }
            }
            // Save state changes
            await this.conversationState.saveChanges(turnContext);
                   
        } else if(turnContext.activity.type === ActivityTypes.ConversationUpdate){
            // Generic handler for all other activity types.
            await this.sendWelcomeMessage(turnContext);   
            await this.welcomedUserProperty.set(turnContext, true);
                   
        }
        else{
            // Generic message for all other activities
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }
        // Save changes to the user name.
        //await this.userState.saveChanges(turnContext);

    }

    async sendWelcomeMessage(turnContext) {
        // Do we have any new members added to the conversation?
        if (turnContext.activity.membersAdded.length !== 0) {
            // Iterate over all new members added to the conversation
            for (let idx in turnContext.activity.membersAdded) {
                if (turnContext.activity.membersAdded[idx].id !== turnContext.activity.recipient.id) {
                    // await turnContext.sendActivity(`Hi!!! I am a Qc Solver bot,
                    // I'am a simple prototype chatbot still learning things. You can type intro,help,location to know more about me!`);
                    await turnContext.sendActivity({ attachments: [this.createWelcomeCard()] });
              
                 }
             }
         }
    }

    contactAnimationCard() {
        return CardFactory.animationCard(
            'Time to meet us',
            [
                { url: 'https://media.giphy.com/media/136WBMmq4SVDAk/giphy.gif' }
            ],
            [],
            {
                subtitle: 'Contact US'
            }
        );
    }

    aboutUsHeroCard() {
        return CardFactory.heroCard(
            'Welcome to QCSolver',
            CardFactory.images(['https://members.qcsolver.com/images/qc-solver-logo.png']),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'About us:',
                    value: 'https://test.qcsolver.com/about.aspx'
                }
            ])
        );
    }

    createWelcomeCard() {
        return CardFactory.thumbnailCard(
            'Welcome to QC Solver',
            [{ url: 'https://members.qcsolver.com/images/qc-solver-logo.png' }],
            [{
                type: 'openUrl',
                title: 'Get started',
                value: 'http://qcsolver.com/solutions/'
            }],
            {
                subtitle: `Place for expert's solutions`,
                text: 'The QCsolver SYSTEM is a fully accessible cloud based software and service designed to assist clients and contractors in managing pre-qualifications and performance.'
            }
        );
    }
    async sendAJoke(turnContext){
        var options={};
        var joke;
        var jokes = {};
            request({url: 'https://icanhazdadjoke.com/', headers: {Accept : 'text/plain'}}, (error,response,body)=>{
                //await turnContext.sendActivity(joke);
            if(!error && response.statusCode ==200){
                console.log(body);
                jokes.joke = body; 
               
                return body;   
                   // return body;
            }
            });
            if(jokes.joke){
                turnContext.sendActivity(jokes.joke);
            }
            else turnContext.sendActivity('hii');
    }
}

module.exports.EchoBot = EchoBot;
