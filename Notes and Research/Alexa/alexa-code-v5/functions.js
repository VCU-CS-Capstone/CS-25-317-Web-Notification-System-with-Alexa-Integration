

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
      const speakOutput = `${eventName} on ${eventDate} at ${eventStartTime} was added. What else would you like to do?`;
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('What else would you like to do?')
        .getResponse();
    }
    if (eventEndTime !== null){
      const speakOutput = `${eventName} on ${eventDate} from ${eventStartTime} to ${eventEndTime} was added. What else would you like to do?.`;
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('What else would you like to do?')
        .getResponse();
    }

  } catch (err) {
    const speakOutput = `An unexpected error occurred: ${err.message}`;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

/* Remove Event Function 
* 
* -- Case when the event isn't found? --
*/
const RemoveEventFunction = async (eventName, eventDate, supabase, handlerInput) => {
  // Delete entry data from Supabase
  const date = new Date(eventDate).toISOString();
  try {
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('event_name', eventName)
      .eq('event_date', date);

    if (error) {
      const speakOutput = `The reminder was not deleted due to an error: ${error.message}`;
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }

    const speakOutput = `${eventName} was removed. What else would you like to do?`;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('What else would you like to do?')
      .getResponse();

  } catch (err) {
    const speakOutput = `An unexpected error occurred: ${err.message}`;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

module.exports = {
  InsertEventFunction, 
  RemoveEventFunction
};