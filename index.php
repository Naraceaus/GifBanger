<?php
if(session_id() == '') {
    session_start();
}

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include "GifFrameExtractor.php";

if (!empty($_FILES["fileToUpload"]["name"])) {
$imageFileType = pathinfo(basename($_FILES["fileToUpload"]["name"]),PATHINFO_EXTENSION);
$target_dir = "uploads/";
$target_file = $target_dir . session_id() ."_origUpload.".$imageFileType;
$uploadOk = 1;
//echo "this is my file type" . $imageFileType;
// Check if image file is a actual image or fake image
if(isset($_POST["submit"])) {
    $check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);
    if($check !== false) {
        //echo "File is an image - " . $check["mime"] . ".";
        $uploadOk = 1;
    } else {
        //echo "File is not an image.";
        $uploadOk = 0;
    }
}

// Allow certain file formats
if($imageFileType != "gif" ) {
    //echo "Sorry, only JPG, JPEG, PNG & GIF files are allowed.";
    $uploadOk = 0;
}
// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 0) {
    echo "Sorry, your file was not uploaded.";
// if everything is ok, try to upload file
} else {
 if (is_dir($target_dir) && is_writable($target_dir)) {
    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
        //echo "The file ". basename( $_FILES["fileToUpload"]["name"]). " has been uploaded.";
    } else {
        echo "Sorry, there was an error uploading your file.";
        echo $_FILES["fileToUpload"]["tmp_name"].' '.$target_file;
    }
 } else {
  echo "uploads directory no writable";
 }
}
}
?>
<html>
 <head>
  <script src="jquery-2.2.4.min.js"></script>
  <!--
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>
  -->
  <link rel="stylesheet" href="bootstrap-3.3.6-dist/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
  <script src="bootstrap-3.3.6-dist/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>
  
  <link rel="stylesheet" type="text/css" href="style.css"/>

  </head>
 <body>
  <?php echo "<input id='sessionID' type='hidden' value='".session_id()."'/>" ?>
  
  <div class="container">
  
  <!-- upload your image -->
  <div class="row">
     <div class="col-md-12">
      <div><h1><span class="expander clickGlyph glyphicon" data-toggle="collapse" data-target="#imgUpload"></span>Step 1. Upload a GIF</h1></div>
      <div id="imgUpload" class="collapse in">
      <h3>Click on the below image to upload a new gif</h3>
       <form id="imageform" action="index.php" method="post" enctype="multipart/form-data">
        <div class="image-upload">
         <label for="fileToUpload">
         <?php  
         $sessionID=session_id();
         $origFile="uploads/".session_id()."_origUpload.gif";
         if (file_exists($origFile)) {
         } else {
          $origFile = "default.gif";
         }
           echo "<image class='mainImage inputImage' src='$origFile'>";
         ?>
         </label>
         <input id="fileToUpload" name="fileToUpload" type="file"/>
        </div>
       </div>
      </form>
     </div>
  </div>
  <!-- Split Frames Section -->
  <div class="row">
   <div class="col-md-12">
    <div><h1><span class="expander clickGlyph glyphicon collapsed" data-toggle="collapse" data-target="#gifThumbs"></span>Step 2. Select Your Frames</h1></div>
    <div id="gifThumbs" class="collapse">
    <?php
    if (file_exists($origFile)) {
     if (GifFrameExtractor::isAnimatedGif($origFile)) { // check this is an animated GIF
      
      $gfe = new GifFrameExtractor();
      $gfe->extract($origFile);

      $count=1;
      
      foreach ($gfe->getFrames() as $frame) {
       // The frame resource image var
       $img = $frame['image'];
       $duration = $frame['duration'];

       $imgname = "uploads/" . session_id() . "_" . $count . ".jpeg";
       
       imagejpeg($img, $imgname);
       
       echo "
       <div class='col-lg-2 col-md-4 col-sm-6'>
        <div class='thumbnail slide'>
         <img src='$imgname'>
         <span id='addFrame$count' class='addFrame clickGlyph glyphicon glyphicon-plus' data-count='$count' style='display:none;'></span>
         <span id ='removeFrame$count' class='removeFrame clickGlyph glyphicon glyphicon-minus' data-count='$count'></span>
         <span id='slide$count' class='toggleOomph	clickGlyph glyphicon glyphicon-music' data-count='$count'></span>
         <span class='pull-right'>$count</span>
        </div>
       </div>";
       // The frame duration
       
       $count++;
      }
     }   
    }
    ?>
    </div>
   </div>
  </div>
  
  <!--Player-->
  <div class="row">
   <div class="col-md-12">
    <div><h1><span class="expander clickGlyph glyphicon collapsed" data-toggle="collapse" data-target="#gifPlayer"></span>Step 3. Tap to the beat</h1></div>
    <div id="gifPlayer" class="row collapse">   
     <div class="col-md-5">
     
     
      <div class="row">
       <div class="col-xs-10 nopadding">
        <div id="clickme" class="btn-large btn-xlarge">
         <span class="glyphicon glyphicon-music"></span><span>Tap To The Beat</span><span class="glyphicon glyphicon-music"></span>
         <br>
         <div class="progress">
           <div id="beatTimer" div="beatTimerBar" class="progress-bar">
             <span class="sr-only"></span>
           </div>
         </div>
        </div>
       </div>
       <div class="col-xs-2 nopadding"/>
        <div id="metronomeHolder" class="circleContainer">
        </div>
        
        <div id="beatsholder" style="display:none;">None Yet</div>
        <br>
        <div id="minBPM" style="display:none;">None Yet</div>
        <br>
        <div id="maxBPM" style="display:none;">Non Yet</div>
        <br>
       </div>
       
       
      </div>
     </div>
     <div class="col-md-7">
        <div id="mockGif">
         <image id='mockGifImage' src='upload.png'>
        </div>  
     </div>
    </div>
   </div>
  </div>
  
 </div>
 <hr>
 </body>
 <footer>
  <script src="beats.js"></script>
 </footer>
</html>