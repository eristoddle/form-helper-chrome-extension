import * as browser from 'webextension-polyfill';
import $ from 'jquery';
import { storeSubmission } from '../lib/js/storage';

function getFields(form) {
  const fields = [];
  const ignoreTypes = ['hidden', 'submit'];
  $(form).find('input, select, textarea').each(function() {
    const label = (this.name && this.name.length) ? this.name : null;
    const ngModel = (!label && $(this).attr('ng-model') && $(this).attr('ng-model').length) ? $(this).attr('ng-model') : null;
    const classes = !label && !ngModel && $(this).attr('class') && $(this).attr('class').length ? $(this).attr('class') : null;
    if (ignoreTypes.indexOf(this.type) < 0) {
      fields.push({
        label,
        type: this.type,
        classes,
        select: $(this).is('select'),
        ngModel,
      });
    }
  });
  console.log('fields', fields);
  return fields;
}

function getForms() {
  const names = [];
  $('form').each(function () {
    let label = $(this).attr('name') || $(this).attr('action') || $(this).attr('id');
    if (typeof label != 'undefined') {
      let fields = getFields(this);
      names.push({
        label,
        fields
      });
    }
  });
  return names;
}

function fillForm(data) {
  data.forEach((x) => {
    console.log('x', x);
    if (!('key' in x) || x.key == 'name') {
      const $field = $(`[name="${x.fieldLabel}"]`);
      $field.val(x.value);
    } else if (x.key == 'ng-model') {
      const $field = $(`[ng-model="${x.fieldLabel}"]`);
      $field.val(x.value);
    } else if (x.key == 'classes') {
      console.log('classes', x);
    }
  });
}

function setFormListener(port, msg) {
  // TODO: target id or label
  document.forms[0].addEventListener('submit', () => {
    const { profile } = msg;
    storeSubmission({
      profile,
      date: (new Date()).toString().split(' ').splice(1,3).join(' '),
      url: window.location.hostname
    });
  });
}

browser.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((msg) => {
    if (msg.text === 'grab_forms') {
      port.postMessage({
        url: window.location.href,
        forms: getForms()
      });
    }
    if (msg.text === 'set_form_data') {
      fillForm(msg.data);
      setFormListener(port, msg);
      $('.recaptcha-checkbox-checkmark').click();
    }
  });
});
