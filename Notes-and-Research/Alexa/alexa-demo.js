const Alexa = require('ask-sdk-core');
const { createClient } = require('@supabase/supabase-js');

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
    const speakOutput = 'Welcome, what would you like to do?';

    // Set a session attribute to remember the context
    sessionAttributes.welcomeChoice = true;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse();
  }
};

// Insert Event to Supabase
const InsertEventFunction = async (eventDate, eventName, eventStartTime, eventEndTime, supabase, handlerInput) => {
  // Convert eventDate to ISO format
  const date = new Date(eventDate).toISOString();

  // Create the new event entry
  const newEntry = {
    userid: 4, // Hardcode
    event_name: eventName,
    event_date: date,
    start_time: eventStartTime,
    end_time: eventEndTime,
  };

  // Insert entry data into Supabase
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([newEntry]);

    if (error) {
      const speakOutput = `The reminder was not created due to an error: ${error.message}`;
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
    
    if (eventEndTime === null){
      const speakOutput = `${eventName} on ${eventDate} was added. What else would you like to do?`;
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
    if (eventEndTime !== null){
      const speakOutput = `${eventName} on ${eventDate} from ${eventStartTime} to ${eventEndTime} was added. What else would you like to do?.`;
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }

  } catch (err) {
    const speakOutput = `An unexpected error occurred: ${err.message}`;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

// Create event intent handler
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

    // Check if we're asking for the end time
    if (sessionAttributes.askingForEndTime) {
      if (eventEndTime) {
        // User provided an end time
        sessionAttributes.askingForEndTime = false;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

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

// Order matters 
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CreateEventIntentHandler, 
        HelpIntentHandler, 
        CancelIntentHandler, 
        StopIntentHandler,
        FallbackIntentHandler
    )
    .lambda();