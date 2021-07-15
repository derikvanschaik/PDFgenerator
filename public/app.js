//log july1: 10:40 pm - 11:38 pm 12:20 - 12:40, july 9 3 hours, july 13: 10:20 - 4:30., july 15 10:07 am - 
// Goal of this file is to see wether we can implement the back shadow on hover effect
//_________________________________________// 



// API call for base64 encodings of the images
const getImageUrls = async () =>{
	const response = await fetch('/urls', { method:'GET'}); 
	const data = await response.json(); 
	return data; // return the json 
}

const centerElements = (elements) =>{
	elements.forEach( (element) =>{
		element.style.margin = "auto"; 
	} ); 
}

const appendChildren = (parent, children) =>{
	children.forEach( (child) =>{
		parent.appendChild(child); 
	})
}

// Kind of unconventional to do this in js but oh well. 
const imageDivStyling = (div) =>{
	div.style.borderRadius = '15px';
	div.style.padding =  '10px 10px 20px 10px'; 
	div.style.border = '1px solid grey';
	div.style.width =  '92%'; // works best with the current width and height of the pictures (300, 200)
	div.style.display = 'flex';
	div.style.flexDirection = "column";
}

const createImageDiv = (imageName) =>{
	// create the elements of the div 
	const parent = document.createElement("div"); // parent div  
	const image = document.createElement("img");
	const caption = document.createElement("p");
	const clickedIcon = document.createElement('img'); 

	image.src = `images/${imageName}`;
	image.style.width = '100%';
	image.height = 300; 

	clickedIcon.src = `verified.png`; 
	clickedIcon.width = 40; 
	clickedIcon.height = 40; 

	caption.textContent = 'Click to Select'; 
	caption.style.visibility = 'hidden';
	clickedIcon.style.visibility = 'hidden';

	imageDivStyling(parent); 
	centerElements([image, clickedIcon, caption]);
	appendChildren(parent, [image, clickedIcon, caption]); 

	return parent;  
}
// EVENT HANDLER FUNCTIONS 
const handleHoverOn = (image, isSelected) => {
	// the box shadow css styling that creates the backshadow when hovering 
	image.style.boxShadow = '5px 5px 10px 8px #d3d3d3';
	const caption = image.lastChild;
	// make the 'click to select' caption visible if they have not selected the div 
	if (!isSelected){
		caption.style.visibility = 'visible';
	}
}

const handleHoverOut = (image) =>{
	// revert box shadow 
	image.style.boxShadow = null;
	const caption = image.lastChild; 
	// hide the caption 
	caption.style.visibility = 'hidden'; 
}

const handleClick = (image, selectedImages, index) =>{
	// managing visibility of icon 
	let visibility = 'visible';
	if (selectedImages[index]){ // if it is already selected
		visibility = 'hidden';
	}
	const clickedIcon = image.lastChild.previousElementSibling; 
	clickedIcon.style.visibility = visibility;
	selectedImages[index] = !selectedImages[index];
	// managing visiblity of caption 
	if (selectedImages[index] ){
		const caption = image.lastChild; 
		caption.style.visibility = 'hidden'; 
	}
}

// creates a pdf -- helper function for handleSubmit() 
const createPDF = (imageUrls) =>{
	const doc = new jsPDF();
	const images = imageUrls; 
	console.log("images:", images); 
	const centre_x = 60;
	const starting_y = 10; 
	const delta_y = 50+7; // height of each image plus padding (3)
	const imagesPerPage = 5;
	let pageCount = 0; 
	images.forEach((img, index) =>{

		if ((index)%imagesPerPage==0 && index!==0){
			pageCount++; 
			doc.addPage(); 
		}
		const offset =delta_y*(index%(imagesPerPage));
		const y = starting_y + offset; 
		doc.addImage(img, 'JPEG', centre_x, y, 80, 50);

	}); 
	
	doc.save(`Images.pdf`);
}

// filters selected images from URL object
const handleSubmit = (selectedImageUrls) =>{
	createPDF(selectedImageUrls); 
}
// re-initializes the Boolean selectedImages array to false -- no longer selected. Used after submitting 'generate my pdf'. 
const resetSelectedImages = (selectedImages) =>{
	for(let i =0; i < selectedImages.length; i++){
		selectedImages[i] = false; 
	}
}
// hides all the selected icons from the image divs 
const resetSelectedImageIcons = (images) =>{
	images.forEach( (image)=>{
		const clickedIcon = image.lastChild.previousElementSibling; 
		clickedIcon.style.visibility = 'hidden';
	} ); 
}
// kind of like the 'main' function that we see in java, python, c, etc. 
window.onload = async (event) =>{
	// load the json from the api call getImageURls() 
	let urls = []; 
	try {
		urls = await getImageUrls(); 
	} catch(e) {
		console.log('Error asyncing the images'); 
		console.log(e); 
	}
	
	const imageDigs = Object.keys(urls).sort(); // the keys of the object are the image names -- need to sort for them to retain orig order. 
	const imageNames = imageDigs.map((imageName)=>`${imageName}.jpg` );
	const root = document.getElementById('root');	// create an image element for each, set width and height 
	const images = imageNames.map( (imageName) => createImageDiv(imageName)); // create the image divs 
	const submitButton = document.getElementById("submit-button");
	submitButton.style.visibility = "visible"; // We hide the submit button initially in order to have it load more pleasantly (visually)
	appendChildren(root, images); // append the image divs to the root of the DOM 
	const selectedImages = images.map( ()=>false ); // init as all false -not selected
	const description = document.getElementById('description-banner'); 

	// add Event Listeners 
	images.forEach( (image, index) =>{
		
		image.onmouseover = () =>{
			handleHoverOn(image, selectedImages[index]);
		}; 
		image.onmouseout =  ()=>{
			handleHoverOut(image); 
		}; 
		image.onclick = () =>{
			handleClick(image, selectedImages, index); 
		}; 

	});

	description.onmouseover = () =>{
		document.getElementById('description-paragraph').style.visibility = 'visible'; 
	}; 
	description.onmouseout = () =>{
		document.getElementById('description-paragraph').style.visibility = 'hidden'; 
	}; 
	submitButton.onclick = () =>{
		// the SelectedImageNumbers array contains the 'image names' that were selected. ie if image 1 and 2 were selected then this 
		// array will be ['01', '02']. 
		const selectedImageNumbers = imageDigs.filter((imageNum, index) => selectedImages[index]);
		const selectedImageUrls = selectedImageNumbers.map((imageNum) => urls[imageNum]); // array of all the base 64 encodings of the selected images 
		if (selectedImageUrls.length > 0){
			handleSubmit(selectedImageUrls);
			resetSelectedImages(selectedImages);
			resetSelectedImageIcons(images); 
			console.log(selectedImages); 
			return;  
		}; 
		alert("No images have been selected.");

	}; 


}
