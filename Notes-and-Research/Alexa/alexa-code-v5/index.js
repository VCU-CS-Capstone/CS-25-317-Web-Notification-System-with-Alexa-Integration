/* Alexa Code v5
 * 
 * Includes functions.js to hold all functions needed: 
 * - InsertEvent
 * - RemoveEvent
*/

const Alexa = require('ask-sdk-core');
const { createClient } = require('@supabase/supabase-js');

const { 
  InsertEventFunction, 
  RemoveEventFunction
} = require('./functions');

// Supabase URL and API key
const SUPABASE_URL = 'https://ialcoyyfwycdaldjdpyo.supabase.co';
const supabaseAPI_Key =  process.env.SUPABASE_API_KEY;

// Create a Supabase client instance
const supabase = createClient(SUPABASE_URL, supabaseAPI_Key);

const LaunchRequestHandler = {
  canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const speakOutput = 'Opening Remind Me. What would you like to do?';

    // Set a session attribute to remember the context
    sessionAttributes.welcomeChoice = true;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse();
  }
};

// Create reminder intent handler
const CreateEventIntentHandler = {
  canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CreateEventIntent';
  },
  async handle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    const slots = request.intent.slots;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const eventName = slots.eventName.value;
    const eventDate = slots.eventDate.value;
    const eventStartTime = slots.eventStartTime.value;
    const eventEndTime = slots.eventEndTime.value;
    const confirmationSlot = slots.confirmationSlot.value;

    sessionAttributes.welcomeChoice = false; 
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    // Check if we're asking for the end time
    if (sessionAttributes.askingForEndTime) {
      if (eventEndTime) {
        // User provided an end time
        sessionAttributes.askingForEndTime = false;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        // Create reminder in Supabase
        return await InsertEventFunction(eventDate, eventName, eventStartTime, eventEndTime, supabase, handlerInput);
      } else {
        // Reprompt for end time
        const speakOutput = `What time should the event ${eventName} end?`;
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(speakOutput)
          .addElicitSlotDirective('eventEndTime')
          .getResponse();
      }
    }

    // Check for confirmation to ask for the end time
    if (!sessionAttributes.askingForEndTime && confirmationSlot) {
      if (confirmationSlot.toLowerCase() === 'yes') {

        sessionAttributes.askingForEndTime = true;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        const speakOutput = `What time should the event ${eventName} end?`;
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(speakOutput)
          .addElicitSlotDirective('eventEndTime')
          .getResponse();

      } else if (confirmationSlot.toLowerCase() === 'no') {
        let noEndTime = null; 
        // Create event data for Supabase
        return await InsertEventFunction(eventDate, eventName, eventStartTime, noEndTime, supabase, handlerInput);
      }
    }
    
    // If no confirmation or eventEndTime is provided
    const errorOutput = `I'm sorry, I didn't understand your response. Could you say "yes" or "no"?`;
    return handlerInput.responseBuilder
        .speak(errorOutput)
        .reprompt(errorOutput)
        .addElicitSlotDirective('confirmationSlot')
        .getResponse();
      
  }
};

// Remove Reminder intent handler
const RemoveEventIntentHandler = {
  canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'RemoveEventIntent');
  },
  handle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    const intent = handlerInput.requestEnvelope.request.intent;
    const slots = request.intent.slots;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const confirmationStatus = intent.confirmationStatus; 

    if (confirmationStatus === 'CONFIRMED'){

      const eventName = slots.eventName.value;
      const eventDate = slots.eventDate.value;

      // Remove reminder in Supabase
      return RemoveEventFunction(eventName, eventDate, supabase, handlerInput);
    }
    else if (confirmationStatus === 'DENIED'){

      const speakOutput = `Action is denied. What would you like to do next?`;
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    } else {

      const speakOutput = `You want to remove the reminder ${eventName} on ${eventDate}. Is that correct?`
      return handlerInput.responseBuilder
      .speak(speakOutput)
      .addConfirmIntentDirective(intent) // Prompt for confirmation
      .getResponse();
    }
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
      const speakOutput = 'You can say make a reminder, remove a reminder, or list reminders! What would you like to do?';

      return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(speakOutput)
          .getResponse();
  }
};

const CancelIntentHandler = {
  canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent');
  },
  handle(handlerInput) {
      const speakOutput = 'Action cancelled.';

      return handlerInput.responseBuilder
          .speak(speakOutput)
          .getResponse();
  }
};

const StopIntentHandler = {
  canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
      const speakOutput = 'Closing Remind Me.';

      return handlerInput.responseBuilder
          .speak(speakOutput)
          .withShouldEndSession(true) // Gracefully ends the session
          .getResponse(); 
  }
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {

    // Retrieve session attributes
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    // Error in initial user choice 
    if (sessionAttributes.welcomeChoice) {
    const speechText = "I didn't catch that. You can say 'add a reminder', 'remove a reminder', or 'list reminders'.";
    const repromptText = "You can say 'add a reminder', 'remove a reminder', or 'list reminders'.";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
    }

    // Generic error in response 
    const speakOutput = `Sorry, I don't know about that. Please try again.`;

    return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CreateEventIntentHandler,
        RemoveEventIntentHandler, 
        HelpIntentHandler, 
        CancelIntentHandler,
        StopIntentHandler,
        FallbackIntentHandler
    )
    .lambda();
