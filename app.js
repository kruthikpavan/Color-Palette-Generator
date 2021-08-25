//global variables
const colordivs = document.querySelectorAll(".color");
const generate = document.querySelector(".generate");
const sliders = document.querySelectorAll(".slider");
const currentHexes = document.querySelectorAll(".color h3");
const adjust = document.querySelectorAll(".adjust");
const closeSlider = document.querySelectorAll(".close-slider");
const locks = document.querySelectorAll(".lock");
const saveBtn = document.querySelector(".save");
const closeSavePopup = document.querySelector(".close-save");
const savePopup = document.querySelector(".save-container");
const savepopupBox = savePopup.querySelector(".save-popup");
const libraryBtn = document.querySelector(".library");
const closeLibraryPopup = document.querySelector(".close-library");
const libraryPopup = document.querySelector(".library-container");
const librarypopupBox = libraryPopup.querySelector(".library-popup");
const savePalette = document.querySelector(".submit-save");
const saveInput = document.querySelector(".save-input");

let initialcolor;
let savedPalettes = [];

//event listeners
saveInput.value=""

generate.addEventListener("click", () => {
  randomColor();
});

sliders.forEach((slider) => {
  slider.addEventListener("input", hslcontrol);
});

sliders.forEach((slider, index) => {
  slider.addEventListener("change", () => {
    updateTextUi(index);
  });

  // if(sliderinput.value==="hue-input")
});

//copy color text
currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

//sliders adjust
adjust.forEach((button, index) => {
  button.addEventListener("click", () => {
    sliders[index].classList.add("active");
  });
});

//sliders close
closeSlider.forEach((close, index) => {
  close.addEventListener("click", () => {
    sliders[index].classList.remove("active");
  });
});

//lock and unlock
locks.forEach((lock, index) => {
  lock.addEventListener("click", () => {
    const icon = lock.querySelector("i");
    if (icon.classList.contains("fa-lock-open")) {
      icon.classList.remove("fa-lock-open");
      icon.classList.add("fa-lock");
    } else {
      icon.classList.remove("fa-lock");
      icon.classList.add("fa-lock-open");
    }
    colordivs[index].classList.toggle("locked");
  });
});

//save-popup
saveBtn.addEventListener("click", () => {
  savePopup.classList.add("active");
  savepopupBox.classList.add("active");
});

//close-save-popup
closeSavePopup.addEventListener("click", () => {
  savePopup.classList.remove("active");
  savepopupBox.classList.remove("active");
});

//Save-Palette
savePalette.addEventListener("click", (event) => {
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  //generate object
  let paletteNumber;
  const paletteObject =JSON.parse(localStorage.getItem('palettes'));
  if(paletteObject){
    paletteNumber=paletteObject.length
  }
  else{
    paletteNumber=savedPalettes.length
  }
  const paletteObj = { name, colors, nr: paletteNumber };
  savedPalettes.push(paletteObj);
  //save to Local Storage
  savetoLocal(paletteObj)
  saveInput.value=""

  //generate palette for library
  const palette=document.createElement("div")
  palette.classList.add("custom-palette")
  const title=document.createElement("h4")
  title.innerText= paletteObj.name
  const preview= document.createElement('div')
  preview.classList.add("small-preview")
  paletteObj.colors.forEach(smallColor=>{
    const smallDiv= document.createElement("div")
    smallDiv.style.backgroundColor= smallColor
    preview.appendChild(smallDiv)

  })
  const paletteBtn= document.createElement("button")
  paletteBtn.classList.add("pick-palette-btn")
  paletteBtn.classList.add(paletteObj.nr)
  paletteBtn.innerText="Select"

  //attach event to btn
  paletteBtn.addEventListener("click",e=>{
    closeLibrary();
  
    const paletteIndex= e.target.classList[1];
    console.log(paletteIndex);
    initialcolor=[]
    console.log(savedPalettes);
     
   

      savedPalettes[paletteIndex].colors.forEach((color,index)=>{
        initialcolor.push(color)
        colordivs[index].style.backgroundColor=color;
        const text=colordivs[index].children[0]
        text.innerText=color;
        updateTextUi(index);
        
        
        
        
        
      })
    
  reset();
  
  })
  
  //append to library
  palette.appendChild(title)
  palette.appendChild(preview)
  palette.appendChild(paletteBtn)
  librarypopupBox.appendChild(palette)
  
});

//library-popup
libraryBtn.addEventListener("click", (event) => {
  
  libraryPopup.classList.add("active");
  librarypopupBox.classList.add("active");
});
//close-library-popup
closeLibraryPopup.addEventListener("click",closeLibrary);

//functions
function generatehex() {
  const hash = chroma.random();
  // const allvar= "0123456789ABCDEF";
  // let hash="#";
  // for (let i=0;i<6;i++){
  //     hash+=allvar[Math.floor(Math.random()*15)];

  // }
  return hash;
}

//set colors

function randomColor() {
  initialcolor = [];
  colordivs.forEach((div, index) => {
    const hexhead = div.children[0];
    const adjust = div.querySelector(".adjust");
    const lock = div.querySelector(".lock");
    const randcol = generatehex();
    if (div.classList.contains("locked")) {
      initialcolor.push(hexhead.innerText);

      return;
    } else {
      initialcolor.push(chroma(randcol).hex());
    }

    div.style.background = randcol;
    hexhead.innerText = randcol;
    

    //hexhead color
    textColor(randcol, hexhead);
    textColor(randcol, adjust);
    textColor(randcol, lock);

    //slider color

    const slider = div.querySelectorAll(".slider input");
    const hue = slider[0];
    const brightness = slider[1];
    const saturation = slider[2];
    const col = chroma(randcol);
    sliderColor(col, hue, brightness, saturation);

    //sliderValue
    hue.value = Math.floor(chroma(randcol).hsl()[0]);
    brightness.value = Math.floor(chroma(randcol).hsl()[2] * 100) / 100;
    saturation.value = Math.floor(chroma(randcol).hsl()[1] * 100) / 100;
  });
}

//textcontrast
function textColor(color, hexhead) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    hexhead.style.color = "black";
  } else {
    hexhead.style.color = "white";
  }
}

//slider color

function sliderColor(color, hue, brightness, saturation) {
  const lowsat = color.set("hsl.s", 0);
  const highsat = color.set("hsl.s", 1);
  const midbright = color.set("hsl.l", 0.5);
  

  const scaleSat = chroma.scale([lowsat, color, highsat]);
  const scaleBright = chroma.scale(["black", midbright, "white"]);
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )},${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)},${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(255, 0, 0), rgb(255, 125, 0), rgb(255, 255, 0), rgb(125, 255, 0), rgb(0, 255, 0), rgb(0, 255, 125), rgb(0, 255, 255), rgb(0, 125, 255), rgb(0, 0, 255)) `;
}

function hslcontrol(event) {
  const index =
    event.target.getAttribute("data-bright") ||
    event.target.getAttribute("data-sat") ||
    event.target.getAttribute("data-hue");

  let sliders = event.target.parentElement.querySelectorAll(
    'input[type="range"]'
  );
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgcolor = initialcolor[index];

  let colory = chroma(bgcolor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);
  colordivs[index].style.backgroundColor = colory;
  sliderColor(colory, hue, brightness, saturation);
}

function updateTextUi(index) {
  const activeDiv = colordivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const headtext = activeDiv.querySelector("h3");
  const adjust = activeDiv.querySelector(".adjust");
  const lock = activeDiv.querySelector(".lock");
  headtext.innerText = color.hex();
  textColor(color, headtext);
  textColor(color, adjust);
  textColor(color, lock);
}
randomColor();

//copy color text function
function copyToClipboard(hex) {
  const temp = document.createElement("textarea");
  document.body.appendChild(temp);
  temp.innerText = hex.innerText;
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);

  //popup-animation
  const popup = document.querySelector(".copy-container");
  const popupBox = popup.querySelector(".copy-popup");
  popup.classList.add("active");
  popupBox.classList.add("active");

  popup.addEventListener("transitionend", () => {
    popup.classList.remove("active");
    popupBox.classList.remove("active");
  });
}

//save to local storage

function savetoLocal(paletteObj){
  let localPalettes;
  if(localStorage.getItem("palettes")===null){
    localPalettes=[];
  }
  else{
    localPalettes=JSON.parse(localStorage.getItem('palettes'))
  }
  localPalettes.push(paletteObj)
  localStorage.setItem("palettes",JSON.stringify(localPalettes))
}  

//get from local storage

function getLocal(){
  if(localStorage.getItem("palettes")===null){
    localPalettes=[];
  }
  else{
    const paletteObject =JSON.parse(localStorage.getItem('palettes'));
    savedPalettes = [...paletteObject];
    paletteObject.forEach(paletteObj=>{
      const palette=document.createElement("div")
  palette.classList.add("custom-palette")
  const title=document.createElement("h4")
  title.innerText= paletteObj.name
  const preview= document.createElement('div')
  preview.classList.add("small-preview")
  paletteObj.colors.forEach(smallColor=>{
    const smallDiv= document.createElement("div")
    smallDiv.style.backgroundColor= smallColor
    preview.appendChild(smallDiv)

  })
  const paletteBtn= document.createElement("button")
  paletteBtn.classList.add("pick-palette-btn")
  paletteBtn.classList.add(paletteObj.nr)
  paletteBtn.innerText="Select"

  //attach event to btn
  paletteBtn.addEventListener("click",e=>{
    closeLibrary();
  
    const paletteIndex= e.target.classList[1];
    initialcolor=[]   
    paletteObj.colors.forEach((color,index)=>{
      initialcolor.push(color)
      colordivs[index].style.backgroundColor=color;
      const text=colordivs[index].children[0]
      text.innerText=color;
      updateTextUi(index);
      
      
      
      
      
    })
  reset();
  
  })
  
  //append to library
  palette.appendChild(title)
  palette.appendChild(preview)
  palette.appendChild(paletteBtn)
  librarypopupBox.appendChild(palette)

    })
  }

}

function closeLibrary(){
  
    libraryPopup.classList.remove("active");
    librarypopupBox.classList.remove("active");
 
}

function reset(){
  colordivs.forEach((div, index) => {
    const slider = div.querySelectorAll(".slider input");
    const hue = slider[0];
    const brightness = slider[1];
    const saturation = slider[2];
    // console.log(initialcolor[index]);
    const col = chroma(initialcolor[index]);
    sliderColor(col, hue, brightness, saturation);

    // //sliderValue
    hue.value = Math.floor(chroma(initialcolor[index]).hsl()[0]);
    brightness.value = Math.floor(chroma(initialcolor[index]).hsl()[2] * 100) / 100;
    saturation.value = Math.floor(chroma(initialcolor[index]).hsl()[1] * 100) / 100;


  })

}

getLocal();
// localStorage.clear();s