import React from 'react';
import CollapsibleInstruction from '../components/CollapsibleInstruction'; // Adjust the path if necessary

const page = () => {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-center mb-6">Instructions</h1>
      
      <CollapsibleInstruction title="Using the Remind Me Application">
        <div>
          <h3 className="text-2xl font-semibold">Alexa Setup</h3>
          <p>
            Alexa is set up so that if she hears a phrase that doesn't exactly match what she expects, she will try to infer the best option.
          </p>

          <h3 className="text-2xl font-semibold">Starting a Session</h3>
          <p>
            Open our application with “Alexa, open Remind Me”. After the application is open, you have the following application options:
          </p>
          <ul className="list-disc ml-6">
            <li>“Add a reminder”</li>
            <li>“Add an event”</li>
            <li>“Remove a reminder”</li>
            <li>“List my reminders”</li>
          </ul>

          <h3 className="text-2xl font-semibold">Creating a Reminder</h3>
          <p>
            You can create a reminder by saying phrases like:
          </p>
          <ul className="list-disc ml-6">
            <li>“Add a reminder named. . .”</li>
            <li>“Create a reminder named. . .”</li>
            <li>“Add a reminder”</li>
            <li>“Create a reminder”</li>
          </ul>
          <p>
            If the name was already given, you’ll be prompted to give the date and time of the reminder. Some examples are:
          </p>
          <ul className="list-disc ml-6">
            <li>“January 14th, 2025 at 4pm”</li>
            <li>“Tomorrow at 8am”</li>
            <li>“Wednesday at noon”</li>
          </ul>
          <p>
            If the name hasn’t already been given, she’ll ask for the name of the reminder first, followed by the date and time.
          </p>
          <ul className="list-disc ml-6">
            <li>“Appointment with. . .”</li>
            <li>“Pick up. . .”</li>
            <li>“Paperwork”</li>
          </ul>
          <p>
            Then, she’ll ask for the date and time of the reminder like in the previous option. 

            Alexa will respond that the reminder was created and then you will be prompted for what you would like to do next. This could be one of the application choices or “quit” to end the Remind Me session.
          </p>

          <h3 className="text-2xl font-semibold">Creating an Event</h3>
          <p>
            An event is similar to a reminder, but it includes an end time.
          </p>
          <p>
            You can create an event by saying phrases like:
          </p>
          <ul className="list-disc ml-6">
            <li>“Add an event named. . .”</li>
            <li>“Create an event named. . .”</li>
            <li>“Create an event”</li>
            <li>“Add an event”</li>
          </ul>
          <p>
            If the name hasn’t been given, she’ll ask for the name first. If the name was already given, this step will be skipped.
          </p>
          <ul className="list-disc ml-6">
            <li>“Appointment with. . .”</li>
            <li>“Pick up. . .”</li>
            <li>“Paperwork”</li>
          </ul>
          <p>
            After, you’ll be prompted to provide the date for the event.
          </p>
          <ul className="list-disc ml-6">
            <li>“January 14th, 2025”</li>
            <li>“Tomorrow”</li>
            <li>“Wednesday”</li>
          </ul>
          <p>
            Lastly, you’ll be prompted to provide the start and end time for the event.
          </p>
          <ul className="list-disc ml-6">
            <li>“4pm to 6pm”</li>
            <li>“11am to 2pm”</li>
          </ul>
          <p>
            Alexa will respond that the event was created and then you will be prompted for what you would like to do next. This could be one of the application choices or “quit” to end the Remind Me session. 
          </p>
          <h3 className="text-2xl font-semibold">Removing an Event/Reminder</h3>
          <p>
            To remove a reminder or event, you can say:
          </p>
          <ul className="list-disc ml-6">
            <li>“Remove a reminder”</li>
            <li>“Remove a reminder named. . .”</li>
          </ul>
          <p>
            If the name wasn’t given, you’ll be prompted to provide it. Otherwise, it will skip this step.
          </p>
          <ul className="list-disc ml-6">
            <li>“Appointment with. . .”</li>
            <li>“Pick up. . .”</li>
            <li>“Paperwork”</li>
          </ul>
          <p>
            Then, you'll need to provide the date of the reminder to be removed.
          </p>
          <ul className="list-disc ml-6">
            <li>“January 14th, 2025”</li>
            <li>“Tomorrow”</li>
            <li>“Wednesday”</li>
          </ul>
          <p>
            Alexa will respond that the reminder/event was removed and then you will be prompted for what you would like to do next. This could be one of the application choices or “quit” to end the Remind Me session. 
          </p>
          <h3 className="text-2xl font-semibold">Listing Daily Reminders</h3>
          <p>
            To list the current day’s reminders, you can say:
          </p>
          <ul className="list-disc ml-6">
            <li>“List reminders”</li>
            <li>“List my reminders”</li>
          </ul>

          <h3 className="text-2xl font-semibold">Ending a Session / Canceling a Request</h3>
          <p>
            The phrase “quit” will end the session in Remind Me. At any point during the session, ‘stop’ will cancel the current request, but not end the session.
          </p>
          <p>
            After saying ‘stop’, you can continue with any one of the application choices or say “quit” to end the session.
          </p>
        </div>
      </CollapsibleInstruction>
      
      <CollapsibleInstruction title="Desktop Shortcut">
        <p>Insert Instructions Here</p>
      </CollapsibleInstruction>

      <CollapsibleInstruction title="Using the Website">
        <p>Insert Instructions Here</p>
      </CollapsibleInstruction>
    </div>
  );
};

export default page;

