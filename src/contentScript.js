/* eslint-disable no-undef, camelcase */
'use strict';

const elementReady = require('./element-ready');

/**
 * @function main
 * @void
 */
async function main() {
  let matchPercent = localStorage.getItem('matchPercent') || 70;

  {
    const id = location.href.split('/')[6];

    let div;
    let failed;
    let existsInterval;

    // if (!location.href.includes('/comments')) {
    //   return console.log('ERROR: page does not contain comments, cannot
    // initialize repostchecker UI components');
    // }
    // console.log('runs 2')
    
    
    // await elementReady('._3m20hIKOhTTeMgPnfMbVNN')

    
    await new Promise((resolve, reject) => {
      // the condition in the other interval can be satisfied just when the
      // user changes the page
      if (!location.href.includes('/comments')) {
        reject(new Error('rejecting; page does not contain a post'));
      }
      existsInterval = setInterval(() => {
        div =
          document.getElementById(`t3_${id}-overlay-mod-actions-menu`) ||
          document.getElementById(`t3_${id}-mod-actions-menu`);
        // console.log('div: ', div);

        if (div) {
          resolve();
        }
      }, 80);
    }).catch((e) => {
      console.log(e);
      failed = true;
      // return;
    });

    clearInterval(existsInterval);
    // console.log('cleared interval');
    if (failed) {
      console.log('failed');
      // console.log('will return now');
      return;
    }

    let a;
    // wait for element with class _3m20hIKOhTTeMgPnfMbVNN to exist
    await new Promise((resolve, reject) => {
      existsInterval = setInterval(() => {
        a = document.querySelector('._3m20hIKOhTTeMgPnfMbVNN');
        // console.log('div: ', div);
        if (a) {
          resolve();
        }
      }, 100);
    });

    clearInterval(existsInterval);

    // div = document.getElementById(`t3_${id}-overlay-mod-actions-menu`) ||
    // document.getElementById(`t3_${id}-mod-actions-menu`);

    const button = document.createElement('button');

    button.textContent = 'RC';
    button.style['font-size'] = '20px';
    button.style['white-space'] = 'nowrap';
    button.style['padding-right'] = '4px';

    button.addEventListener('click', detectRepost);

    div.appendChild(button);

    const dialog = document.createElement('div');
    dialog.id = '_reposts_dialog';
    dialog.style['position'] = 'relative !important';
    dialog.style['padding-bottom'] = '5px';
    dialog.style['word-break'] = 'break-all';

    document.body.appendChild(dialog);

    $('#_reposts_dialog').dialog({
      autoOpen: false,
      modal: true,
      title: 'Possible reposts',
      buttons: {
        'alter match %': function () {
          matchPercent = Number(
            prompt('Enter new match percent', matchPercent)
          );

          matchPercent = isNaN(matchPercent) ? 70 : matchPercent;
          localStorage.setItem('matchPercent', matchPercent);
        },
        Close: function () {
          $(this).dialog('close');
        },
      },
    });
  }

  /**
   * @function detectRepost
   * @description Detects if the post is a repost
   * @void
   */
  async function detectRepost() {
    // const url = `https://api.repostsleuth.com/image?filter=true&url=${window.location.href}&same_sub=true&filter_author=true&only_older=false&include_crossposts=false&meme_filter=false&target_match_percent=${matchPercent}&filter_dead_matches=false&target_days_old=0`;
    const href = encodeURIComponent(
      document.querySelector('._3m20hIKOhTTeMgPnfMbVNN').href
    );

    // get json from https://www.reddit.com/{post id}/.json
    // todo just get the image url via json ['data']['children'][0]['data']['url']
    // no need to wait for the img div to load etc.
    // this is a much better method^, use it

    const locationHref = location.href;
    const url = `https://api.repostsleuth.com/image?filter=true&url=${href}&same_sub=true&filter_author=true&only_older=false&include_crossposts=false&meme_filter=false&target_match_percent=${matchPercent}&filter_dead_matches=false&target_days_old=0`;
    // works
    // note: sometimes url does not point to a post that only contains an image,
    // but to a post that contains a link to an image, which gets rendered as
    // an image
    // this edge case needs to be handled by only using the image url from
    // the post

    let result;
    try {
      result = await fetch('https://corsproxytest123.herokuapp.com/' + url);
    } catch (e) {
      console.log('ERR while fetching', e);
      $('#_reposts_dialog').dialog('open');
      dialog.textContent = 'ERR while fetching; check console';

      return;
      // todo use fallback karmadecay
    }

    const json = await result.json();
    // console.log(result);

    const { closest_match } = json;
    let { matches } = json;

    const dialog = document.getElementById('_reposts_dialog');
    // clear children

    while (dialog.firstChild) {
      dialog.removeChild(dialog.firstChild);
    }

    // closest_match should exist, and should not be present within matches

    let closestMatchUrl;
    if (closest_match) {
      matches = [closest_match, ...matches];
      closestMatchUrl = `https://www.reddit.com${closest_match.post.perma_link}`;
    }

    let repostCount = 0;

    // $('#_reposts_dialog').dialog('open');
    // console.log('matches:', matches);

    matches.sort((a, b) => b.match_percent - a.match_percent);

    $('#_reposts_dialog').dialog('open');

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
    // edit: nvm think it's fixed now
    // todo remove above comment
    // prettier-ignore
    // eslint-disable-next-line
    const title = `${(none && 'No') || repostCount} reposts found` + (none&& '' ||
    `, > ${matchPercent}% match, sorted in descending order of similarity`);
    dialog.textContent = title;

    // separator
    const separator = document.createElement('div');
    separator.style.height = '15px';
    dialog.appendChild(separator);
    // couldn't append children from within the loop,
    // adding children separately like this works

    for (const link of links) {
      const a = document.createElement('a');

      a.classList.add('repost_url_container');
      a.target = '_blank';
      a.textContent = link;
      a.href = link;
      dialog.appendChild(a);
    }
  }
}

// window.addEventListener('popstate', main);
// maybe use interval or something else because obviously the
// load event doesn't fire when navigating to different posts,
// within the same window
// npm run watch before
let url;
window.onload = function () {
  setInterval(async () => {
    if (
      !url ||
      (location.href !== url && location.href.includes('/comments'))
    ) {
      console.log('reloading now');

      url = location.href;
      await main();
    }
  }, 125);
  // changed from 150 -> 125
};
