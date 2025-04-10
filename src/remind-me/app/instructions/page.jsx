import React from 'react';
//import YouTube from 'react-youtube'; // to be used when embedding the vidoes if we publish on the capstone youtube
import CollapsibleInstruction from '../components/CollapsibleInstruction'; // Adjust the path if necessary

const page = () => {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-center mb-6">Instructions</h1>
      
      <CollapsibleInstruction title="Using Alexa">
        <div>
          <h3 className="text-2xl font-semibold">Alexa Setup</h3>
          <p>
            Alexa is set up so that if she hears a phrase that doesn't exactly match what she expects, she will try to infer the best option.
          </p>
          <br></br>
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
          <br></br>
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
          <br></br>
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
          <br></br>
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
          <br></br>
          <h3 className="text-2xl font-semibold">Listing Daily Reminders</h3>
          <p>
            To list the current day’s reminders, you can say:
          </p>
          <ul className="list-disc ml-6">
            <li>“List reminders”</li>
            <li>“List my reminders”</li>
          </ul>
          <br></br>
          <h3 className="text-2xl font-semibold">Ending a Session / Canceling a Request</h3>
          <p>
            The phrase “quit” will end the session in Remind Me. At any point during the session, ‘stop’ will cancel the current request, but not end the session.
          </p>
          <p>
            After saying ‘stop’, you can continue with any one of the application choices or say “quit” to end the session.
          </p>
        </div>
      </CollapsibleInstruction>
      
      <CollapsibleInstruction title="Setting up Fitbit Watch">
        <div>
          <h3 className="text-2xl font-semibold">Fitbit Setup Overview</h3>
          <p>
            First, download the Fitbit mobile app and create an account. Since our project uses a Google account, we’ll be signing in with that. You’ll need access to the <strong>cscapstoneqlplus25@gmail.com</strong> credentials to proceed.
          </p>
          <br></br>
          <h3 className="text-2xl font-semibold">Getting Started</h3>
          <p>Follow these steps to connect and configure the Fitbit Versa 4:<br></br></p>
          <ol className="list-decimal ml-6">
            <li>Plug in the watch to begin setup.</li>
            <li>Once the Fitbit watch powers on, select your language.</li>
            <li>When prompted on the watch, switch over to the Fitbit app on the iPhone.</li>
            <li>Tap the device icon in the top left corner of the app.</li>
            <li>Select “Add Device” to begin pairing your watch.</li>
            <li>From the list, choose “Versa 4” (the device used for the 2024–25 Capstone Project).</li>
            <li>Tap “Start Setup” on the next screen.</li>
            <li>Agree to the Fitbit terms (you may need to scroll to click “I agree”).</li>
            <li>Tap “Continue” when prompted.</li>
            <li>Enter the 4-digit code shown on the watch when asked.</li>
            <li>Allow any pop-up permissions by tapping “Pair” and “Allow.”</li>
            <li>If prompted, tap “Update” to install the latest Fitbit software.</li>
          </ol>

          <p>
            <br></br>
            Once the watch is updated and fully set up, you’ll be ready to begin using the device in conjunction with the Capstone Project tools, including Alexa Skills and Google integrations.
          </p>
        </div>
      </CollapsibleInstruction>

      <CollapsibleInstruction title="Creating Desktop Shortcut for Website">
        <div>
          <h3 className="text-2x1 font-semibold">Add Website to Desktop</h3>
          <p>There are different instructions for Windows users and Appl users. Please go to the set of instructions that applies to your computer system.</p>
          <br></br>
          <h3 className="text-2x1 font-semibold">Shortcut for Windows</h3>
          <p>These are the instructions for Windows users only:<br></br></p>
          <o1 className="list-decimal ml-6">
            <li>Right click on home screen once you've opened up your laptop.</li>
            <li>Select or hover over the "New" option from the drop down menu.</li>
            <li>Select the "Shortcut" option from the drop down menu.</li>
              <li>A pop up should then ask: "What item would you like to create a shortcut for?"</li>
            <li>Next, you will paste the website URL from browser into "Type the location of the item:" bar.</li>
            <li>Once the website URL is seen there, click the "Next" button</li>
            <li>After that, it will ask: "What would you like to name the shortcut?"</li>
              <li>Here, you can name it "RemindMe", "RemindMe Website", or whatever works for you to know what the shortcut goes to.</li>
            <li>Now you will click the "Finish" button.</li>
            <li>Everything is now set up! Be aware that it will have the name of the website with the image to click being your default browser.</li>
          </o1>

          <p>
            <br></br>
            You're website should now be easily accessible to open from the desktop without having to enter the website everytime you wish to use it.
          </p>
        </div>
      </CollapsibleInstruction>

      <CollapsibleInstruction title="Alexa Mobile App">
      <div>
          <h3 className="text-2xl font-semibold">iPhone Instructions</h3>
          <p>
            First, download the Alexa mobile app and create an account. Since our project uses a Google account, we’ll be signing in with that. You’ll need access to the <strong>cscapstoneqlplus25@gmail.com</strong> credentials to proceed.
          </p>
          <br></br>
          <h3 className="text-2xl font-semibold">Getting Started</h3>
          <ol className="list-decimal ml-6">
            <li>Log-in with account credentials</li>
            <li>Click on the name ‘User’.
            </li>
            <li>Click ‘Skip’.
            </li>
            <li>If you would like to set up Voice ID you can follow the app instructions here, otherwise click ‘Remind Me Later’.            </li>
            <li>Click ‘Set Up My Features’.
            </li>
            <li>Until this application has been officially deployed, click ‘Cancel’ → ‘Skip’ → ‘Cancel’.</li>
            <li>Click ‘That’s Everyone’ then ‘Done’ to finish setting up the account.</li>
          </ol>
          <br></br>
          <h3 className="text-2xl font-semibold">App Settings</h3>
          <ol>
            <li>
              When you open the app, you’ll see this dashboard. At the bottom of the screen, click on the icon with three lines.
            </li>
            <li>
              Then look for the gear icon and click ‘Settings’<div className=""></div>
            </li>
          </ol>
          <br></br>
          <h3 className="text-2xl font-semibold">Hands-Free</h3>
          <ol>
            <li>
              Go to the settings page (instructions for Settings are described in the previous section) 
            </li>
            <li>
              Click on ‘Alexa App Settings’
            </li>
            <li>
              Toggle the button to Enable Alexa Hands-free (Should turn colored)
            </li>
          </ol>
        </div>
      </CollapsibleInstruction>
    </div>
  );
};

export default page;

