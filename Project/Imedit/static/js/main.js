let pageIndex = 1;
const apiKey = "AIzaSyBwS62TXNIAA-Vd8ugI37SqCF-ufKZkTH4";
const searchEngine = "004454903040586447587:mcbiyslmklm";
const fileStackKey = "AZsJYneAlQHaIFvTl3T9ez";

let imgURLs = new Array();
let keyword;
let selectedImg;
let tool_status = "";

$(document).ready(function () {
  $('#imageResult').hide();
  $("#edit_box").hide();

  showRankedKeyword();
});

function getImgBySearch() {

  imgURLs.length = 0;
  keyword = $("#searchWord").val();
  if (!keyword) {
    alert("검색어를 입력해주세요!");
    return;
  }


  getPictureByCGS();

  countKeyword();

  function countKeyword() {
    $.ajax({
      type: 'POST',
      url: '/rank',
      data: { gKeyword: keyword },
      success: function (response) {
        showRankedKeyword();
      }
    })
  }
}

function getPictureByCGS() {

  function checkUrlForm(strUrl) {
    var expUrl = /^http[s]?\:\/\//i;
    return expUrl.test(strUrl);
  }
  
  $('#imageResult').html('');

  $.ajax({
    type: 'GET',
    url: 'https://www.googleapis.com/customsearch/v1?key=' + apiKey
      + '&cx=' + searchEngine
      + '&q=' + keyword
      + '&start=' + pageIndex,
    data: {},
    success: function (response) {
      if (response['kind'] == "customsearch#search") {
        console.log('https://www.googleapis.com/customsearch/v1?key=' + apiKey
        + '&cx=' + searchEngine
        + '&q=' + keyword
        + '&start=' + pageIndex);

        let items = response['items'];
        let drawImgCnt = 0;
        for (let item of items) {
          if(!(item['pagemap'])) continue;
          if (!(item['pagemap']['cse_image'])) continue;
          let cse_image = item['pagemap']['cse_image'];
          if (!checkUrlForm(cse_image[0]['src'])) continue;
          let imgSrc = "'" + cse_image[0]['src'] + "'";
          drawImgHTML("#imageResult", imgURLs.length, imgSrc);
          imgURLs.push(cse_image[0]['src']);
          drawImgCnt = drawImgCnt + 1;
        }

        for(;drawImgCnt< 10; drawImgCnt++)
        {
          drawImgHTML("#imageResult",undefined,undefined);
        }
        openKeywordResult(true);
        drawPreNextPageBtn();
      }
    }
  })
}

function showRankedKeyword() {
  $.ajax({
    type: 'GET',
    url: '/rank',
    data: {},
    success: function (response) {
      if (response['result'] == 'success') {
        let rank_text = '가장 많이 찾은 검색어 : ';
        let keywords = response['keywords'];
        let maxSize = 10;
        if (keywords.length < 10) maxSize = keywords.length;
        for (index = 0; index < maxSize; index++) {
          rank_text = rank_text + '<' + String(index + 1) + '. ' + keywords[index]['keyword'] + '> ';
        }
        $('#keyword_rank').text(rank_text);
      }
    }
  })
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

function drawPreNextPageBtn() {
  let temp_html = '<div class="transform_page">'
  if (pageIndex > 1) temp_html = temp_html + '\<button type="button" class="btn btn-outline-dark pgnBtn" onclick="prePage()">◀</button>';
  temp_html =
    temp_html + '\<button type="button" class="btn btn-outline-dark pgnBtn" onclick="nextPage()">▶</button>\</div>'


  $('#imageResult').append(temp_html);
}

function prePage() {
  if (pageIndex > 10) { pageIndex = pageIndex - 10; }
  getPictureByCGS();
}

function nextPage() {
  pageIndex = pageIndex + 10;
  getPictureByCGS();
}

function openKeywordResult(status) {
  // true : open, false : close
  if (status) {
    $('#imageResult').show();
    $('#keyword_result_box').html('<span style="cursor: pointer" onclick="openKeywordResult(false)">▼ 검색결과 닫기</span>');

  }
  else {
    $('#imageResult').hide();
    $('#keyword_result_box').html('<span style="cursor: pointer" onclick="openKeywordResult(true)">▶ 검색결과 열기</span>');
  }
}

function clickToIMG(index) {
  drawOrgImg(imgURLs[index]);
  openKeywordResult(false);
  $("#edit_box").show();
  $("#tool_content").html('');
  $("#modImg").html('');

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

/* Function Button */

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

  updateHelp(
    'Crop은 이미지를 잘라내는 기능입니다.<br>' +
    '모든 수치는 0 ~ 1000000 범위를 갖습니다. .<br>' +
    '- x : 시작 가로 위치입니다.<br>' +
    '- y : 시작 세로 위치입니다.<br>' +
    '- width : 가로 크기입니다.<br>' +
    '- height : 세로 크기입니다.');
}

function rotate() {
  $('#tool_content').html('');
  tool_status = "rotate";
  drawNumTool("회전 각도", "rotate_x");
  $("#rotate_x").attr({ type: "number", min: "0", max: "359", value: "0" });

  updateHelp(
    'Rotate는 이미지를 회전하는 기능입니다.<br>' +
    '회전 각도는 0 ~ 359 범위를 갖습니다.<br>' +
    '- 회전 각도 : 이미지를 회전할 각도입니다.');
}

function rounded_corners() {
  $('#tool_content').html('');
  tool_status = "rounded_corners";
  drawNumTool("둥근 수치", "rounded_corners_r");
  drawNumTool("흐림 수치", "rounded_corners_b");

  $("#rounded_corners_r").attr({ type: "number", min: "0", max: "10000", value: "0" });
  $("#rounded_corners_b").attr({ type: "number", min: "0", max: "200", value: "0" });

  updateHelp(
    'Round는 이미지의 모서리를 둥글게 하는 기능입니다<br>' +
    '둥근 수치는 0 ~ 10000, 흐림 수치는 0 ~ 200의 범위를 갖습니다.<br>' +
    '- 둥근 수치 : 이미지의 모서리의 둥그렇게 만드는 수치입니다.<br>' +
    '- 흐림 수치 : 모서리를 흐리게 만드는 강도입니다..');
}



function polaroid() {
  $('#tool_content').html('');
  tool_status = "polaroid";

  drawNumTool("회전 각도", "polaroid_r");
  $('#polaroid_r').attr({ type: "number", min: "0", max: "359", value: "0" });

  updateHelp(
    'Polaroid는 폴라로이드 사진로 만드는 기능입니다.<br>' +
    '회전 각도는 0 ~ 359의 범위를 갖습니다.<br>' +
    '- 회전 각도 : 이미지를 회전할 각도입니다.');
}

function torn_edges() {
  $('#tool_content').html('');
  tool_status = "torn_edges";
  drawNumTool("최소 수치", "torn_edges_min");
  drawNumTool("최대 수치", "torn_edges_max");
  $("#torn_edges_min").attr({ type: "number", min: "1", max: "10000", value: "1" });
  $("#torn_edges_max").attr({ type: "number", min: "1", max: "10000", value: "10" });

  updateHelp(
    'Torn Edge는 외곽을 불규칙적인 모양으로 만드는 기능입니다.<br>' +
    '모든 수치는 0 ~ 10000의 범위를 갖습니다.<br>' +
    '- 최소 수치 : 불규칙적 강도의 최소입니다.<br>' +
    '- 최대 수치 : 불규칙적 강도의 최대입니다.');
}

function vignette() {
  $('#tool_content').html('');
  tool_status = "vignette";
  drawNumTool("흐림 수치", "vignette_a");
  drawNotice("흐림 모드")
  drawRadioBtnTool();
  $("#vignette_a").attr({ type: "number", min: "0", max: "100", value: "0" });

  updateHelp(
    'Vign는 Vignette의 약자로, 외곽을 둥글게 및 흐리게 만드는 기능입니다..<br>' +
    '흐림 수치는 0 ~ 100 범위를 갖습니다.<br>' +
    '- 흐림 수치 : 이미지의 외곽을 어둡게 만드는 강도입니다.<br>' +
    '- 흐림 모드 : 흐림을 적용할 기법을 선택합니다.');


  function drawRadioBtnTool() {
    $("#tool_content").append(
      '<input type="radio" class="radio_btn" name="blueMode" value="gaussian" checked="checked" /> \
          <span class="vignette_mode">Gaussian</span>\
        <input type="radio" class="radio_btn" name="blueMode" value="linear" />\
          <span class="vignette_mode">Linear</span>'
    );

  }
}

function circle() {
  $('#tool_content').html('');
  tool_status = "circle";
  drawNotice("Circle<br>Press the Apply Button");
  updateHelp(
    'Circle은 이미지를 동그랗게 만드는 기능입니다.');
}

function sharpen() {
  $('#tool_content').html('');
  tool_status = "sharpen";
  drawNumTool("선명도", "sharpen_amount");
  $("#sharpen_amount").attr({ type: "number", min: "0", max: "20", value: "0" });

  updateHelp(
    'Sharpen은 이미지를 선명하게 만드는 기능입니다.<br>' +
    '선명도는 0~20의 범위를 갖습니다.<br>' +
    '- 선명도 : 이미지를 선명하게 만드는 강도입니다.');

}

function blurIMG() {
  $('#tool_content').html('');
  tool_status = "blur";
  drawNumTool("흐림도", "blur_amount");
  $("#blur_amount").attr({ type: "number", min: "0", max: "20", value: "0" });
  updateHelp(
    'Blur는 이미지를 흐릿하게 만드는 기능입니다.<br>' +
    '흐림도는 0~20의 범위를 갖습니다.<br>' +
    '- 흐림도 : 이미지를 흐릿하게 만드는 강도입니다.');
}

function monochrome() {
  $('#tool_content').html('');
  tool_status = "monochrome";
  drawNotice("Monochrome<br>Press the Apply Button");
  updateHelp(
    'Mono는 이미지를 회색 이미지로 만드는 기능입니다.');
}

function negative() {
  $("#tool_content").html('');
  tool_status = "negative";
  drawNotice("Negative<br>Press the Apply Button");
  updateHelp(
    'Negative는 이미지를 반전하는 기능입니다.');
}

function asciiToIMG() {
  $("#tool_content").html('');
  tool_status = "asciiToIMG";
  drawNotice("Ascii To Image<br>Press the Apply Button");
  updateHelp(
    'ASCII는 이미지를 특수문자로 그려내는 기능입니다.');
}

/* Function Button End */

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

function drawNotice(content) {
  $("#tool_content").append(

    '<div class="input-group-prepend">\
        <span class="input-group-text" >' + content + '</span>\
         </div>'
  );
}

function updateHelp(content) {
  $('.arrow_box').html(content);
}


function isRangedNumber(val, minVal, maxVal) {
  if (minVal > val || val > maxVal) {
    alert(minVal + " ~ " + maxVal + "값만 입력해주세요");
    return false;
  }
  return true;
}

function modifyImage() {

  function drawModifiedImg(work) {
    modifiedImgUrl
      = "https://cdn.filestackcontent.com/" +
      fileStackKey +
      "/" + work + "/" +
      imgURLs[selectedImg]

    console.log(modifiedImgUrl);

    $('#modImg').html('');
    $('#modImg').append(
      '<figure>\
        <img src='+ modifiedImgUrl + ' alt="" id = "modified_image" data-theme="_is2">\
      </figure>'
    );
  }

  switch (tool_status) {
    case "crop":
      if (
        isRangedNumber($("#crop_x").val(), 0, 1000000) &
        isRangedNumber($("#crop_y").val(), 0, 1000000) &
        isRangedNumber($("#crop_width").val(), 0, 1000000) &
        isRangedNumber($("#crop_height").val(), 0, 1000000)) {
        drawModifiedImg(
          "crop=dim:[" + $("#crop_x").val() + "," + $("#crop_y").val() + "," + $("#crop_width").val() + "," + $("#crop_height").val() + "]"
        );
      }
      break;

    case "rotate":
      if (isRangedNumber($("#rotate_x").val(), 0, 359)) {
        drawModifiedImg(
          "rotate=deg:" + $("#rotate_x").val()
        );
      }
      break;

    case "rounded_corners":
      if (isRangedNumber($("#rounded_corners_r").val(), 0, 10000) &
        isRangedNumber($("#rounded_corners_b").val(), 0, 200)) {
        // rounded_corners_b 값은 10으로 나눠주어야함.
        drawModifiedImg(
          "rounded_corners=blur:" + parseFloat($("#rounded_corners_b").val() / 10) + ",radius:" + $("#rounded_corners_r").val()
        );
      }
      break;

    case "polaroid":
      if (isRangedNumber($("#polaroid_r").val()), 0, 359) {
        drawModifiedImg(
          "polaroid=rotate:" + $("#polaroid_r").val()
        )
      }
      break;

    case "torn_edges":
      if (isRangedNumber($("#torn_edges_min").val(), 1, 10000) &
        isRangedNumber($("#torn_edges_max").val(), 1, 10000)) {
        drawModifiedImg(
          "torn_edges=spread:[" + $("#torn_edges_min").val() + "," + $("#torn_edges_max").val() + "]"
        );
      }
      break;

    case "vignette":
      if (isRangedNumber($('#vignette_a').val(), 0, 100)
      ) {
        let blurMode = $('input:radio[name="blueMode"]:checked').val();
        console.log(blurMode)
        drawModifiedImg(
          'vignette=amount:' + $('#vignette_a').val() + ',blurmode:"' + blurMode + '"'
        );
      }
      break;

    case "circle":
      drawModifiedImg("circle");
      break;

    case "sharpen":
      if (isRangedNumber($("#sharpen_amount").val())) {
        drawModifiedImg(
          "sharpen=amount:" + $("#sharpen_amount").val()
        )
      }
      break;
    case "blur":
      if (isRangedNumber($("#blur_amount").val())) {
        drawModifiedImg(
          "blur=amount:" + $("#blur_amount").val()
        )
      }
      break;

    case "monochrome":
      drawModifiedImg("monochrome");
      break;

    case "negative":
      drawModifiedImg("negative");
      break;

    case "asciiToIMG":
      let modifiedImgUrl
        = "https://cdn.filestackcontent.com/" +
        fileStackKey +
        "/ascii=background:black,colored:true,reverse:true/" +
        imgURLs[selectedImg];
      console.log(imgURLs[selectedImg]);

      let bk_img = "'" + imgURLs[selectedImg] + "'";
      $('#modImg').html('');
      $('#modImg').append(
        '<div style="position: relative;">\
          <figure>\
           <a href="' + modifiedImgUrl + '" target = "_blank" >\
              <img src='+ bk_img + ' style="opacity: 0.5;" data-theme="_is2">\
              <div style="bottom: 33%; text-align:center;font-size: x-large; color: black;font-weight: bold; position: absolute;">\
               이미지 클릭 시 새창에서 ASCII 이미지를 볼 수 있습니다.\
             </div>\
            </a>\
          </figure>\
        </div>'
      );
      break;

    default:
      break;
  }
}
