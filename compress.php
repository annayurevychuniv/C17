<?php
set_time_limit(0);

function resizeAndCompressImage($source, $destination, $newWidth, $quality, $rotateRight = false) {
    list($width, $height, $type) = getimagesize($source);
    $aspectRatio = $height / $width;
    $newHeight = $newWidth * $aspectRatio;

    switch ($type) {
        case IMAGETYPE_JPEG:
            $image = imagecreatefromjpeg($source);
            break;
        case IMAGETYPE_PNG:
            $image = imagecreatefrompng($source);
            break;
        case IMAGETYPE_GIF:
            $image = imagecreatefromgif($source);
            break;
        default:
            return false;
    }

    if ($rotateRight) {
        $image = imagerotate($image, -90, 0); 
        $temp = $width;
        $width = $height;
        $height = $temp;
        $aspectRatio = $height / $width;
        $newHeight = $newWidth * $aspectRatio;
    }

    $newImage = imagecreatetruecolor($newWidth, $newHeight);

    if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_GIF) {
        imagecolortransparent($newImage, imagecolorallocatealpha($newImage, 0, 0, 0, 127));
        imagealphablending($newImage, false);
        imagesavealpha($newImage, true);
    }

    imagecopyresampled($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

    switch ($type) {
        case IMAGETYPE_JPEG:
            imagejpeg($newImage, $destination, $quality);
            break;
        case IMAGETYPE_PNG:
            imagepng($newImage, $destination);
            break;
        case IMAGETYPE_GIF:
            imagegif($newImage, $destination);
            break;
    }

    imagedestroy($image);
    imagedestroy($newImage);

    return true;
}

$inputDir = './img/clothes/uncompressed'; 
$outputDir = './img/clothes/compressed2';
$newWidth = 400; 
$quality = 80; 
$pauseDuration = 5;

if (!file_exists($outputDir)) {
    mkdir($outputDir, 0777, true);
}

$files = array_filter(scandir($inputDir), function($file) use ($inputDir) {
    return is_file($inputDir . '/' . $file);
});

$fileIndex = 612;
foreach ($files as $file) {
    if ($fileIndex % 20 == 0) {
        sleep($pauseDuration);
    }
    $inputFilePath = $inputDir . '/' . $file;
    $outputFilePath = $outputDir . '/' . $fileIndex . '.png'; 

    if (resizeAndCompressImage($inputFilePath, $outputFilePath, $newWidth, $quality, false)) {
        echo "Processed file $inputFilePath => $outputFilePath\n";
    } else {
        echo "Failed to process file $inputFilePath\n";
    }

    $fileIndex++;
}
?>