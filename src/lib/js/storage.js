import * as browser from 'webextension-polyfill';
import { v4 as uuidv4 } from 'uuid';
const storage = browser.storage.local;


const storeInKey = function(firstKey, secondKey, data) {
  return storage.get(firstKey).then(function(r) {
    if (firstKey in r) {
      const results = r[firstKey];
      const exists = results.find(x => x[secondKey] === data[secondKey]);
      if (exists) {
        const updated = results.map(function(x) {
          if (x[secondKey] === data[secondKey]) {
            return data;
          } else {
            return x;
          }
        });
        return storage.set({ [firstKey]: updated });
      }
      results.push(data);
      return storage.set({ [firstKey]: results });
    } else {
      return storage.set({ [firstKey]: [data] });
    }
  });
};

const importInKey = function(firstKey, secondKey, data) {
  return storage.get(firstKey).then(function(r) {
    if (firstKey in r) {
      const results = r[firstKey];
      const updated = [...results, ...data];
      return storage.set({ [firstKey]: updated });
    } else {
      return storage.set({ [firstKey]: data });
    }
  });
};

const getInKey = function(firstKey, secondKey, keyValue) {
  return storage.get(firstKey).then(function(r) {
    if (firstKey in r) {
      const results = r[firstKey];
      return results.find((x) => x[secondKey] === keyValue);
    }
    return false;
  });
};

const deleteinKey = function(firstKey, secondKey, keyValue) {
  storage.get(firstKey).then(function (r) {
    if (firstKey in r) {
      const results = r[firstKey];
      const updated = results.map(function (x) {
        if (x[secondKey] !== keyValue) {
          return x;
        }
      });
      return storage.set({ [firstKey]: updated });
    }
  });
};

const listKey = function(key) {
  return storage.get(key).then(function (r) {
    if (key in r) {
      return r[key];
    }
    return false;
  });
};

const deleteKey = function(key) {
  storage.get(key).then(function(r) {
    if (key in r) {
      return storage.set({ [key]: [] });
    }
  });
};

export const exportData = function() {
  return storage.get();
};

export const importData = function(data) {
  return storage.set(data);
};

export const storeForm = function(data) {
  return storeInKey('forms', 'url', data);
};

export const getForm = function(url) {
  return getInKey('forms', 'url', url);
};

export const deleteForm = function (url) {
  return deleteinKey('forms', 'url', url);
};

export const getForms = function () {
  return listKey('forms');
};

export const storeProfileType = function(data) {
  return storeInKey('profileTypes', 'name', data);
};

export const getProfileType = function(name) {
  return getInKey('profileTypes', 'name', name);
};

export const deleteProfileType = function(name) {
  return deleteinKey('profileTypes', 'name', name);
};

export const getProfileTypes = function () {
  return listKey('profileTypes');
};

export const storeProfile = function(data) {
  if (!('uuid' in data)) {
    data.uuid = uuidv4();
  }
  return storeInKey('profiles', 'uuid', data);
};

export const importProfiles = function(data) {
  const profiles = data.map((x) => {
    if (!('uuid' in x)) {
      x.uuid = uuidv4();
    }
    return x;
  });
  return importInKey('profiles', 'uuid', profiles);
};

export const getProfile = function(uuid) {
  return getInKey('profiles', 'uuid', uuid);
};

export const deleteProfile = function(uuid) {
  return deleteinKey('profiles', 'uuid', uuid);
};

export const getProfiles = function () {
  return listKey('profiles');
};

export const storeSubmission = function(data) {
  if (!('uuid' in data)) {
    data.uuid = uuidv4();
  }
  return storeInKey('submissions', 'uuid', data);
};

export const getSubmissions = function() {
  return listKey('submissions');
};

export const deleteSubmissions = function() {
  return deleteKey('submissions');
};

export const download = function(content, fileName, contentType) {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
};

export const getDomainFromUrl = (data) => {
  var a = document.createElement('a');
  a.href = data;
  return a.hostname;
};

export const getUrlData = function(url) {
  let mapping;
  let label;
  let profileType;
  return getForm(url)
    .then((form) => {
      if(form) {
        mapping = form.mapping;
        label = form.label;
        profileType = form.profileType;
        return getProfiles();
      }
      return [];
    })
    .then((profiles) => {
      return {
        profiles: profiles.filter((x) => x.profileType == profileType),
        mapping,
        label
      };
    });
};
