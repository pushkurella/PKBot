# Bot
This bot is integrated with Microsoft LUIS(Language Understanding and Intelligent Service), Bing spell checker API, Weather API and Joke API.

# Prerequisite to run this bot locally
- Download the bot code from the Build blade in the Azure Portal
- Create a file called .env in the root of the project and add the botFilePath and botFileSecret to it
  - You can find the botFilePath and botFileSecret in the Azure App Service application settings
  - Your .env file should look like this
    ```bash
    botFilePath=<copy value from App settings>
    botFileSecret=<copy value from App settings>
    ```

- Run `npm install` in the root of the bot project
- Finally run `npm start` 


## Testing the bot using Bot Framework Emulator
[Microsoft Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the Bot Framework Emulator from [here](https://aka.ms/botframework-emulator)

### Connect to bot using Bot Framework Emulator v4
- Launch the Bot Framework Emulator
- File -> Open bot and navigate to the bot project folder
- Select `<your-bot-name>.bot` file

# Bot state
A key to good bot design is to track the context of a conversation, so that your bot remembers things like the answers to previous questions. Depending on what your bot is used for, you may even need to keep track of conversation state or store user related information for longer than the lifetime of one given conversation.

In this example, the bot's state is used to track number of messages.

 A bot's state is information it remembers in order to respond appropriately to incoming messages. The Bot Builder SDK provides classes for [storing and retrieving state data](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-v4-state?view=azure-bot-service-4.0&tabs=js) as an object associated with a user or a conversation.

    - Conversation properties help your bot keep track of the current conversation the bot is having with the user. If your bot needs to complete a sequence of steps or switch between conversation topics, you can use conversation properties to manage steps in a sequence or track the current topic. Since conversation properties reflect the state of the current conversation, you typically clear them at the end of a session, when the bot receives an end of conversation activity.

    - User properties can be used for many purposes, such as determining where the user's prior conversation left off or simply greeting a returning user by name. If you store a user's preferences, you can use that information to customize the conversation the next time you chat. For example, you might alert the user to a news article about a topic that interests her, or alert a user when an appointment becomes available. You should clear them if the bot receives a delete user data activity.


# Further reading
- [Azure Bot Service Introduction](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [Bot State](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-storage-concept?view=azure-bot-service-4.0)
- [Write directly to storage](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-v4-storage?view=azure-bot-service-4.0&tabs=jsechoproperty%2Ccsetagoverwrite%2Ccsetag)
- [Managing conversation and user state](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-v4-state?view=azure-bot-service-4.0&tabs=js)


env contents
AzureWebJobsDashboard=DefaultEndpointsProtocol=https;AccountName=pkbot892e;AccountKey=iqAXEMS39gCtffd8V8LgSgjf7F1SzGucohMyTKhCFiBBHl6wYmNSmRTxQbLrW7zbjqXxUcmAFBtsP5E7egsgng==;
AzureWebJobsStorage=DefaultEndpointsProtocol=https;AccountName=pkbot892e;AccountKey=iqAXEMS39gCtffd8V8LgSgjf7F1SzGucohMyTKhCFiBBHl6wYmNSmRTxQbLrW7zbjqXxUcmAFBtsP5E7egsgng==;
botFilePath=./PKBot.bot
botFileSecret=OBh1SHQlnXsmbG3mJPJD1scPfnW4roxK3cYZ7r1tUAc=
BotId=PKBot
BotStateEndpoint=
MicrosoftAppId=babf85b7-6f8c-460f-92b9-a2c4b1065db8
MicrosoftAppPassword=xhrOUUO464$]qfvnWEV01$)
REMOTEDEBUGGINGVERSION=15.0.28010.00
ScmType=None
UseTableStorageForConversationState=true
luisapplicationId=4e4d3ac1-0b45-47ae-a1ed-e83e62a1df3f
# luisdetails
luissubscriptionkey=e358a70e1372402caa166961df52082d
bingSpellcheckKey=68e41212ffc1411986aa3b386d07b3e1