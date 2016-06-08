  //submit form on uploading image
  function uploadImage() {
   $("#imageform").submit()
  }
  
  $("#fileToUpload").on("change", uploadImage);
  
  //beat measurer object
   function beatHolder(tapSel, bpmSel, accBarSel, slideSel, mockGifSel) {
    that=this;
    this.tapSel = tapSel;
    this.bpmSel = bpmSel;
    this.accBarSel = accBarSel;
    this.slideSel=slideSel;
    this.mockGifSel = mockGifSel;
    this.shareSel = "shareLink";
    
    //max siz of beats array
    this.maxBeats = 20;
    // timestamp of each beat
    this.beats = [];
    //contains BPM of lessening accuracy
    this.accArray = [];
    //min/max BPM based on history
    this.minBPM = 0;
    this.maxBPM = 0;
    this.bpMs = 0;
    this.startTime=0;
    
    //number of nothces in craphical metronome
    this.metNotchNum = 20;
    this.metMaxBPM  = 300;
    this.timerActive = false;
    
    //selectr for beat timer bar
    this.beatTimerSel = "beatTimer";
    
    //Unique image identifier to pull right image when playing
    this.UImgID = $('#UImgID').val();
    
    //oomphFrame is the frames of the split gif where the beat should land on
    this.oomphFrames=[];
    this.oomphGaps=[];
    
    this.frames=[];
    
    for (var findex = 1; findex<=$("."+slideSel).length; findex++) {
     this.frames.push(findex);
    }
    //this.noFrames = $("."+slideSel).length;
    
    this.addBeat = function() {
     var timeTapped=Date.now();
     
     //add the beat
     that.beats.push(timeTapped);
     
     //remove earliest beat if too large
     if (that.maxBeats > 0) {
      if (that.beats.length>that.maxBeats) {
       that.beats.shift();
      }
     }
     
     //removeprevious beats if its been too long since last click
     if (that.beats[that.beats.length-1]-that.beats[that.beats.length-2]>(that.beats[1]-that.beats[0])*1.2) {
      that.beats.splice(0,that.beats.length-1);
     }
     
     // print out bpm if thecontainer exists in the dom
     if ($('#'+that.bpmSel).length > 0) {
      var bpmNow = that.calcBPM();
      $('#'+that.bpmSel).text(bpmNow);
      
      //start playing frames
      that.showCurrentFrame();
      
      that.setMetronome(bpmNow);
      
      that.generateShareLink();
     }
     
     // update beat accuracy bar
      $("#"+that.accBarSel).text(that.calcAccuracy());
      $("#minBPM").text(that.minBPM);
      $("#maxBPM").text(that.maxBPM);
      
     //start the beat time if not already running, if already running reset
     if (!that.timerActive && that.beats.length > 1) {
      that.updateBeatTimer();
     }
     
    }
  
    // calculate beats per min for given range of beats in array, no parameters assumes entire array
    this.calcBPM = function(start, finish) {
     if (start < 0 || start == null) {
      start=0;
     }
    
     if (finish == null) {
      finish=that.beats.length-1;
     }
     
     if (finish < 0) {
      finish=0;
     }
     if (finish >= that.beats.length) {
      finish = that.beats.length-1;
     }
     if (start > finish) {
      start = finish;
     }
     
     var numBeats = finish-start;
     var beatRange = that.beats[finish]-that.beats[start];
     var bpMs = (numBeats)/beatRange;
     that.bpMs = bpMs;
     var bPMin = bpMs*60000;
     return bPMin;
    }
    
    // create an array of beats per minue over time an set the over accuracy
    // runs fewest (most recent) beats used to all used
    this.calcAccuracy = function() {
     that.accArray = [];
     for (i = that.beats.length-2; i >0; i--) { 
      that.accArray.push(Math.round(that.calcBPM(i,that.beats.length-1)));
     }
     
     that.maxBPM = Math.max.apply(null, that.accArray);
     that.minBPM = Math.min.apply(null, that.accArray);
     
     return that.accArray;
    }
    
    this.hitSetOomphFrame = function(event){
     var slideID = event.target.id;
     var frameNumber = $("#"+slideID).data("count");
     
     that.setOomphFrame(frameNumber);
     
     that.generateShareLink();
    }
    
    //set the oomph beat frame takesan event from click
    this.setOomphFrame = function (frameNumber) {
     
     var existingLocation = $.inArray(frameNumber,that.oomphFrames);
     
     if (existingLocation!=-1) {
      that.oomphFrames.splice(existingLocation,1);
     } else {
      that.oomphFrames.push(frameNumber);
      that.addFrame(frameNumber);
     }
     that.oomphFrames.sort(sortNumber);
          
     $("."+slideSel).removeClass("selected");
          
     for (var frameIter=0; frameIter<that.oomphFrames.length; frameIter++) {
      $("#"+slideSel+that.oomphFrames[frameIter]).parent().addClass("selected");
     }
     
    }
    
    this.showCurrentFrame = function() {
     if (that.beats.length > 1 && that.oomphFrames.length>0) {
      var curTime = Date.now();
      var timeElapsed = curTime - that.beats[0];
      
      var noBeats = timeElapsed * that.bpMs;
      var noWholeBeats = Math.floor(noBeats);
      
      var beatFraction = noBeats-noWholeBeats;
      
      var oomphIndex = 0;
      var framToShow = 0;
      if (that.oomphFrames.length > 0) {
       var oomphIndex = (noWholeBeats) % that.oomphFrames.length;
       
       var nextOomphIndex = (oomphIndex+1) % that.oomphFrames.length;
       
       var wholeOomph = that.oomphFrames[oomphIndex];
       
       var nextWholeOomph = that.oomphFrames[nextOomphIndex];
       
       if (nextWholeOomph > wholeOomph) {
        
        //remeber we need to count the number of activeframes not just simple subtraction
        //var oomphLength = nextWholeOomph - wholeOomph;
        var oomphLength = $.inArray(nextWholeOomph,that.frames)-$.inArray(wholeOomph,that.frames);
        
       } else {
        var oomphLength = (that.frames.length-$.inArray(wholeOomph,that.frames))+$.inArray(nextWholeOomph,that.frames);
       }
       
       var oomphFrameProgression = Math.floor(oomphLength * beatFraction);
       var frameToShow = that.frames[(($.inArray(wholeOomph,that.frames) + oomphFrameProgression) % that.frames.length)];
      }
      
      $("#"+that.mockGifSel).attr("src","uploads/"+that.UImgID+"_"+frameToShow+".jpeg");
      
      if (frameToShow == null) {
       console.log(that.oomphFrames,":", oomphIndex);
       console.log((($.inArray(wholeOomph,that.frames) + oomphFrameProgression) % that.frames.length));
  
      }
      setTimeout(function() {that.showCurrentFrame();},10);
     }
    }
    
    this.hitAddFrame = function(event){
     var addFrameID = event.target.id;
     var frameNum = $("#"+addFrameID).data("count");
     
     that.addFrame(frameNum);
     
     that.generateShareLink();
     
     $("#removeFrame"+frameNum).show();
     $("#"+addFrameID).hide();
    }
    
    this.addFrame = function (frameNum) {
     
     var existingLocation = $.inArray(frameNum,that.frames);
     
     if (existingLocation==-1) {
      that.frames.push(frameNum);
     }
     that.frames.sort(sortNumber);
     
     $("#removeFrame"+frameNum).show();
     $("#addFrame"+frameNum).hide();
    }
    
    this.hitRemoveFrame = function(event){
     var removeFrameID = event.target.id;
     var frameNum = $("#"+removeFrameID).data("count");
     
     that.removeFrame(frameNum);
     
     that.generateShareLink();
     
     if ($.inArray(frameNum,that.oomphFrames)!=-1) {
      that.setOomphFrame(frameNum);
     }
     
    }
    
    this.removeFrame = function (frameNum) {

     var existingLocation = $.inArray(frameNum,that.frames);
     
     if (existingLocation!=-1) {
      that.frames.splice(existingLocation,1);
     }
     
     $("#addFrame"+frameNum).show();
     $("#removeFrame"+frameNum).hide();

    }
    
    this.createMetronome = function (containerID){

     var metCont = document.getElementById(containerID); //Get svg element
     
     var metSVG = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
     metSVG.setAttribute("id","metSVG");
     metSVG.setAttribute("xmlns","http://www.w3.org/2000/svg");
     metSVG.setAttribute("height","100%");
     metSVG.setAttribute("viewBox","160 0 40 200");
     
     var metG = document.createElementNS("http://www.w3.org/2000/svg", 'g');
     metG.setAttribute("id","metG");
     metG.setAttribute("style","transform-origin:50%;transition:transform 1s");
     
     var metCirc = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
     metCirc.setAttribute("id","metCirc");
     metCirc.setAttribute("r","100");
     metCirc.setAttribute("cx","100");
     metCirc.setAttribute("cy","100");
     metCirc.setAttribute("style","fill:#ff0000;stroke:#000000;");
     
     var needle = document.createElementNS("http://www.w3.org/2000/svg", 'path');
     needle.setAttribute("id","needle");
     needle.setAttribute("d","M 100,100 195,100");
     needle.setAttribute("style","stroke-width:1px;stroke:lime;");
     
     
     metG.appendChild(metCirc);
     metSVG.appendChild(metG);
     metSVG.appendChild(needle);
     
     
     var rotateDegrees = 0;
     for (var intervalCounter = 0;intervalCounter<that.metMaxBPM;intervalCounter+=that.metMaxBPM/that.metNotchNum) {
      
      rotateDegrees = Math.round((intervalCounter/that.metMaxBPM)*360)*-1;
      
      
      var newG = document.createElementNS("http://www.w3.org/2000/svg", 'g');
      newG.setAttribute("id","beat"+intervalCounter);
      newG.setAttribute("transform-origin","100px 100px");
      newG.setAttribute("style","transform:rotate("+rotateDegrees+"deg)");
      newG.setAttribute("x","100");
      newG.setAttribute("y","100");
      
      var newText = document.createElementNS("http://www.w3.org/2000/svg", 'text');
      newText.setAttribute("id","beatText"+intervalCounter);
      newText.setAttribute("style","font-size:13.47368431px;font-family:sans-serif;");
      
      var newTSpan = document.createElementNS("http://www.w3.org/2000/svg", 'tspan');
      newTSpan.setAttribute("id","beatTSpan"+intervalCounter);
      newTSpan.setAttribute("x","175");
      newTSpan.setAttribute("y","105");
      newTSpan.textContent=Math.round(intervalCounter);
      
      newText.appendChild(newTSpan);
      newG.appendChild(newText);
      
      metG.appendChild(newG);
     }
     
     metCont.appendChild(metSVG);
     
    }
    
    this.setMetronome = function(bpm) {
     var rotateDegrees = Math.round(bpm/(that.metMaxBPM)*360);
     $("#metG").css("transform", "rotate("+rotateDegrees+"deg)");
    }
    
    this.updateBeatTimer = function() {
     
     that.timerActive = true;
     if (that.beats.length > 1) {
      var beatPercentage = 100- ((Date.now() - that.beats[that.beats.length-1])/(that.beats[1]-that.beats[0]))*100;
     
      if (0<beatPercentage) {
       $("#"+that.beatTimerSel).css("width",beatPercentage+"%");
       setTimeout(function () {that.updateBeatTimer()},50);
      } else {
       that.timerActive = false;
       $("#"+that.beatTimerSel).css("width","0");
      }
     } else {
      this.timerActive = false;
     }
    }
    
    this.generateShareLink = function() {
     var shareDomain = window.location.host;
     var shareUImgID = that.UImgID;
     var shareOomphBeat = that.oomphFrames.toString();
     var shareFrames = that.frames.toString();
     var shareBPMs = that.bpMs;
     
     $shareURL = shareDomain + "?UImgID=" + shareUImgID + "&oomphBeat=" + shareOomphBeat + "&frames=" + shareFrames + "&bpMs=" + shareBPMs;
     
     $("#"+that.shareSel).val($shareURL);
    }
    
    $("#"+that.tapSel).on("mousedown",that.addBeat);
     
    $(".toggleOomph").on("click", that.hitSetOomphFrame);
    $(".removeFrame").on("click", that.hitRemoveFrame);
    $(".addFrame").on("click", that.hitAddFrame);
    
    that.createMetronome("metronomeHolder");
   };
   
   function sortNumber(a,b) {
    return a - b;
   }
   
   var mainBH = new beatHolder("clickme", "beatsholder", "accbar", "slide","mockGifImage");
   