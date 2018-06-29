module.exports = class SingleCategoryCategorizer {

  constructor (matchers) {
    this.matchers = matchers;
  }
  
  categorize(index, categories, opts) {
    let categoryToBeReturned = {};

    categories.some(categoryElement => {

      let matchesPhrase = this.matchers.phrase(index, categoryElement);
      
      if (matchesPhrase && opts.matchPhrases) {
        // One phrase matched
        categoryToBeReturned = categoryElement;
        return true;
      }
      
      if (opts.matchKeywords && this.matchers.keyword(index, categoryElement)) {
        // Found something
        categoryToBeReturned = categoryElement;
        return true;
      }
      
      // No dice
      return false;
    });

    return categoryToBeReturned;
  }

};