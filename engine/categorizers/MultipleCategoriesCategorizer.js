module.exports = class SingleCategoryCategorizer {
  
  constructor (matchers) {
    this.matchers = matchers;
  }

  categorize(index, categories, opts) {
    const categoriesToBeReturned = [];
    
    categories.forEach(transactionCategory => {
      
      let matchesPhrase = this.matchers.phrase(index, transactionCategory);
        
      if (opts.matchPhrases && matchesPhrase) {
        // One phrase matched
        categoriesToBeReturned.push(transactionCategory);
      }
      
      // Only run this if a phrase has not been already matched
      if (!matchesPhrase) {

        if (opts.matchKeywords && this.matchers.keyword(index, transactionCategory)) {
          // Found something
          categoriesToBeReturned.push(transactionCategory);
        }
      }
      
    });

    return categoriesToBeReturned;
  }

};