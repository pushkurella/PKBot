// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is your bot's main entry point to handle incoming activities.
const { CardFactory } = require('botbuilder');
const { ActivityTypes } = require('botbuilder');
const IntroCard = require('./resources/IntroCard.json');
const WELCOMED_USER = 'welcomedUserProperty';
class EchoBot {
    /**
     *
     * @param {ConversationState} conversation state object
     */
    constructor(conversationState) {
        // Creates a new state accessor property.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors
        //this.countProperty = conversationState.createProperty(TURN_COUNTER_PROPERTY);
        this.conversationState = conversationState;
        this.welcomedUserProperty = conversationState.createProperty(WELCOMED_USER);
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

            // Your bot should proactively send a welcome message to a personal chat the first time
            // (and only the first time) a user initiates a personal chat with your bot.
            if (didBotWelcomedUser === false) {
                // The channel should send the user name in the 'From' object
                //let userName = turnContext.activity.from.name;
                await this.sendWelcomeMessage(turnContext);
                // Set the flag indicating the bot handled the user's first message.

                //await this.welcomedUserProperty.set(turnContext, true);
            }
            else {
                let text = turnContext.activity.text.toLowerCase();
                switch (text) {
                case 'hello':
                case 'hi':
                    await turnContext.sendActivity(`Hello "${ turnContext.activity.text }" wass up how can i help you?`);
                    break;
                case 'intro':
                case 'help':
                    await turnContext.sendActivity({
                         attachments: [CardFactory.adaptiveCard(IntroCard)]
                    });
                    break;
                case 'location':
                    await turnContext.sendActivity(`We are located at 25 Milling Road, Unit 303, Cambridge, ON`);
                    break;
                default :
                    await turnContext.sendActivity(`This is a simple Welcome Bot sample. You can say 'intro' to
                                                        see the introduction card. If you are running this bot in the Bot
                                                        Framework Emulator, press the 'Start Over' button to simulate user joining a bot or a channel`);
                }
                
            }
            
            
        } else if(turnContext.activity.type === ActivityTypes.ConversationUpdate){
            // Generic handler for all other activity types.
            this.sendWelcomeMessage(turnContext);
            await this.welcomedUserProperty.set(turnContext, true);
        }
        else{
            // Generic message for all other activities
            //await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        
        }
        // Save state changes
        await this.conversationState.saveChanges(turnContext);
    }
    async sendWelcomeMessage(turnContext){
        //if we have new members added to the conversation
        if(turnContext.activity.membersAdded.length !== 0){
            for(let idx in turnContext.activity.membersAdded){
                if(turnContext.activity.membersAdded[idx].id !== turnContext.activity.recipient.id){
                    await turnContext.sendActivity(`Hi!!! my name is Qc Solver bot. 
                    I am a simple prototype chatbot still learning things. You can type intro,help,location to know more about me!`);
                    await turnContext.sendActivity(`what's your name?`);
                }
            }
        }
    }
}

exports.EchoBot = EchoBot;
