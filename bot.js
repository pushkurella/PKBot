// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is your bot's main entry point to handle incoming activities.
const { AttachmentLayoutTypes, ActivityTypes, CardFactory } = require('botbuilder');
const IntroCard = require('./resources/IntroCard.json');
const JokeCard = require('./resources/JokeCard.json');
const WELCOMED_USER = 'welcomedUserProperty';
const { DialogSet, TextPrompt,ChoicePrompt, WaterfallDialog ,ListStyle} = require('botbuilder-dialogs');
const DIALOG_STATE_PROPERTY = 'dialogState';
const USER_NAME_PROP = 'user_name';
const CHOICE = 'choice_prompt';
const request = require('request');
const { LuisRecognizer } = require('botbuilder-ai');
const HELLO_USER = 'hello_user';
var weather = require('openweather-apis');

class EchoBot {
    /**
     *
     * @param {ConversationState} conversation state object
     * @param {Object} userState
     */
    constructor(conversationState, userState, luisApplication, luisPredictionOptions) {
        // Creates a new state accessor property.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors
        //this.countProperty = conversationState.createProperty(TURN_COUNTER_PROPERTY);
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.userState = this.conversationState.createProperty(USER_NAME_PROP);
        this.dialogs = new DialogSet(this.dialogState);
        this.welcomedUserProperty = conversationState.createProperty(WELCOMED_USER);
        this.LuisRecognizer = new LuisRecognizer(luisApplication, luisPredictionOptions, true);
        // Add prompts
        //this.dialogs.add(new TextPrompt(NAME_PROMPT));
        const choicePrompt = new ChoicePrompt(CHOICE);
        choicePrompt.style = ListStyle.suggestedAction;
        this.dialogs.add(choicePrompt);
        this.dialogs.add(new WaterfallDialog(HELLO_USER, [
            this.promptForName.bind(this)
        ]));
        
    }
        // This step in the dialog prompts the user for their name.
        async promptForName(step) {
            //You can type Introduction\nlocation\ncontact details\nregistration cost\ncall us\nemail us\n project details\nabout us\nhow to contact us
            return await step.prompt(CHOICE, `You can click on any options if you are interested in us?`,[`Introduction`,'Location','Contact details','Registration cost','Call us','Email us','Project Details','About Us']);
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
            const dc = await this.dialogs.createContext(turnContext);
            console.log(`didbotwelcomeduser ${didBotWelcomedUser}`)
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
                
                if(turnContext.activity.text){
                let text = turnContext.activity.text.toLowerCase();
                 
                console.log(`sending ${text} to luis...`);
                // Perform a call to LUIS to retrieve results for the user's message.
                const results = await this.LuisRecognizer.recognize(turnContext);
                // Since the LuisRecognizer was configured to include the raw results, get the `topScoringIntent` as specified by LUIS.
                const topIntent = results.luisResult.topScoringIntent;
                const alteredQuery = results.alteredText;
                const userSentiment = results.sentiment.label;
                var found = false;
                console.log(`Luis processed output ${topIntent.intent}`)
                console.log(`user sentiment is ${userSentiment}`);
                if (alteredQuery !== undefined && text !== alteredQuery) {
                    await turnContext.sendActivity('Your response is auto-corrected to ' + alteredQuery);
                }
                if (topIntent.intent !== 'None' && topIntent.score > 0.2) {
                    text = topIntent.intent.toLowerCase();
                    console.log(`Luis top intent is ${text}`);
                    if (text.includes('welcome')) {
                        //await turnContext.sendActivity(`Hello "${ turnContext.activity.text }" wass up how can i help you?`);
                       await turnContext.sendActivity({ attachments: [this.createWelcomeCard()] });
                      
                    }
                    else if (text.includes('help')) {
                       // await turnContext.prompt('helpprompt',`You can type Introduction\nlocation\ncontact details\nregistration cost\ncall us\nemail us\n project details\nabout us\nhow to contact us to know more about us...`, ['yes', 'no']);
                       await dc.beginDialog(HELLO_USER);
                    }
                    else if (text.includes('intro')) {
                        await turnContext.sendActivity({
                            text: 'Introduction',
                            attachments: [CardFactory.adaptiveCard(IntroCard)]
                        });
                    }
                    else if (text.includes('location')) {
                        await turnContext.sendActivity(`We are located at 25 Milling Road, Unit 303, Cambridge, ON`);

                    }
                    else if (text.includes('details')) {
                        await turnContext.sendActivity(`The project is all about parsing PDF documents and extracting required fields in it.`);

                    }
                    else if (text.includes('about')) {
                        await turnContext.sendActivity({ attachments: [this.aboutUsHeroCard()], 
                            attachmentLayout: AttachmentLayoutTypes.Carousel });
                    }
                    else if (text.includes('contact')) {
                        await turnContext.sendActivity({ attachments: [this.contactAnimationCard()],
                             attachmentLayout: AttachmentLayoutTypes.Carousel });
                    }
                    else if (text.includes('call')) {
                        await turnContext.sendActivity(`You can reach us at +1 905-296-4003 or +1 226-474-1169`);
                    }
                    else if (text.includes('qcemail')) {
                        await turnContext.sendActivity(`You can always email us at President@qcsolver.com`);
                    }
                    else if (text.includes('feedback')) {
                        await turnContext.sendActivity(`Your feedback would help me in improving my performance, Thank you...`);
                    }
                    else if (text.includes('ceo')) {
                        await turnContext.sendActivity(`QCSolver is owned by Gerald Ford(Jerry)`);
                    }
                    else if (text.includes('feedback')) {
                        await turnContext.sendActivity(`Your feedback would help me in improving my performance, Thank you...`);
                    }
                    else if (text.includes('registration')) {
                        await turnContext.sendActivity({ attachments: [this.createCostCard()] });
                    }
                    else if (text.includes('registration')) {
                        await turnContext.sendActivity(`Type help to see more options...`);
                    }
                    // else if (text.includes('joke')) {
                    // const joke = await this.GetAJoke(turnContext);
                    // JokeCard.body[1].text = `${joke}`;
                    // var jokeImages = {
                    //     1 : 'https://i.ytimg.com/vi/ynv8i2Blt9I/hqdefault.jpg',
                    //     2 : 'https://wallpapersite.com/images/pages/pic_w/2681.jpg',
                    //     3 : 'http://s1.1zoom.net/prev2/438/437602.jpg',
                    //     4 : 'https://wallpaperplay.com/walls/full/f/e/1/161114.jpg',
                    //     5 : 'https://linkbookmarking.com/wp-content/uploads/2018/08/high_quality_wallpaper_HD_1080_IDS_1119049.jpg',
                    //     6 : 'https://wallpapersite.com/images/pages/pic_w/2686.jpg',
                    //     7 : 'https://wallpaperplay.com/walls/full/7/7/a/161169.jpg'
                    // };
                    // var num = this.random(1,12);
                    // console.log(`random number generated is ${num}`);
                    // JokeCard.body[0].url = jokeImages[num];
                    //     await turnContext.sendActivity({
                    //         attachments: [CardFactory.adaptiveCard(JokeCard)]
                    //     });
                    // }
                    else if(text.includes('ok')){
                        await turnContext.sendActivity('type joke if you are bored, let me tell you something funny;)');
                    }
                    // else if(text.includes('temp')){
                    //     var JSONObj = await this.GetWeather(turnContext);
                    //     turnContext.sendActivity(`The current temperature in kitchener is ${JSONObj.main.temp} deg
                    //      and it may vary from ${JSONObj.main.temp_min} deg to ${JSONObj.main.temp_max} degrees.
                    //       (${JSONObj.weather[0].description})`)  
                    // }
                    else if(text.includes('coi upload')){
                            await turnContext.sendActivity(`Following are the steps to upload certificate of insurance documents:
                                                    \n1. Go to the left blue menu, and click documents.
                                                    \n2. select Main category = insurance documents, sub category = certificate of insurance.
                                                    \n3. When you are on the "Your application is 100% complete", scroll down until you see the Insurance/Workers' Compensation/Bonding link.
                                                    \n4. Then on this page, scroll down to the header that reads "insurance information".
                                                    \n5. Then click the yellow button on the bottom right corner of your screen that reads "Enable Editing".
                                                    \n6. Review the new certificate and the information on the application to ensure it is accurate.
                                                    \n7. If there is a new policy or change in coverage amount, then that should be reflected on your QCsolver application.`);
                        }else if(text.includes('online credit card issue')){
                            await turnContext.sendActivity(`If you are unable to process the payment through cheque, We are happy to converse over a telephone call so that we can get a better understand of the issue with the online payment page`);
                        }  else if(text.includes('clients')){
                                await turnContext.sendActivity(` Here goes our list of prestigious clients...
                                \n1. Cambridge Solutions Inc.
                                \n2. University of Toronto
                                \n3. York University
                                \n4. McMaster University
                                \n5. Town of Whitby
                                \n6. Culliton Inc.`);
                        } else if(text.includes('upload reference letters')){
                            await turnContext.sendActivity(`Following are the steps to upload reference letters:
                            \n1. When you log in, go to your application and click the "work references" box.
                            \n2. Open your references by clicking "edit" beside each one and you will see a document uploader in 
                            the pop up window where you can upload the respective reference letter.`);
                        }
                    
                } else {
                    // If the top scoring intent was "None" tell the user no valid intents were found and provide help.
                    await turnContext.sendActivity(`I'm still learning.
                                                 \nYou can type help to see more options...`);
                }
            }
            else{
                let text2 = turnContext.activity.value.value;
                if(text2 === "yesfunny"){
                    await turnContext.sendActivity(`Thanks, I am glad that I made you laugh`);
                }
                else if(text2 === "nofunny"){
                    await turnContext.sendActivity(`Oh okay, I will improve...`);
                }
            }
            }
            // Save state changes
            await this.conversationState.saveChanges(turnContext);

        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
            // Generic handler for all other activity types.
            await this.sendWelcomeMessage(turnContext);
            await this.welcomedUserProperty.set(turnContext, true);

        }
        else {
            // Generic message for all other activities
            await turnContext.sendActivity(`[${turnContext.activity.type} event detected]`);
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
                subtitle: 'Call us at +1 905-296-4003 or +1 226-474-1169 or email: President@qcsolver.com'
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
    createCostCard() {
        return CardFactory.thumbnailCard(
            '240$ per year',
            [{ url: 'https://members.qcsolver.com/images/qc-solver-logo.png' }],
            [{
                type: 'openUrl',
                title: 'Get started',
                value: 'http://qcsolver.com/solutions/'
            }],
            {
                subtitle: `Cost to register`,
                text: 'Our services are just a click away...'
            }
        );
    }
    async GetWeather(turnContext){
        weather.setLang('en');
        weather.setCity('Kitchener');
        weather.setAPPID('4cd87c3ae59519b5db78beffb4d3a904');
        var jsonobj={};
        return new Promise((resolve,reject) => {
            weather.getAllWeather(function(err, JSONObj){
                jsonobj = JSONObj;
                console.log(JSONObj);
                resolve(JSONObj);
                //turnContext.sendActivity(`The current temperature in kitchener is ${JSONObj.main.temp} deg and it may vary from ${JSONObj.main.temp_min}deg to ${JSONObj.main.temp_max}degrees.`)
            });
        });
        
    }
    async GetAJoke(turnContext){
        var jokes = {};
        
        try{
        return new Promise((resolve,reject) => {
        
        const options = { method: 'Get',url: 'https://icanhazdadjoke.com/', headers: { Accept: 'text/plain' } };
         request(options,  (error, response, body) => {
                                if (!error && response.statusCode == 200) 
                                {
                                    console.log('body:'+body);
                                    jokes.joke = body;
                                    resolve(body);
                                }
                                else {reject(body)};
                            });
                            
        });
        
        }
        catch(e){
            console.log(`message is ${message}`)
            await turnContext.sendActivity(message);
        }
        
    };
    random(low, high) {
        return Math.floor(Math.random() * (high - low) + low);
      }
}

module.exports.EchoBot = EchoBot;
