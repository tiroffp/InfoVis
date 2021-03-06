    // Define domElement and sourceFile
    var timelineElement = "#timeline";
    var bookElement = "#bookchart";
    var lifespanElement = '#lifespan'
    var sourceFile = "GOTDeaths.csv";

    function parseData(row){
        row['start'] = calcChapterNumber(row['Book of Introduction Number'],row['Intro Chapter']);
        row['end'] = calcChapterNumber(row['Book of Death Number'],row['Death Chapter']);
        row['lifespan'] = row['end'] - row['start']
        row['label'] = row['Name'];
        row['selected'] = false;
        row.NameForClass = row.Name.replace(/\s+/g, '').replace(/'/g, 'A')
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

        var main_timeline = timeline(timelineElement)

        main_timeline
        .data(dataset)
        .band("mainTimeline")
        .xAxis("mainTimeline")
        .tooltips("mainTimeline")
        .brush("mainTimeline")
        .redraw();

        var book_graph = bookshistogram(bookElement, main_timeline.getdata().items.map(parseData));

        var lifespan_graph = lifespan(lifespanElement, main_timeline.getdata().items.map(parseData));
    });