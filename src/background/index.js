import * as browser from 'webextension-polyfill';
import { getUrlData, getDomainFromUrl } from '../lib/js/storage';

let profiles;
let mapping;
let formLabel;

const setFormData = (data, profile) => {
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => {
      const port = browser.tabs.connect(tabs[0].id);
      port.postMessage({ text: 'set_form_data', data, profile, formLabel });
    });
};

const internalHandler = (label) => {
  const profile = profiles.find((x) => x.label == label);
  const { values } = profile;
  const data = mapping.reduce((a, c) => {
    const { fieldLabel, profileLabel, key } = c;
    const label = values.find((x) => x.profileLabel == profileLabel);
    if (label && 'value' in label) {
      const { value } = label;
      return [...a, ...[{ fieldLabel, value, key }]];
    } else {
      return a;
    }
  },[]);
  setFormData(data, label);
};

browser.tabs.onUpdated.addListener(function(tabId, info, tab) {
  const { url } = tab;

  browser.contextMenus.removeAll();
  const parent = browser.contextMenus.create({
    title: 'Form Helper',
    contexts: ['editable'],
  });
  const auto = browser.contextMenus.create({
    title: 'Autofill form with profile',
    parentId: parent,
    contexts: ['editable']
  });
  // const manual = browser.contextMenus.create({
  //   title: 'Manual',
  //   parentId: parent,
  //   contexts: ['editable'],
  //   onclick: clickHandler,
  // });
  getUrlData(getDomainFromUrl(url)).then((data) => {
    mapping = data.mapping;
    profiles = data.profiles;
    formLabel = data.label;
    data.profiles.forEach((profile) => {
      browser.contextMenus.create({
        title: profile.label,
        parentId: auto,
        contexts: ['editable'],
        onclick: () => internalHandler(profile.label),
      });
    });
  });
});