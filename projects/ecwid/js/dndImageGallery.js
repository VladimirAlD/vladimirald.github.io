'use strict';
var inputUrl = document.querySelector('#uploadUrl');
var downBtn = document.querySelector('#uploadUrlSubmit');
var dndArea = {
  dropbox: document.querySelector('.js__drop'),
  events: ['dragenter', 'dragleave', 'dragover', 'drop'],
  highlight: function () {
    dndArea.dropbox.classList.add('dnd-area--hl');
  },
  unhighlight: function () {
    dndArea.dropbox.classList.remove('dnd-area--hl');
  },
  handleDrop: function (e) {
    var dt = e.dataTransfer;
    var files = dt.files;
    dndArea.handleFiles(files);
  },
  handleFiles: function (files) {
    var filesArray = Array.prototype.slice.call(files);
    filesArray.forEach(dndArea.previewFile);
  },
  previewFile: function (file) {
    var reader = new FileReader();
    if (file.type.match('image/*')) {
      reader.readAsDataURL(file);
      reader.onloadend = function () {
        dndArea.getImg(reader.result);
      };
    } else {
      reader.readAsText(file);
      reader.onloadend = function () {
        try {
          var data = JSON.parse(reader.result);
          var gallery = data.galleryImages;
          for (var i = 0; i < gallery.length; i++) {
            dndArea.getImg(gallery[i].url, gallery[i]);
          }
        } catch (e) {
          alert('Файл должен быть изображением или json-файлом со структорой \n { "galleryImages" : [ {url: *, width: *, height: *}, ... ] }');
          console.log(e);
        }
      };
    }
  },
  getImg: function (src, isJsonItem) {
    isJsonItem = isJsonItem || false;
    var img = document.createElement('img');
    img.src = src;
    img.onload = function () {
      if (!isJsonItem) {
        // console.log(`Изображение загружено, размеры ${img.width} x ${img.height}`); // exclude ie
        getSizes(img);
      } else {
        getSizes(isJsonItem);
      }
      dndArea.imgInsert(document.querySelector('.gallery'), img);
      masonry.initLayout();
    };
    img.onerror = function () {
      console.log("Ошибка во время загрузки изображения");
      alert('Ошибка во время загрузки, попробуйте другое изображение');
    };
  },
  imgInsert: function (list, img) {
    // ie dont support multiple classes added and string interpolation
    var listItem = document.createElement('li');
    listItem.classList.add('gallery__item');
    listItem.appendChild(img);
    var deleteBtn = document.createElement('button');
    deleteBtn.classList.add('gallery__delete-btn');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.classList.add('js__deleteItem');
    listItem.appendChild(deleteBtn);
    list.appendChild(listItem);
  }
};

function getSizes(img) {
  var n = Object.keys(masonry.imgsData).length;
  masonry.imgsData[n] = {
    width: img.width,
    height: img.height
  };
  masonry.resizedImgsData[n] = {
    width: Math.floor(masonry.imgsData[n].width * (masonry.minH / masonry.imgsData[n].height)),
    height: masonry.minH,
  };
}

// ************************ MASONRY ************************

var masonry = {
  imgsContainer: document.querySelector('.gallery'),
  minH: 150, // min height image in row
  gap: 10, // margin beetwen row and images
  imgsData: [], // [i].width|height | recieve after ever upload file
  resizedImgsData: [], // [i].width|minH | with save aspect ratio
  items: document.querySelector('.gallery').getElementsByTagName('li'), // return HTMLCollection, autoupdated,s
  getLayout: function () {
    var layout = {
      imgsContainerWidth: parseFloat(window.getComputedStyle(masonry.imgsContainer).width) - 0.01, // fix FireFox,
      rowWidth: [], // width images in row
      avWidth: [],
      // available space in container for widening image 
      // ( containerWidth - ( (img + gap) * number ) )
      imgsInRow: []
      // index last image in row
      // last image in layout has last index in imgsInRow 
      // [3, 4] => firstRow: 0, 1, 2; secondRow(lastRow): 3, 4
    };
    var availableContainerWidth = layout.imgsContainerWidth;
    var totalRowWitdh = 0;
    for (var i = 0; i < Object.keys(masonry.imgsData).length; i++) {
      totalRowWitdh += masonry.resizedImgsData[i].width;
      if (totalRowWitdh < availableContainerWidth) {
        availableContainerWidth -= masonry.gap;
      } else if (totalRowWitdh == masonry.resizedImgsData[i].width) {
        // true if total consist one image
        layout.rowWidth.push(layout.imgsContainerWidth);
        layout.avWidth.push(layout.imgsContainerWidth);
        layout.imgsInRow.push(i + 1);
        totalRowWitdh = 0;
      } else {
        layout.rowWidth.push(totalRowWitdh - masonry.resizedImgsData[i].width);
        layout.avWidth.push(availableContainerWidth + masonry.gap);
        layout.imgsInRow.push(i);
        totalRowWitdh = 0;
        availableContainerWidth = layout.imgsContainerWidth;
        i--;
      }
      // last image
      if (i == Object.keys(masonry.imgsData).length - 1) {
        layout.rowWidth.push(totalRowWitdh);
        layout.avWidth.push(availableContainerWidth + masonry.gap);
        layout.imgsInRow.push(i);
      }
    }
    return layout;
  },
  setSizes: function (i, w, h, r) {
    masonry.items[i].style.height = h + 'px';
    masonry.items[i].style.width = w * r + 'px';
    masonry.items[i].style.marginBottom = masonry.gap + 'px';
    masonry.items[i].style.marginRight = masonry.gap + 'px';
    // height and objectFit for image that dont cover items[i]-container
    if (h == masonry.minH) {
      masonry.items[i].querySelector('img').style.height = 100 + '%';
      masonry.items[i].querySelector('img').style.objectFit = 'cover';
    }
    if (masonry.items[i].querySelector('img').height < parseFloat(window.getComputedStyle(masonry.items[i]).height)) {
      masonry.items[i].querySelector('img').style.height = 100 + '%';
      masonry.items[i].querySelector('img').style.objectFit = 'cover';
    }
  },
  setLayout: function (layout, fillLastRow) {
    fillLastRow = fillLastRow || false;
    for (var i = 0; i < layout.imgsInRow.length - 1; i++) {
      var r = layout.avWidth[i] / layout.rowWidth[i];
      var ht = Math.floor(masonry.minH * r);
      for (var j = layout.imgsInRow[i - 1] ? layout.imgsInRow[i - 1] : 0; j <= layout.imgsInRow[i]; j++) {
        if (masonry.resizedImgsData[j].width >= layout.imgsContainerWidth) {
          masonry.setSizes(j, layout.imgsContainerWidth, masonry.minH, 1);
        } else {
          masonry.setSizes(j, masonry.resizedImgsData[j].width, ht, r);
        }
        if (j + 1 == layout.imgsInRow[i]) {
          masonry.items[j].style.marginRight = 0;
        }
      }
    }
    masonry.lastRow(layout, fillLastRow);
  },
  lastRow: function (layout, fill) {
    // fill: true - if need fill last row
    fill = fill || false;
    var lastIndex = layout.imgsInRow.length - 1;
    var r = layout.avWidth[lastIndex] / layout.rowWidth[lastIndex];
    var ht = Math.floor(masonry.minH * r);
    for (var j = layout.imgsInRow[lastIndex - 1] ?
        layout.imgsInRow[lastIndex - 1] : 0; j <= layout.imgsInRow[lastIndex]; j++) {
      if (fill) {
        masonry.setSizes(j, masonry.resizedImgsData[j].width, ht, r);
      } else {
        masonry.setSizes(j, masonry.resizedImgsData[j].width, masonry.minH, 1);
      }
      if (j == layout.imgsInRow[lastIndex]) {
        masonry.items[j].style.marginRight = 0;
      }
    }
  },
  deleteAndUpdate: function () {
    // Create Element.remove() function if not exist | IE fix
    if (!('remove' in Element.prototype)) {
      Element.prototype.remove = function () {
        if (this.parentNode) {
          this.parentNode.removeChild(this);
        }
      };
    }
    masonry.imgsContainer.addEventListener('click', function (event) {
      var deleteBtns = document.querySelectorAll('.js__deleteItem');
      var btnsArray = Array.prototype.slice.call(deleteBtns); // ie fix
      var target = event.target;

      if (target && target.classList.contains('js__deleteItem')) {
        btnsArray.forEach(function (v, i) {
          if (target == v) {
            masonry.imgsData.splice(i, 1);
            masonry.resizedImgsData.splice(i, 1);
            v.parentNode.remove();
            masonry.initLayout();
          }
        });
      }
    });
  },
  initLayout: function (fillLastRow) {
    // lastRow: true - if need fill last row
    fillLastRow = fillLastRow || false;
    masonry.setLayout(masonry.getLayout(), fillLastRow);
    masonry.deleteAndUpdate();
  }
};

// ************************ END MASONRY ************************

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

downBtn.addEventListener('click', function (e) {
  preventDefaults(e);
  var imgUrl = dndArea.getImg(document.querySelector('#uploadUrl').value);
  if (imgUrl) {
    dndArea.imgInsert(document.querySelector('.gallery'), imgUrl);
  }
}, false);

dndArea.events.forEach(function (eventName) {
  dndArea.dropbox.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(function (eventName) {
  dndArea.dropbox.addEventListener(eventName, dndArea.highlight, false);
});

['dragleave', 'drop'].forEach(function (eventName) {
  dndArea.dropbox.addEventListener(eventName, dndArea.unhighlight, false);
});

dndArea.dropbox.addEventListener('drop', dndArea.handleDrop, false);

window.addEventListener("load", function (event) {
  if (masonry.items) {
    for (var i = 0; i < masonry.items.length; i++) {
      getSizes(masonry.items[i].querySelector('img'));
    }
    masonry.initLayout();
  }
  // fix resize from navigation chrome bar
  var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  window.addEventListener('resize', function () {
    if (width != (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)) {
      width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      masonry.initLayout();
    }
  });
});