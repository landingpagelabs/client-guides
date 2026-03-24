/* ============================================================
   Landing Page Labs — Client Guide Render Engine
   ============================================================ */

(async function () {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const contentEl = document.getElementById('guideContent');

  /* ---------- Extract slug from URL ---------- */
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const slug = path.split('/').pop();

  if (!slug) {
    showError();
    return;
  }

  /* ---------- Fetch guide data ---------- */
  let data;
  try {
    const res = await fetch('/guides/' + slug + '.json');
    if (!res.ok) throw new Error('Not found');
    data = await res.json();
  } catch (e) {
    showError();
    return;
  }

  /* ---------- Render ---------- */
  render(data);

  function showError() {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'flex';
  }

  function render(d) {
    // Page title
    document.title = d.title + ' — Landing Page Labs';

    // Hero
    document.getElementById('guideTitle').textContent = d.title;

    // Intro box
    document.getElementById('introText').textContent = d.intro.text;

    const bulletsEl = document.getElementById('introBullets');
    if (d.intro.bullets && d.intro.bullets.length > 0) {
      d.intro.bullets.forEach(function (b) {
        var li = document.createElement('li');
        li.textContent = b;
        bulletsEl.appendChild(li);
      });
    } else {
      bulletsEl.style.display = 'none';
    }

    // Prerequisites
    if (d.prerequisites && d.prerequisites.length > 0) {
      var prereqSection = document.getElementById('introPrereqs');
      prereqSection.style.display = 'block';
      var prereqList = document.getElementById('prereqList');
      d.prerequisites.forEach(function (p) {
        var li = document.createElement('li');
        li.textContent = p;
        prereqList.appendChild(li);
      });
    }

    // Estimated time
    if (d.estimatedTime) {
      var timeEl = document.getElementById('introTime');
      timeEl.style.display = 'block';
      timeEl.textContent = 'Estimated time: ' + d.estimatedTime;
    }

    // Help text (supports HTML for links)
    document.getElementById('introHelp').innerHTML = d.intro.helpText;

    // Sections & steps
    var container = document.getElementById('stepsContainer');
    d.sections.forEach(function (section) {
      // Section heading (for multi-section guides)
      if (section.heading) {
        var headingDiv = document.createElement('div');
        headingDiv.className = 'section-heading';
        var h2 = document.createElement('h2');
        h2.className = 'section-heading__title';
        h2.textContent = section.heading;
        headingDiv.appendChild(h2);

        // Section description (context block)
        if (section.description) {
          var descDiv = document.createElement('div');
          descDiv.className = 'section-heading__description';
          descDiv.innerHTML = section.description;
          headingDiv.appendChild(descDiv);
        }

        container.appendChild(headingDiv);
      }

      section.steps.forEach(function (step, idx) {
        var card = document.createElement('div');
        card.className = 'step';

        // If first step after a section heading, remove top margin/radius
        if (section.heading && idx === 0) {
          card.classList.add('step--first-in-section');
        }

        // Final step styling
        if (step.isFinal) {
          card.classList.add('step--final');
        }

        // Step label
        var label = document.createElement('div');
        label.className = 'step__label';
        label.textContent = step.label;
        card.appendChild(label);

        // Step title
        var title = document.createElement('h3');
        title.className = 'step__title';
        title.textContent = step.title;
        card.appendChild(title);

        // Description
        if (step.description) {
          var desc = document.createElement('p');
          desc.className = 'step__description';
          desc.innerHTML = step.description;
          card.appendChild(desc);
        }

        // Bullets
        if (step.bullets && step.bullets.length > 0) {
          var ul = document.createElement('ul');
          ul.className = 'step__bullets';
          step.bullets.forEach(function (b) {
            var li = document.createElement('li');
            li.textContent = b;
            ul.appendChild(li);
          });
          card.appendChild(ul);
        }

        // DNS Records (table-style cards)
        if (step.records && step.records.length > 0) {
          var recordsDiv = document.createElement('div');
          recordsDiv.className = 'step__records';
          step.records.forEach(function (rec) {
            var recCard = document.createElement('div');
            recCard.className = 'record-card';
            Object.keys(rec).forEach(function (key) {
              var row = document.createElement('div');
              row.className = 'record-card__row';
              var labelSpan = document.createElement('span');
              labelSpan.className = 'record-card__label';
              labelSpan.textContent = key + ':';
              var valueSpan = document.createElement('span');
              valueSpan.className = 'record-card__value';
              // Wrap values in code tags for technical fields
              if (key === 'Name' || key === 'Value') {
                var code = document.createElement('code');
                code.textContent = rec[key];
                valueSpan.appendChild(code);
              } else {
                valueSpan.textContent = rec[key];
              }
              row.appendChild(labelSpan);
              row.appendChild(valueSpan);
              recCard.appendChild(row);
            });
            recordsDiv.appendChild(recCard);
          });
          card.appendChild(recordsDiv);
        }

        // Screenshot image
        if (step.imageUrl) {
          var imgWrap = document.createElement('div');
          imgWrap.className = 'step__image';
          var img = document.createElement('img');
          img.src = step.imageUrl;
          img.alt = step.title;
          img.loading = 'lazy';
          imgWrap.appendChild(img);
          card.appendChild(imgWrap);
        }

        container.appendChild(card);
      });
    });

    // Show content, hide loading
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';
  }
})();
