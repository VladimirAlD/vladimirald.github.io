import './scss/style.scss';
import * as PIXI from 'pixi.js';

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

const formBtn = document.querySelector('.js__btn');
formBtn.addEventListener('click', function (e) {
  preventDefaults(e);
  let formInput = (<HTMLInputElement>document.querySelector('.js__textarea'));
  let rawData: string = formInput.value;
  newGraph(rawData, 6, 10, 0, 15);
});

const graphLegendContainer = document.querySelector('.js__legend');
const graphContainer = document.querySelector('.js__frame');
function newGraph(rawD: string, pathWidth: number, circleRadius: number, paddingTop: number, paddingLeft: number) {
  let commits;
  try {
    commits = normalizeData(rawD).commits
  } catch (e) {
    alert(e)
  }
  sortByTime(commits);
  let related = getRelatedLayout(commits);
  let branches = getBranches(getRelatedLayout(commits));
  let segments = prepareGraph(related, branches, 30, 50, circleRadius, paddingLeft, paddingTop);
  graphContainer.innerHTML = '';
  graphLegendContainer.innerHTML = '';
  addHtml(graphLegendContainer, commits, segments, circleRadius, paddingTop);
  console.log('segments');
  console.log(segments);
  // Create a Pixi Application
  let app = new PIXI.Application({
    width: segments.width,
    height: segments.height,
    antialias: true,
    backgroundAlpha: 0,
    autoDensity: true,
    resolution: window.devicePixelRatio
  });
  app.renderer.plugins.interaction.autoPreventDefault = false;
  app.renderer.view.style.touchAction = 'auto';
  app.stage.x = circleRadius + paddingLeft;
  app.stage.y = circleRadius + paddingTop;
  graphContainer.appendChild(app.view);
  displayGraph(app, segments, pathWidth, circleRadius, commits);
}


function normalizeData(d: string) {
  let data = JSON.parse(d);
  let commits = data.commits;
  let tags = data.tags;
  for (let j = 0; j < commits.length; j++) {
    for (let i = 0; i < tags.length; i++) {
      if (tags[i].commit == commits[j].hash) {
        commits[j].tag = tags[i].tag;
      }
    }
  }
  return data;
}

function timeToSecond(time: string) {
  return new Date(time).getTime();
}

function sortByTime(c) {
  c.sort((a, b) => {
    return (timeToSecond(a.time) - timeToSecond(b.time));
  });
}

function getCommit(commits, hash) {
  for (let i = 0; i < commits.length; i++) {
    if (commits[i].hash == hash) {
      return commits[i];
    }
  }
}

function getRelatedLayout(commits) {
  let relatedLayout = [];
  let lastDispCommit = 0;
  let main = [];
  for (let i = 0; i < commits.length; i++) {
    let prevCommit: number = i - 1 ? i - 1 : 0; // text
    let parentCommit: number[] = getPreviousCommitIndex(commits, commits[i].previous); // text
    relatedLayout[i] = {};
    relatedLayout[i].hash = commits[i].hash;
    relatedLayout[i].x = [1];
    relatedLayout[i].y = i;
    relatedLayout[i].parentCommit = parentCommit;

    if (parentCommit.length <= 1) {
      if (prevCommit == 0 ||
        (parentCommit[0] == prevCommit && parentCommit[0] == main[main.length - 1]) ||
        parentCommit[0] == main[main.length - 1]) {
        main.push(i);
        console.log('push on main' + commits[i].hash);
      } else {
        relatedLayout[i].x.unshift(0);
        if (parentCommit[0] != prevCommit && relatedLayout[i].x.length == relatedLayout[lastDispCommit].x.length) {
          relatedLayout[i].x.unshift(0);
          lastDispCommit = i;
        }
        lastDispCommit = i;
      }
    } else {
      let m: boolean;
      for (let j = 0; j < parentCommit.length; j++) {
        if (parentCommit[j] == prevCommit ||
          parentCommit[j] == main[main.length - 1]) {
          m = true;
        } else {
          m = false;
        }
      }
      for (let k = i - 1; k > main[main.length - 1]; k--) {
        if (main.includes(k)) {
          m = false;
        } else {
          m = true;
        }
      }
      if (m) {
        main.push(i);
      } else {
        relatedLayout[lastDispCommit].x.unshift(0);
        relatedLayout[i].x.unshift(0);
        lastDispCommit = i;
      }
    }

    console.log(main);
    console.log(i);
  }
  return relatedLayout;
}

function getPreviousCommitIndex(commits, prev) {
  let index = [];
  for (let i = 0; i < commits.length; i++) {
    for (let j = 0; j < prev.length; j++) {
      if (prev[j] == commits[i].hash) {
        index.push(i);
      }
    }
  }
  return index;
}

function getBranches(relatedLayout) {
  let branches = [];
  for (let i = 0; i < relatedLayout.length; i++) {
    let hash = relatedLayout[i].hash;
    let x = relatedLayout[i].x;
    let y = relatedLayout[i].y;
    let curBranchIndex = x.length - 1;
    if (!branches[curBranchIndex]) {
      branches[curBranchIndex] = {
        hash: [],
        relatedCommits: [],
        path: []
      };
    }
    branches[curBranchIndex].hash.push(hash);
    branches[curBranchIndex].relatedCommits.push(i);
    branches[curBranchIndex].path.push([x.length, y]);
  }
  connectBranches(branches, relatedLayout);
  return branches;
}

function searchBranchCommit(branch, relatedLayout) {
  let firstBranchCommit = branch.relatedCommits[0];
  let parentCommit = relatedLayout[firstBranchCommit].parentCommit;
  let branchX = relatedLayout[parentCommit[0]].x.length;
  let branchY = relatedLayout[parentCommit[0]].y;
  branch.hash.unshift(relatedLayout[parentCommit[0]].hash);
  branch.relatedCommits.unshift(parentCommit[0]);
  branch.path.unshift([branchX, branchY]);
}

function searchMergeCommit(branches, branch, relatedLayout) {
  for (let k = 0; k < branch.relatedCommits.length; k++) {
    let branchCommit = branch.relatedCommits[k];
    for (let i = 0; i < relatedLayout.length; i++) {
      let parentCommit = relatedLayout[i].parentCommit;
      if (parentCommit.length > 1) {
        if (parentCommit.includes(branch.relatedCommits[branch.relatedCommits.length - 1])) {
          let mergeX = relatedLayout[i].x.length;
          let mergeY = relatedLayout[i].y;
          branch.hash.push(relatedLayout[i].hash);
          branch.relatedCommits.push(i);
          branch.path.push([mergeX, mergeY]);
        } else {
          for (let j = 0; j < parentCommit.length; j++) {
            if (parentCommit[j] == branchCommit && !(branch.relatedCommits.includes(i))) {
              let mergeX = relatedLayout[i].x.length;
              let mergeY = relatedLayout[i].y;
              let newBranch = {
                hash: [],
                commits: [],
                relatedCommits: [],
                path: []
              };
              newBranch.hash = branch.hash.slice(0, k + 1);
              newBranch.commits = branch.relatedCommits.slice(0, k + 1);
              newBranch.path = branch.path.slice(0, k + 1);
              newBranch.hash.push(relatedLayout[i].hash);
              newBranch.relatedCommits.push(i);
              newBranch.path.push([mergeX, mergeY]);
              branches.push(newBranch);
            }
          }
        }
      }
    }
  }
}

function connectBranches(branches, relatedLayout) {
  for (let i = 1; i < branches.length; i++) {
    if (branches[i].path.length == 1 || branches[i].path[0][0] == branches[i].path[1][0]) {
      searchBranchCommit(branches[i], relatedLayout);
    }
    searchMergeCommit(branches, branches[i], relatedLayout);
  }
}

// ********************  Display  ********************

function prepareGraph(related, branches, hor: number, vert: number, circleRadius: number, paddingLeft: number, paddingTop: number) {
  let graph = {
    width: 0,
    height: 0,
    hashY: [],
    commitsY: [],
    brCommits: [],
    brPaths: []
  };
  graph.width = hor * (branches.length - 1) + 2 * (circleRadius + paddingLeft);
  graph.height = vert * (related.length - 1) + 2 * (circleRadius + paddingTop);
  for (let k = 0; k < related.length; k++) {
    graph.hashY.push(related[k].hash);
    graph.commitsY.push(related[related.length - 1 - k].y * vert);
  }
  for (let i = 0; i < branches.length; i++) {
    let path = branches[i].path;
    graph.brCommits[i] = [];
    path.forEach((v, n, a) => {
      let x = a[a.length - 1 - n][0] - 1;
      let y = related.length - a[a.length - 1 - n][1] - 1;
      graph.brCommits[i].push([x * hor, y * vert]);
    });
  }
  graph.brPaths = JSON.parse(JSON.stringify(graph.brCommits));
  for (let j = 1; j < graph.brPaths.length; j++) {
    roundPath(graph.brPaths[j]);
  }
  return graph;
}

function roundPath(path) {
  let entryPoint = [path[path.length - 2][0], path[path.length - 1][1]];
  path.splice((path.length - 1), 0, entryPoint);
  if (path[1][0] != path[0][0]) {
    let exitPoint = [path[1][0], path[0][1]];
    path.splice(1, 0, exitPoint);
  }
}

function addHtml(container, commits, segments, circleRadius: number, paddingTop: number) {
  for (let i = 0; i < segments.commitsY.length; i++) {
    let item = document.createElement('li');
    item.classList.add('legend__item');
    for (let j = 0; j < commits.length; j++) {
      if (commits[j].hash == segments.hashY[i]) {
        item.innerHTML += commits[j].text;
        if (commits[j].tag) {
          item.innerHTML += `<span class='legend__tag'>${commits[j].tag}</span>`;
        }
      }
    }
    item.style.top = `${segments.commitsY[i] + circleRadius + paddingTop}px`;
    container.append(item);
  }
}

function getRandomColor(): string {
  let letters = '0123456789ABCDEF'.split('');
  let color = '0x';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.round(Math.random() * 15)];
  }
  return color;
}

function drawCircle(app, pos, color, size, segments, commits) {
  let graphics: any = new PIXI.Graphics();
  graphics.beginFill(color);
  graphics.drawCircle(pos[0], pos[1], size, segments, commits);
  graphics.endFill();

  graphics.interactive = true;
  graphics.buttonMode = true;

  graphics.hitArea = new PIXI.Circle(pos[0], pos[1], size);
  graphics.on('mousedown', (event) => onMouseDown(graphics, segments, commits));
  graphics.on('touchstart', (event) => onTouchStart(graphics, segments, commits));
  graphics.on('touchend', (event) => onTouchendOutside(graphics));
  graphics.on('pointerover', (event) => onPointerOver(graphics));
  graphics.on('pointerout', (event) => onPointerOut(graphics));
  
  app.stage.addChild(graphics);
}

function onMouseDown(object, segments, commits) {
  object.tint = 0xC42031;
  displayCommitInfo(object, segments, commits);
}
function onTouchStart(object, segments, commits) {
  displayCommitInfo(object, segments, commits);
  object.tint = 0xC42031;
}
function onTouchendOutside(object) {
  object.tint = 0xFFFFFF;
}
function onPointerOver(object) {
  object.tint = 0xC42031;
}
function onPointerOut(object) {
  object.tint = 0xFFFFFF;
}

function displayCommitInfo(object, segments, commits) {
  let commitInfoContainer = document.querySelector('.js__info');
  let hash = getDisplayedCommitHash(segments, object.hitArea.y);
  let commit = getCommit(commits, hash);
  commitInfoContainer.innerHTML = '';
  for (let key in commit) {
    commitInfoContainer.innerHTML += `
    <dl class='commit'>
    <dt class='commit__term'>${key}:</dt>
    <dd class='commit__def'>${commit[key]}</dd>
    </dl>`;
  }
}

function getDisplayedCommitHash(segments, hitY): string {
  for (let i = 0; i < segments.commitsY.length; i++) {
    if (hitY == segments.commitsY[i]) {
      return segments.hashY[i];
    }
  }
}

function displayGraph(app, segments, pathWidth: number, circleRadius: number, commits) {
  for (let i = 0; i < segments.brPaths.length; i++) {
    let color: string = getRandomColor();
    let graphics: any = new PIXI.Graphics();
    graphics.lineStyle({
      width: pathWidth,
      color: color,
      alignment: 0.5,
      alpha: 1,
      join: 'round',
    });
    
    graphics.moveTo(segments.brPaths[i][0][0], segments.brPaths[i][0][1]);
    for (let j = 0; j < segments.brPaths[i].length; j++) {
      graphics.lineTo(segments.brPaths[i][j][0], segments.brPaths[i][j][1]);
    }
    app.stage.addChild(graphics);
    for (let k = 0; k < segments.brCommits[i].length; k++) {
      drawCircle(app, segments.brCommits[i][k], color, circleRadius, segments, commits);
    }
  }
}