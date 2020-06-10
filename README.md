# Form Helper Extenison

This is a pretty basic extension I created to submit companies that have a lot of branches to citation sources and directories. In other words, it is built to submit multiple profiles to multiple sites. Most similar tools I have found are for submitting one profile to multiple sites.

## Build and Install Instructions

 - npm run dev: will listen as you develop and rebuild the extension
 - npm run build: builds the extension

In Chrome, just go to extensions and click Load Unpacked and select either the dev or build folder depending on what you are doing.

## Plugins Options Page Tabs

Form: stored form structure plus mapping from form fields to profile fields

Profile Type: a set of labels for holding profile data

Profiles: data that will be submitted to forms, mapped to a profile type

Submissions: keeps track of forms you have submitted and which profile as well as the data.

## Usage Instructions

If you are on a field with a form, clicking the plugin icon will open a popup. Clicking grab forms will generate a list of buttons, on per form. Click the form you want to capture. Next you can select the fields on the form you want to store for later auto filling. You can also set a profile type if you want and if you do, you can then set the profile field that maps to each form field. Saving will save the form.

Revisiting the url with the form will populate the stored form data. With multistep forms, just click the extension icon again to update the form record with new fields in the next step.