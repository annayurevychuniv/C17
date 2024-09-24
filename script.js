const clothesPath = "img/clothes/compressed/";
const backgroundPath = "img/background/";

document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("mannequin");
    const ctx = canvas.getContext("2d");
    let dragging = false;
    let resizing = false;
    let dragItem = null;
    let deleting = false;
    let images = [];
    let offsetX, offsetY;
    let originalWidth, originalHeight;

    canvas.width = 400;
    canvas.height = 700;

    let currentBackgroundIndex = 0;
    const backgrounds = [
        backgroundPath + "background-1.jpg",
        backgroundPath + "background-2.jpg",
        backgroundPath + "background-3.jpg",
        backgroundPath + "background-4.jfif",
        backgroundPath + "background-5.jpg",
        backgroundPath + "background-6.jpeg"
    ];

    const backgroundImages = [];
    backgrounds.forEach(src => {
        const img = new Image();
        img.src = src;
        backgroundImages.push(img);
    });

    const mannequinImage = new Image();
    mannequinImage.src = "img/model_2.png";

    mannequinImage.onload = function () {
        redrawCanvas();
    };

    mannequinImage.onerror = function () {
        console.error("Failed to load mannequin image");
    };

    function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const backgroundImage = backgroundImages[currentBackgroundIndex];
        if (backgroundImage.complete && backgroundImage.naturalHeight !== 0) {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(mannequinImage, canvas.width / 1.8 - mannequinImage.width / 2, canvas.height / 1.9 - mannequinImage.height / 2,
            mannequinImage.width / 1.2, mannequinImage.height / 1.2);
        images.forEach(img => {
            ctx.drawImage(img.imageObj, img.x, img.y, img.width, img.height);
        });
    }

    canvas.addEventListener("mousedown", function (e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        images.forEach((img, index) => {
            if (
                mouseX >= img.x &&
                mouseX <= img.x + img.width &&
                mouseY >= img.y &&
                mouseY <= img.y + img.height
            ) {
                if (deleting) {
                    images.splice(index, 1);
                    redrawCanvas();
                } else {
                    dragging = true;
                    dragItem = img;
                    offsetX = mouseX - img.x;
                    offsetY = mouseY - img.y;
                    originalWidth = img.width;
                    originalHeight = img.height;
                }
            }
        });
    });

    canvas.addEventListener("mousemove", function (e) {
        if (dragging && dragItem) {
            if (resizing) {
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                const newWidth = Math.max(10, originalWidth + (mouseX - (dragItem.x + offsetX)));
                const newHeight = Math.max(10, originalHeight + (mouseY - (dragItem.y + offsetY)));
                dragItem.width = newWidth;
                dragItem.height = newHeight;
                redrawCanvas();
            } else {
                const rect = canvas.getBoundingClientRect();
                dragItem.x = e.clientX - rect.left - offsetX;
                dragItem.y = e.clientY - rect.top - offsetY;
                redrawCanvas();
            }
        }
    });

    canvas.addEventListener("mouseup", function () {
        dragging = false;
        resizing = false;
        dragItem = null;
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Shift") {
            resizing = true;
        } else if (e.key === "d" || e.key === "D") {
            deleting = true;
        } else if (e.key === "ArrowLeft") {
            currentBackgroundIndex = (currentBackgroundIndex - 1 + backgrounds.length) % backgrounds.length;
            redrawCanvas();
        } else if (e.key === "ArrowRight") {
            currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;
            redrawCanvas();
        }
    });

    document.addEventListener("keyup", function (e) {
        if (e.key === "Shift") {
            resizing = false;
        } else if (e.key === "d" || e.key === "D") {
            deleting = false;
        }
    });

    function loadClothesData() {
        fetch("data.json")
            .then(response => response.json())
            .then(clothesData => {
                const categoryCount = {};
    
                clothesData.forEach(clothing => {
                    clothing.categories.forEach(category => {
                        if (categoryCount[category]) {
                            categoryCount[category]++;
                        } else {
                            categoryCount[category] = 1;
                        }
                    });
                });
    
                const sortedCategories = Object.keys(categoryCount).sort();
    
                const leftMenu = document.querySelector(".left-menu-inner");
                leftMenu.innerHTML = "";
    
                sortedCategories.forEach(category => {
                    const button = document.createElement("button");
                    button.innerText = `${category} (${categoryCount[category]})`;
                    button.addEventListener("click", function () {
                        document.querySelectorAll(".left-menu button").forEach(btn => btn.classList.remove("active"));
                        button.classList.add("active");
                        displayClothes(clothesData, category);
                    });
                    leftMenu.appendChild(button);
                });
    
                const firstButton = leftMenu.querySelector("button");
                if (firstButton) {
                    firstButton.classList.add("active");
                    displayClothes(clothesData, sortedCategories[0]);
                }
            })
            .catch(error => console.error("Error loading clothes data:", error));
    }

    function displayClothes(clothesData, category) {
        const bottomMenu = document.querySelector(".bottom-menu");
        bottomMenu.innerHTML = "";
        clothesData
            .filter(clothing => clothing.categories.includes(category))
            .forEach(clothing => {
                const img = document.createElement("img");
                img.src = clothesPath + clothing.url;
                img.alt = clothing.description;
                img.addEventListener("click", function () {
                    const newImage = new Image();
                    newImage.src = clothesPath + clothing.url;
                    images.push({
                        imageObj: newImage,
                        x: 0,
                        y: 0,
                        width: 150,
                        height: newImage.height * 150 / newImage.width
                    });
                    redrawCanvas();
                });
                bottomMenu.appendChild(img);
            });
    }

    loadClothesData();
});