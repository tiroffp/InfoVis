    // Define domElement and sourceFile
    var domElement = "#timeline";
    var sourceFile = "GOTDeathsReduced.csv";

    function parseData(row){
        row['start'] = calcChapterNumber(row['Book of Introduction Number'],row['Intro Chapter']);
        row['end'] = calcChapterNumber(row['Book of Death Number'],row['Death Chapter']);
        row['lifespan'] = row['end'] - row['start']
        row['label'] = row['Name'];
        return row;
    }

    function calcChapterNumber(book, chapter) {
        book = parseInt(book)
        chapter = parseInt(chapter)
        switch (book) {
          case 2:
          chapter = chapter  + 73;
          break;
          case 3:
          chapter = chapter + 143;
          break;
          case 4:
          chapter = chapter + 225;
          break;
          case 5:
          chapter = chapter + 270;
          break;
          default:
          chapter = chapter;
      }
      return chapter.toString();
  }

    // Read in the data and construct the timeline
    d3.csv(sourceFile, parseData, function(dataset) {

        var main_timeline = timeline(domElement)

        main_timeline
        .data(dataset)
        .band("mainBand", 0.82)
        .band("naviBand", 0.08)
        .xAxis("mainBand")
        .tooltips("mainBand")
        .xAxis("naviBand")
        .labels("mainBand")
        .labels("naviBand")
        .brush("mainBand", ["naviBand"])
        .redraw();
    });