'use strict';
var inputUrl = document.querySelector('#uploadUrl');
var downBtn = document.querySelector('#uploadUrlSubmit');
var dropbox = document.querySelector('.js__drop');
var events = ['dragenter', 'dragleave', 'dragover', 'drop'];

downBtn.addEventListener('click', function () {
  preventDefaults;
  imgInsert(document.querySelector('.gallery'), getImg(document.querySelector('#uploadUrl').value));
}, false);

events.forEach(function (eventName) {
  dropbox.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
};

['dragenter', 'dragover'].forEach(function (eventName) {
  dropbox.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(function (eventName) {
  dropbox.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
  dropbox.classList.add('dnd-area--hl');
};

function unhighlight(e) {
  dropbox.classList.remove('dnd-area--hl');
};

dropbox.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  var dt = e.dataTransfer;
  var files = dt.files;
  handleFiles(files);
};

function handleFiles(files) {
  var filesArray = Array.prototype.slice.call(files);
  filesArray.forEach(previewFile);
}

function previewFile(file) {
  var reader = new FileReader();
  if (file.type.match('image/*')) {
    reader.readAsDataURL(file);
    reader.onloadend = function () {
      getImg(reader.result);
    };
  } else {
    reader.readAsText(file);
    reader.onloadend = function () {
      try {
        var data = JSON.parse(reader.result);
        var gallery = data.galleryImages;
        for (var i = 0; i < gallery.length; i++) {
          getImg(gallery[i].url, gallery[i]);
        };
      } catch (e) {
        alert('File must be .json extension or image');
        console.log(e);
      };
    };
  };
}


function getImg(src, jsonItem) {
  jsonItem = jsonItem || false;
  var img = document.createElement('img');
  img.src = src;
  img.onload = function () {
    if (!jsonItem) {
      // console.log(`Изображение загружено, размеры ${img.width} x ${img.height}`);
      getSizes(img);
    } else {
      getSizes(jsonItem);
    };
    imgInsert(document.querySelector('.gallery'), img);
    initLayout();
  };
  img.onerror = function () {
    console.log("Ошибка во время загрузки изображения");
  };
  // return img;
}

function getSizes(img) {
  var n = Object.keys(imgsData).length;
  imgsData[n] = {
    width: img.width,
    height: img.height
  };
  resizedImgsData[n] = {
    width: Math.floor(imgsData[n].width * (minH / imgsData[n].height)),
    height: minH,
  };
}

function imgInsert(list, img) {
  var listItem = document.createElement('li');
  listItem.classList.add('gallery__item');
  listItem.appendChild(img);
  var deleteBtn = document.createElement('button');
  // ie dont support multiple classes added
  deleteBtn.classList.add('gallery__delete-btn');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.classList.add('js__deleteItem');
  listItem.appendChild(deleteBtn);
  list.appendChild(listItem);
}


// ************************ MASONRY ************************
var imgsContainer = document.querySelector('.gallery');
var minH = 150; // min height image in row
var gap = 10; // margin beetwen row and images
var imgsData = []; // [i].width|height | recieve after ever upload file
var resizedImgsData = []; // [i].width|minH | with save aspect ratio
var items = imgsContainer.getElementsByTagName('li'); // return HTMLCollection, autoupdated


function getLayout() {
  var layout = {
    imgsContainerWidth: parseFloat(window.getComputedStyle(imgsContainer).width) - 0.01, // fix FireFox,
    rowWidth: [], // width images in row
    avWidth: [], // available space in container for widening image | ( containerWidth - ( (img + gap) * number ) )
    imgsInRow: [] // index last image in row | last image in layout has last index in imgsInRow | [3, 4] => firstRow: 0, 1, 2; secondRow(lastRow): 3, 4
  };
  var availableContainerWidth = layout.imgsContainerWidth;
  var totalRowWitdh = 0;
  for (var i = 0; i < Object.keys(imgsData).length; i++) {
    totalRowWitdh += resizedImgsData[i].width;
    if (totalRowWitdh < availableContainerWidth) {
      availableContainerWidth -= gap;
    } else if (totalRowWitdh == resizedImgsData[i].width) {
      // true if total consist one image
      layout.rowWidth.push(layout.imgsContainerWidth);
      layout.avWidth.push(layout.imgsContainerWidth);
      layout.imgsInRow.push(i + 1);
      totalRowWitdh = 0;
    } else {
      layout.rowWidth.push(totalRowWitdh - resizedImgsData[i].width);
      layout.avWidth.push(availableContainerWidth + gap);
      layout.imgsInRow.push(i);
      totalRowWitdh = 0;
      availableContainerWidth = layout.imgsContainerWidth;
      i--;
    };
    // last image
    if (i == Object.keys(imgsData).length - 1) {
      layout.rowWidth.push(totalRowWitdh);
      layout.avWidth.push(availableContainerWidth + gap);
      layout.imgsInRow.push(i);
    };
  };
  return layout;
}

function setSizes(i, w, h, r) {
  items[i].style.height = h + 'px';
  items[i].style.width = w * r + 'px';
  items[i].style.marginBottom = gap + 'px';
  items[i].style.marginRight = gap + 'px';
  // height and objectFit for image that dont cover items[i]-container
  if (h == minH) {
    items[i].querySelector('img').style.height = 100 + '%';
    items[i].querySelector('img').style.objectFit = 'cover';
  }
  if (items[i].querySelector('img').height < parseFloat(window.getComputedStyle(items[i]).height)) {
    items[i].querySelector('img').style.height = 100 + '%';
    items[i].querySelector('img').style.objectFit = 'cover';
  }
}

function setLayout(layout, fill) {
  var fill = fill || false;
  for (var i = 0; i < layout.imgsInRow.length - 1; i++) {
    var r = layout.avWidth[i] / layout.rowWidth[i];
    var ht = Math.floor(minH * r);
    for (var j = layout.imgsInRow[i - 1] ? layout.imgsInRow[i - 1] : 0; j <= layout.imgsInRow[i]; j++) {
      if (resizedImgsData[j].width >= layout.imgsContainerWidth) {
        setSizes(j, layout.imgsContainerWidth, minH, 1);
      } else {
        setSizes(j, resizedImgsData[j].width, ht, r);
      }
      if (j + 1 == layout.imgsInRow[i]) {
        items[j].style.marginRight = 0;
      };
    };
  };
  lastRow(layout, fill);
}

function lastRow(layout, fill) {
  // fill: true - if need fill last row
  var fill = fill || false;
  var lastIndex = layout.imgsInRow.length - 1;
  var r = layout.avWidth[lastIndex] / layout.rowWidth[lastIndex];
  var ht = Math.floor(minH * r);
  for (var j = layout.imgsInRow[lastIndex - 1] ? layout.imgsInRow[lastIndex - 1] : 0; j <= layout.imgsInRow[lastIndex]; j++) {
    if (fill) {
      setSizes(j, resizedImgsData[j].width, ht, r);
    } else {
      setSizes(j, resizedImgsData[j].width, minH, 1);
    };
    if (j == layout.imgsInRow[lastIndex]) {
      items[j].style.marginRight = 0;
    };
  };
}

function deleteAndUpdate() {
  // Create Element.remove() function if not exist | IE fix
  if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function () {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    };
  }
  var deleteBtns = document.querySelectorAll('.js__deleteItem');
  var btnsArray = Array.prototype.slice.call(deleteBtns);
  btnsArray.forEach(function (el) {
    el.onclick = function () {
      for (var i = 0; i < document.querySelectorAll('.gallery__item img').length; i++) {
        if (el.parentNode.querySelector('img').src == document.querySelectorAll('.gallery__item img')[i].src) {
          break;
        };
      };
      imgsData.splice(i, 1);
      resizedImgsData.splice(i, 1);
      el.parentNode.remove();
      initLayout();
    };
  });
};

function initLayout(lastRow) {
  // lastRow: true - if need fill last row
  var lastRow = lastRow || false;
  setLayout(getLayout(), lastRow);
  deleteAndUpdate();
}

window.addEventListener("load", function (event) {
  if (items) {
    for (var i = 0; i < items.length; i++) {
      getSizes(items[i].querySelector('img'));
    }
    initLayout();
  }
  // fix resize from navigation chrome bar
  var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  window.addEventListener('resize', function () {
    if (width != (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)) {
      width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      initLayout();
    }
  });
});