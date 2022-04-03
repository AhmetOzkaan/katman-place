// ==UserScript==
// @name         FORZABBL
// @version      1.0
// @description  FORZABBL
// @match        https://hot-potato.reddit.com/embed*
// @grant        none
// ==/UserScript==

const X_OFFSET = 1462
const Y_OFFSET = 661

async function run() {
    const debug=false;
    const g = (e, t) =>
        new CustomEvent(e, {
            composed: !0,
            bubbles: !0,
            cancelable: !0,
            detail: t,
        });

    function sleep(ms) {
        return new Promise((res) => setTimeout(res, ms));
    }

    const colors = {
        1:  "#BE0039",
        2:  "#FF4500",
        3:  "#FFA800",
        4:  "#FFD635",
        6:  "#00A368",
        7:  "#00CC78",
        8:  "#7EED56",
        9:  "#00756F",
        10: "#009EAA",
        12: "#2450A4",
        13: "#3690EA",
        14: "#51E9F4",
        15: "#493AC1",
        16: "#6A5CFF",
        18: "#811E9F",
        19: "#B44AC0",
        22: "#FF3881",
        23: "#FF99AA",
        24: "#6D482F",
        25: "#9C6926",
        27: "#000000",
        29: "#898D90",
        30: "#D4D7D9",
        31: "#FFFFFF",
    };
    for (const [k, v] of Object.entries(colors)) {
        colors[v] = k;
    }

    async function get_template_ctx(){
        return new Promise((resolve, reject) => {
            let img = new Image()
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                const template_canvas = document.createElement("canvas");
                template_canvas.width = img.width;
                template_canvas.height = img.height;
                const template_ctx = template_canvas.getContext("2d");
                template_ctx.drawImage(img, 0, 0);
                resolve({template_ctx: template_ctx, template_img: img})
            }
            img.onerror = reject
            img.src = "data:image/png;base64,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";
        })
    }

    function getPixel(ctx, x, y) {
        const pixel = ctx.getImageData(x, y, 1, 1);
        const data = pixel.data;
        return (
            ("#" + data[0].toString(16).padStart(2, 0) + data[1].toString(16).padStart(2, 0) + data[2].toString(16).padStart(2, 0)).toUpperCase()
        );
    }

    function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}
    function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0) {
        costs[j] = j;}
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1)){
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;}
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue;}
  }
  return costs[s2.length];
}

    async function setPixel(canvas, x, y, color) {
        canvas.dispatchEvent(g("click-canvas", { x, y }));
        await sleep(1_000+ Math.floor(Math.random() * 1_000));
        canvas.dispatchEvent(g("select-color", { color: 1*colors[color] }));
        await sleep(1_000+ Math.floor(Math.random() * 1_000));
        if (!debug){
            canvas.dispatchEvent(g("confirm-pixel"));
        }
    }

    await sleep(5_000);

    while (true) {
        console.log("running");
        let edited = false;
        try{
            const {template_ctx, template_img} = await get_template_ctx();

            const ml = document.querySelector("mona-lisa-embed");
            const canvas = ml.shadowRoot.querySelector("mona-lisa-canvas").shadowRoot.querySelector("div > canvas")
            const ctx = canvas.getContext('2d');
            const errors = []
            for (let x = 0; x < template_img.width; x++) {
                for (let y = 0; y < template_img.height; y++) {
                    let correct = getPixel(template_ctx, x, y);
                    let actual = getPixel(ctx, x+X_OFFSET, y+Y_OFFSET);
                    if (actual !== correct) {
                        errors.push({x: x+X_OFFSET, y: y+Y_OFFSET, correct: correct, actual: actual});
                    }
                }
            }

            if (errors.length > 0) {
                var e = errors[Math.floor(Math.random()*errors.length)];

                console.log("(%s / %s) is %c%s%c but should be %c%s", e.x, e.y,
                    "background:"+e.actual, e.actual, "background:inherit;",
                    "background:"+e.correct, e.correct
                )

                console.log(colors[e.correct]);
                if(colors[e.correct] === undefined){
                    var closest;
                    var distance = 0;
                    for (var key in colors) {
                        var keyDistance = similarity(e.correct, key);
                        if (keyDistance > distance){
                        distance = keyDistance;
                            closest = key;
                        }
                        console.log(key + "   " + keyDistance);
                        }
                      console.log("(%s / %s) %c%s%c olmalı. seçilen renk: %c%s", e.x, e.y,
                    "background:"+e.correct, e.correct, "background:inherit;",
                    "background:"+closest, closest
                )

                       await setPixel(canvas, e.x, e.y, closest);

                }else{
                    await setPixel(canvas, e.x, e.y, e.correct);
                }
                if (!debug){
                    edited = true;
                }
            }

        } catch (error){
            console.log("ignoring", error);
        } finally {
            let timeout;
            if (edited) {
                timeout = 1_000 * 60 * 5 + 5_000 + Math.floor(Math.random() * 15_000);
            } else {
                timeout =Math.floor(Math.random() * 5_000);
            }
            if (debug){
                timeout = 1;
            }
            console.log("sleeping for ", timeout);
            await sleep(timeout);
        }
    }
}

window.addEventListener('load', run);

