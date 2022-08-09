/* eslint-disable no-undef, camelcase */
'use strict';

/**
 * @member {string||null} href - main post img href
 */
let href = null;
/**
 * @member {string||undefined} matchPercent - the % similarity to match
 */
let matchPercent = localStorage.getItem('matchPercent') || 70;

/**
 * @member {string||null} id - current post id
 */
let id = null;
/**
 * @member {object||null} button - current repost checking button
 */
let button = null;
/**
 * @member {string||null} hijackedId - id for the overlay-overflow
 */
let hijackedId = '';

/**
 * @function detectRepost
 * @description Detects if the post is a repost
 * @void
 */
async function detectRepost() {
  // const url = `https://api.repostsleuth.com/image?filter=true&url=${window.location.href}&same_sub=true&filter_author=true&only_older=false&include_crossposts=false&meme_filter=false&target_match_percent=${matchPercent}&filter_dead_matches=false&target_days_old=0`;
  //
  // const href = encodeURIComponent(
  //   document.querySelector('._3m20hIKOhTTeMgPnfMbVNN').href
  // );

  // get json from https://www.reddit.com/{post id}/.json
  // todo just get the image url via
  // json ['data']['children'][0]['data']['url']
  // no need to wait for the img div to load etc.
  // this is a much better method^, use it

  const dialog = document.getElementById('reposts-dialog'); //
  // clear children
  while (dialog.firstChild) {
    dialog.removeChild(dialog.firstChild);
  }

  if (!href) {
    const e = 'Error: repostsleuth only supports images';
    console.warn(e);
    const msg = document.createElement('div');
    msg.textContent = e;
    msg.style['font-size'] = '20px';
    msg.style['position'] = 'relative';
    msg.style['top'] = '5px';
    dialog.appendChild(msg);
    $('#reposts-dialog').dialog('open');
    return;
  }

  const locationHref = location.href;
  const url = `https://api.repostsleuth.com/image?filter=true&url=${href}&same_sub=true&filter_author=true&only_older=false&include_crossposts=false&meme_filter=false&target_match_percent=${matchPercent}&filter_dead_matches=false&target_days_old=0`;
  // works
  // note: sometimes url does not point to a post that only contains an image,
  // but to a post that contains a link to an image, which gets rendered as
  // an image
  // this edge case needs to be handled by only using the image url from
  // the post

  const loading = document.createElement('div');
  loading.textContent = 'loading';
  const goal = 'loading...';
  let goalFinalIndex = 7;
  const animationInterval = setInterval(() => {
    goalFinalIndex = (goalFinalIndex < 10 && +goalFinalIndex + +1) || 7;
    loading.textContent = goal.substring(0, goalFinalIndex);
  }, 250);

  loading.style['font-size'] = '20px';
  loading.style['position'] = 'relative';
  loading.style['top'] = '5px';

  dialog.appendChild(loading);
  $('#reposts-dialog').dialog('open');

  let result;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6200);
    // result = await fetch('https://corsproxytest123.herokuapp.com/' + url, {
    result = await fetch('https://api.codetabs.com/v1/proxy/?quest=' + url, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // result = await fetch('https://corsproxytest123.herokuapp.com/' + url);
    // use more reliable proxy later
  } catch (e) {
    console.warn('Error while fetching', e);
    console.log('attempting retry with alternate proxy');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      result = await fetch('https://corsproxytest123.herokuapp.com/' + url, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      // use more reliable proxy later
    } catch (e) {
      console.warn('Error while fetching', e);

      const dialog = await initializeDialog(
        'ERROR: error while fetching',
        'err-fetch',
        true
      );
      dialog.textContent = e;
      $(dialog).dialog('open');

      return;
      // todo use karmadecay fallback
    }
  }
  const json = await result.json();

  const { closest_match } = json;
  let { matches } = json;

  // closest_match should exist, and should not be present within matches
  let closestMatchUrl;
  if (closest_match) {
    matches = [closest_match, ...matches];
    closestMatchUrl = `https://www.reddit.com${closest_match.post.perma_link}`;
  }

  let repostCount = 0;

  matches.sort((a, b) => b.match_percent - a.match_percent);

  const links = [];
  // regardless of the query parameter being specified in the url,
  // it can return posts from other subreddits
  const currentSubreddit = location.href.split('/')[4];
  for (const match of matches) {
    if (match.post.subreddit !== currentSubreddit) {
      continue;
    }
    const { hamming_match_percent } = match;
    const link = `https://www.reddit.com${match.post.perma_link}`;
    // console.log(
    //   '%',
    //   hamming_match_percent,
    //   link,
    //   locationHref,
    //   closestMatchUrl,
    //   'link!==locationHref',
    //   link !== locationHref,
    //   'link!==closestMatchUrl',
    //   link !== closestMatchUrl
    // );
    if (
      hamming_match_percent >= matchPercent &&
      link !== locationHref &&
      link !== closestMatchUrl
    ) {
      // add to container
      links.push(link);
      ++repostCount;
    }
  }

  const none = repostCount === 0;
  // prettier formats it incorrectly, someone should open a bug
  // edit: it's somehow fixed now
  // todo remove above comment
  // prettier-ignore
  // eslint-disable-next-line
  const title = `${(none && 'No') || repostCount} reposts found` + (none && '' ||
      `, > ${matchPercent}% match, sorted in descending order of similarity`);
  dialog.textContent = title;

  // separator
  const separator = document.createElement('div');
  separator.style.height = '15px';
  dialog.appendChild(separator);

  clearInterval(animationInterval);

  // couldn't append children from within the loop,
  // adding children separately like this works

  for (const link of links) {
    const a = document.createElement('a');

    a.classList.add('repost-url-container');
    a.target = '_blank';
    a.textContent = link;
    a.href = link;
    dialog.appendChild(a);
  }
}
/**
 * @function initializeDialog
 * @param {string} title - dialog title
 * @param {string} id - dialog id
 * @param {boolean} temporary - whether to destroy dialog on close
 * @return {Promise<object>}
 */
async function initializeDialog(title, id, temporary) {
  const dialog = document.createElement('div');
  dialog.classList.add('reposts-dialog');
  dialog.id = id;

  document.body.appendChild(dialog);

  $(`#${id}`).dialog({
    autoOpen: false,
    modal: true,
    minHeight: 250,
    title: title,
    buttons: {
      'alter match %': function () {
        matchPercent = Number(prompt('Enter new match percent', matchPercent));

        matchPercent = isNaN(matchPercent) ? 70 : matchPercent;
        localStorage.setItem('matchPercent', matchPercent);
      },
      Close: function () {
        // $(this).dialog('close');
        for (const dialogElement of document.querySelectorAll(
          '.reposts-dialog'
        )) {
          try {
            $(dialogElement).dialog('close');
          } catch (e) {
            // don't really need to do anything here
          }
        }
        if (temporary) {
          const dialog = document.getElementById(id);
          dialog.parentNode.remove(dialog);
          return;
        }
      },
    },
  });
  return dialog;
}

/**
 * @function main
 * @void
 */
async function main() {
  {
    id = location.href.split('/')[6];

    const dialog = await initializeDialog(
      'Possible reposts',
      'reposts-dialog',
      false
    );

    dialog.parentNode.style['border-radius'] = '10px';

    let div;
    let failed;
    let existsInterval;

    await new Promise(async (resolve, reject) => {
      // the condition in the other interval can be satisfied just when the
      // user changes the page
      if (!location.href.includes('/comments')) {
        // wait for a bit because sometimes
        // when switching between different panels
        // '/comments' isn't in the url for generally a fraction of
        // a second
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1000);
        });
        if (!location.href.includes('/comments')) {
          reject(new Error('rejecting; page does not contain a post'));
        }
      }
      existsInterval = setInterval(() => {
        console.log('searching for div');
        div =
          document.getElementById(`t3_${id}-overlay-mod-actions-menu`) ||
          document.getElementById(`t3_${id}-mod-actions-menu`) ||
          document.getElementById(`t3_${id}-overlay-overflow-menu`) ||
          document.getElementById(`t3_${id}-overflow-menu`);
        /* worth noting there's a regular
         menu
         when you refresh the page after being on a post, and
         an overlay version of an icon when
         you click on a post while being on
         another post, and see it through 'overlay' view   */

        if (div) {
          resolve();
        }
      }, 30);
    }).catch((e) => {
      console.log(e);
      failed = true;
      // return;
    });

    clearInterval(existsInterval);
    if (failed) {
      console.log('failed');
      return;
    }

    // wait for element with class _3m20hIKOhTTeMgPnfMbVNN to exist
    href = await new Promise((resolve, reject) => {
      existsInterval = setInterval(() => {
        // if either the post viewer exists OR
        // it does exist, but is not expanded

        const a = document.querySelector('._3m20hIKOhTTeMgPnfMbVNN');
        const expandContainer = document.getElementsByClassName(
          'saNpcHve-34zjaa0cbIxW icon icon-expand'
        );

        if (a) {
          resolve(encodeURIComponent(a.href));
        }

        // if the image container has not been expanded, make it expanded
        else if (expandContainer.length !== 0) {
          expandContainer[0].click();
          resolve(
            encodeURIComponent(
              document.querySelector('._3m20hIKOhTTeMgPnfMbVNN').href
            )
          );
        }
        // check if video tag exists with class media-element
        else {
          try {
            if (document.querySelector('.media-element').tagName === 'VIDEO') {
              // videos aren't supported
              resolve(null);
            }
          } catch (err) {
            resolve(null);
          }
        }
      }, 50);
    });

    clearInterval(existsInterval);

    if (!href) {
      console.warn('ERROR: repostsleuth does not support videos');
      return;
    }

    // div = document.getElementById(`t3_${id}-overlay-mod-actions-menu`) ||
    // document.getElementById(`t3_${id}-mod-actions-menu`);

    console.log('inserting repostchecker button');

    if (document.querySelector('.repostchecker-button')) {
      console.warn('repostchecker button already exists; not adding');
      return;
    }
    button = document.createElement('button');

    button.id = 'repostchecker-button';
    button.textContent = 'RC';
    button.classList.add('repostchecker-button');

    button.addEventListener('click', detectRepost);

    // function insertAfter(referenceNode, newNode) {referenceNode.parentNode.
    // insertBefore(newNode, referenceNode.nextSibling);}
    if (div.id.includes('overflow')) {
      // insertAfter(button, div.parentNode.parentNode);
      if (div.id.includes('overlay')) {
        // for overlay, two of the same things we're looking for may
        // exist BEHIND one another, with one not being visible to us

        if (id !== hijackedId) {
          hijackedId = id;
          const container = document.querySelectorAll(
            '._3MmwvEEt6fv5kQPFCVJizH'
          );
          // get last instance of this class
          const div = container.item(container.length - 1);
          console.log('div = ', div);
          div.parentNode.insertBefore(button, div.nextSibling);
        }
      } else {
        div.parentNode.parentNode.parentNode.insertBefore(
          button,
          div.parentNode.parentNode.nextSibling
        );
      }
    } else {
      div.appendChild(button);
    }

    console.log('successfully inserted repostchecker button');
  }
}

// window.addEventListener('popstate', main);
// maybe use interval or something else because obviously the
// load event doesn't fire when navigating to different posts,
// within the same window
// npm run watch before
let url;
// pageShow could've worked better if it does what it says it does
window.addEventListener('load', () => {
  setInterval(async () => {
    if (
      hijackedId !== id &&
      // button &&
      location.href.includes('/comments') &&
      document.getElementById(`t3_${id}-overlay-overflow-menu`) &&
      document.querySelectorAll('.repostchecker-button').length < 2
    ) {
      hijackedId = id;
      //
      button = document.createElement('button');

      button.id = 'repostchecker-button';
      button.textContent = 'RC';
      button.classList.add('repostchecker-button');
      //
      button.addEventListener('click', detectRepost);
      const container = document.querySelectorAll('._3MmwvEEt6fv5kQPFCVJizH');
      // get last instance of this class
      const div = container.item(container.length - 1);
      console.log('div = ', div);
      div.parentNode.insertBefore(button, div.nextSibling);
    }
    if (!url || location.href !== url) {
      console.log('reloading now');

      url = location.href;

      if (location.href.includes('/comments')) {
        await main();
      }
    }
  }, 20);
});
