"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.elementReady = elementReady;

// MIT Licensed
// Author: jwilson8767

/**
 * Waits for an element satisfying selector to exist, then resolves promise with the element.
 * Useful for resolving race conditions.
 *
 * @param selector
 * @returns {Promise}
 */
function elementReady(selector) {
  return new Promise(function (resolve, reject) {
    var el = document.querySelector(selector);

    if (el) {
      resolve(el);
      return;
    }

    new MutationObserver(function (mutationRecords, observer) {
      // Query for elements matching the specified selector
      Array.from(document.querySelectorAll(selector)).forEach(function (element) {
        resolve(element); //Once we have resolved we don't need the observer anymore.

        observer.disconnect();
      });
    }).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  });
}