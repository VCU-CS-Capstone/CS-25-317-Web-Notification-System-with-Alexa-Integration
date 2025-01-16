/* 1-15-25 
 * Added function to insert event data into Supabase
 * 
 * Separated end time from date and start time in Alexa for simplicity 
 * 
*/

const Alexa = require('ask-sdk-core');
const { createClient } = require('@supabase/supabase-js');

// Supabase URL and API key
const SUPABASE_URL = 'https://ialcoyyfwycdaldjdpyo.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbGNveXlmd3ljZGFsZGpkcHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwMTExNjksImV4cCI6MjA0NjU4NzE2OX0.YLERwCV9-YqBquazVPjXwiLM_acNLN-pkg92Mr23Sos';

// Create a Supabase client instance
const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

const LaunchRequestHandler = {
  canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
      const speakOutput = 'Welcome, what would you like to do?';

      return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(speakOutput)
          .getResponse();
  }
};

// Insert Event Function
const InsertEventFunction = async (eventDate, eventName, eventStartTime, eventEndTime, supabase, handlerInput) => {
  // Convert eventDate to ISO format
  const date = new Date(eventDate).toISOString();

  // Create the new event entry
  const newEntry = {
    userid: 4, // Hardcode
    event_name: eventName,
    event_date: date,
    start_time: eventStartTime,
    end_time: eventEndTime || null,
  };

  // Insert entry data into Supabase
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([newEntry]);

    if (error) {
      const speakOutput = `The event was not created due to an error: ${error.message}`;
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }

    const speakOutput = `The event was successfully created!`;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();

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

        return handlerInput.responseBuilder
          .speak(speakOutput)
          .getResponse();
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

        // Create event data for Supabase
        return await InsertEventFunction(eventDate, eventName, eventStartTime, eventEndTime, supabase, handlerInput);
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

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CreateEventIntentHandler
    )
    .lambda();
