let pageIndex = 1;
const apiKey = "AIzaSyBwS62TXNIAA-Vd8ugI37SqCF-ufKZkTH4";
const searchEngine = "004454903040586447587:mcbiyslmklm";
const fileStackKey = "AZsJYneAlQHaIFvTl3T9ez";

let imgURLs = new Array();
let selectedImg;
let tool_status = "";
$(document).ready(function () {
  $('#imageResult').html('');
});

function getImgBySearch() {
  $('#imageResult').html('');
  imgURLs.length = 0;
  let search_word = $("#searchWord").val();
  if (!search_word) {
    alert("검색어를 입력해주세요!");
    return;
  }
  $.ajax({
    type: 'GET',
    url: 'https://www.googleapis.com/customsearch/v1?key=' + apiKey
      + '&cx=' + searchEngine
      + '&q=' + search_word
      + '&start=' + pageIndex,
    data: {},
    success: function (response) {
      if (response['kind'] == "customsearch#search") {
        let items = response['items'];
        for (let item of items) {
          let cse_image = item['pagemap']['cse_image'];
          if (!cse_image) continue;
          if (!checkUrlForm(cse_image[0]['src'])) continue;
          let imgSrc = "'" + cse_image[0]['src'] + "'";
          drawImgHTML("#imageResult", imgURLs.length, imgSrc);
          imgURLs.push(cse_image[0]['src']);


        }
      }
    }
  })
}

function checkUrlForm(strUrl) {
  var expUrl = /^http[s]?\:\/\//i;
  return expUrl.test(strUrl);
}

function drawImgHTML(toolHandler, index, url) {

  let index_ap =
    $(toolHandler).append(
      '<div data-layout="al8 de3">\
      <figure>\
      <img src = ' + url + ' alt="" data-theme="_is2" style="cursor: pointer" onClick = "clickToIMG(' + index + ')">\
      </figure>\
  </div>'
    )
}

function enterKey() {
  if (event.keyCode == 13) {
    getImgBySearch();
  }
}

function openAndClose() {
  if ($('#imageResult').is(':visible')) {
    $('#imageResult').hide();
    $('#paper').text('▼ 검색결과 열기');
  }
  else {
    $('#imageResult').show();
    $('#paper').text('▶ 검색결과 닫기');
  }
}

function clickToIMG(index) {
  drawOrgImg(imgURLs[index]);
  openAndClose();
  selectedImg = index;
}

function drawOrgImg(imgUrl) {
  $('#orgImg').html('');
  $('#orgImg').append(
    '<figure>\
        <img src='+ imgUrl + ' alt="" id = "original_image" data-theme="_is2">\
      </figure>'
  );
}

function isNumber(id) {
  if (event.keyCode < 48 || event.keyCode > 57) {
    event.returnValue = false;
  }
}

function crop() {
  //let imgUrl = $('#original_image').attr("src");
  $('#tool_content').html('');
  tool_status = "crop";
  drawNumTool("x", "crop_x");
  drawNumTool("y", "crop_y");
  drawNumTool("width", "crop_width");
  drawNumTool("height", "crop_height");

  $("#crop_x").attr({ type: "number", min: "0", max: "1000000", value: "0" });
  $("#crop_y").attr({ type: "number", min: "0", max: "1000000", value: "0" });
  $("#crop_width").attr({ type: "number", min: "0", max: "1000000", value: "0" });
  $("#crop_height").attr({ type: "number", min: "0", max: "1000000", value: "0" });
}

function rotate() {
  $('#tool_content').html('');
  tool_status = "rotate";
  drawNumTool("회전 각도", "rotate_x");
  $("#rotate_x").attr({ type: "number", min: "0", max: "356", value: "0" });
}

function rounded_corners() {
  $('#tool_content').html('');
  tool_status = "rounded_corners";
  drawNumTool("둥근 수치", "rounded_corners_r");
  drawNumTool("흐림 수치", "rounded_corners_b");

  $("#rounded_corners_r").attr({ type: "number", min: "0", max: "10000", value: "0" });
  $("#rounded_corners_b").attr({ type: "number", min: "0", max: "200", value: "0" });
}

function vignette() {
  $('#tool_content').html('');
  tool_status = "vignette";
  drawNumTool("어두운 수치", "vignette_a");
  $("#vignette_a").attr({ type: "number", min: "0", max: "100", value: "0" });
}


function drawNumTool(name, id) {

  $("#tool_content").append(
    '<div class="input-group  input-group-sm mb-3 " >\
      <div class="input-group-prepend">\
        <span class="input-group-text" >' + name + '</span>\
         </div>\
          <input type="text" class="form-control" aria-label="Username"\
          id="'+ id +
    '"aria-describedby="basic-addon1">\
    </div>');
}


function isRangedNumber(val, minVal, maxVal) {
  if (minVal > val || val > maxVal) {
    alert(minVal + " ~ " + maxVal + "값만 입력해주세요");
    return false;
  }
  return true;
}

function modifyImage() {
  let minVal = 0;
  let maxVal = 1000000;

  function drawModifiedImg(modifiedImgUrl) {
    console.log(modifiedImgUrl)
    $('#modImg').html('');
    $('#modImg').append(
      '<figure>\
        <img src='+ modifiedImgUrl + ' alt="" id = "original_image" data-theme="_is2">\
      </figure>'
    );
  }

  switch (tool_status) {
    case "crop":

      if (
        isRangedNumber($("#crop_x").val(), minVal, maxVal) &
        isRangedNumber($("#crop_y").val(), minVal, maxVal) &
        isRangedNumber($("#crop_width").val(), minVal, maxVal) &
        isRangedNumber($("#crop_height").val(), minVal, maxVal)) {
        alert("얍!");
        drawModifiedImg(
          "https://cdn.filestackcontent.com/"+
          fileStackKey +
          "/crop=dim:["+ $("#crop_x").val() + "," + $("#crop_y").val() + "," + $("#crop_width").val() + "," + $("#crop_height").val() + "]/"+
          imgURLs[selectedImg]
        )
      }



      break;

    case "rotate":
      maxVal = 359;
      if (isRangedNumber($("#rotate_x").val(), minVal, maxVal)) {
        alert("rotate");
      }

      break;
    case rounded_corners:
      if (isRangedNumber($("#rounded_corners_r").val(), minVal, 10000) &
        isRangedNumber($("#rounded_corners_b").val(), minVal, 200)) {
        // rounded_corners_b 값은 10으로 나눠주어야함.
        alert("rounded_corners");
      }
    default:
      break;
  }
}
