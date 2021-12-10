/* eslint-disable no-undef, camelcase */
'use strict';

let matchPercent = 70;

/**
 * @function main
 * @void
 */
async function main() {
  {
    const key = location.href.split('/')[6];

    let div;
    let failed;
    let existsInterval;

    await new Promise((resolve, reject) => {
      // the condition in the other interval can be satisfied just when the
      // user changes the page
      if (!location.href.includes('/comments')) {
        reject(new Error('rejecting; page does not contain a post'));
      }
      existsInterval = setInterval(() => {
        div =
          document.getElementById(`t3_${key}-overlay-mod-actions-menu`) ||
          document.getElementById(`t3_${key}-mod-actions-menu`);
        // console.log('div: ', div);

        if (div) {
          resolve();
        }
      }, 100);
    }).catch((e) => {
      console.log(e);
      failed = true;
      // return;
    });

    clearInterval(existsInterval);
    console.log('cleared interval');
    if (failed) {
      console.log('failed');
      console.log('will return now');
      return;
    }

    // div = document.getElementById(`t3_${key}-overlay-mod-actions-menu`) ||
    // document.getElementById(`t3_${key}-mod-actions-menu`);

    const button = document.createElement('button');

    button.textContent = 'RC';
    button.style['font-size'] = '20px';
    button.style['white-space'] = 'nowrap';

    console.log('runs 0');
    button.addEventListener('click', detectRepost);

    div.appendChild(button);

    console.log('runs 0.5');

    const dialog = document.createElement('div');
    dialog.id = '_reposts_dialog';
    dialog.style['position'] = 'relative';
    dialog.style['padding-bottom'] = '5px';
    dialog.style['word-break'] = 'break-all';

    document.body.appendChild(dialog);

    $('#_reposts_dialog').dialog({
      autoOpen: false,
      modal: true,
      title: 'Possible reposts',
      buttons: {
        'alter match %': function () {
          matchPercent = prompt('Enter new match percent', matchPercent);
        },
        Close: function () {
          $(this).dialog('close');
        },
      },
    });
    console.log('runs 0.75');
  }

  console.log('runs 1');
  /**
   * @function detectRepost
   * @description Detects if the post is a repost
   * @void
   */
  async function detectRepost() {
    const url = `https://api.repostsleuth.com/image?filter=true&url=${window.location.href}&same_sub=true&filter_author=true&only_older=false&include_crossposts=false&meme_filter=false&target_match_percent=${matchPercent}&filter_dead_matches=false&target_days_old=0`;

    const result = await fetch('https://corsproxytest123.herokuapp.com/' + url);

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
    const none = repostCount === 0;
    // prettier formats it incorrectly, someone should open a bug
    // edit: nvm think it's fixed now
    // todo remove above comment
    // prettier-ignore
    // eslint-disable-next-line
    const title = `${(none && 'No') || repostCount} reposts found` + (none&& '' ||
      `, > ${matchPercent}% match, sorted in descending order of similarity`);
    dialog.textContent = title;

    $('#_reposts_dialog').dialog('open');
    // console.log('matches:', matches);

    matches.sort((a, b) => b.match_percent - a.match_percent);

    // separator
    const separator = document.createElement('div');
    separator.style.height = '15px';
    separator.style.border = '1px solid black';
    dialog.appendChild(separator);

    for (const match of matches) {
      const { hamming_match_percent } = match;
      const link = `https://www.reddit.com${match.post.perma_link}`;
      if (
        hamming_match_percent > matchPercent &&
        link !== url &&
        link !== closestMatchUrl
      ) {
        // add to container
        const a = document.createElement('a');
        a.classList.add('repost_url_container');
        a.target = '_blank';
        a.textContent = link;
        a.href = link;
        dialog.appendChild(a);
        ++repostCount;
      }
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
    // console.log('polling...');
    // if (url) {
    //   console.log(
    //     'evaluation: ',
    // eslint-disable-next-line
    //     !url || (location.href !== url && location.href.includes('/comments')),
    //     '!url: ',
    //     !url,
    //     'location.href !== url',
    //     location.href !== url,
    //     'url.includes("/comments")',
    //     location.href.includes('/comments')
    //   );
    // }
    if (
      !url ||
      (location.href !== url && location.href.includes('/comments'))
    ) {
      console.log('reloading now');

      url = location.href;
      await main();
    }
  }, 150);
};
