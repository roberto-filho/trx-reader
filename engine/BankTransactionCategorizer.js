const DEFAULT_KEYWORD_SEARCH_CONFIG = {
  fields: {
    description: {boost: 1}
  },
  bool: 'OR'
};

const DEFAULT_PHRASE_SEARCH_CONFIG = {
  fields: {
    description: {boost: 1}
  },
  bool: 'AND'
};

const DEFAULT_OPTIONS = {
  matchKeywords: true, 
  matchPhrases: true
};

class BankTransactionCategorizer {
  
  constructor() {
    this.fs = require('fs');
    this.elasticlunr = require('elasticlunr');
  }
  
  /**
  * Categorizes transactions.
  * @param {Array} transactions the transactions to be categorized
  * @param {Object} categories the categories for the transactions to be divided into
  * @returns {Array} the categories with the transactions associated
  */
	sortIntoCategories(transactions, categories = {}) {
    
    const categoryMap = {};
    
    transactions.forEach(trx => {
      const trxCategory = this._categorizeOne(trx, categories);
      if (Object.keys(trxCategory).length !== 0) {
        // Check if it exists
        const existingCategory = categoryMap[trxCategory.id];
        
        if (existingCategory) {
          // If one or more transactions already exist, just push
          existingCategory.transactions.push(trx);
        } else {
          // If not, create it
          categoryMap[trxCategory.id] = {
            ...trxCategory,
            transactions: [trx]
          };
        }
      }
    });
    
    // Transform the categories into an array
    return Object.keys(categoryMap).map(categoryId => categoryMap[categoryId]);
  }

  
  /**
   * Attaches to the transactions the first category that matches.
   * @param {Array} transactions the transactions to have their category populated.
   * @param {Array} categories the categories to put into the transactions.
   * @returns {Array} the transaction array with no more than one category associated to them.
   */
  addOneCategoryToTransactions(transactions, categories) {
    return transactions.map((trx) => {
      
      trx.categories = this._categorizeOne(trx, categories, false);
      
      return trx;
    });
  }
  
  /**
   * Attaches to the transactions corresponding category matches.
   * @param {Array} transactions the transactions to have their categories populated.
   * @param {Array} categories the categories to put into the transactions.
   * @returns {Array} the transaction array with one or more categories associated to them.
   */
  addManyCategoriesToTransactions(transactions, categories) {
    return transactions.map((trx) => {
      
      trx.categories = this._categorizeOne(trx, categories, true);
      
      return trx;
    });
  }

  chooseCategory (transaction, categories) {
    // First we filter the user categories
    const userCategories = categories.filter(cat => cat.userChosen);

    const category = this._categorizeOne(transaction, categories, false, {matchPhrases: true});
    
    // Check if any user categories matched
    if (category) {
      return category;
    }
    
    // Keep searching
    return void 0;
  };
  
  
  /**
   * Categorizes one transaction, returning only the first match.
   * @param {Object} transaction the transaction object to be categorized
   * @param {Array} categories the categories to be used to categorize this transaction.
   * @param {Boolean} [returnMany=false] if the method should return multiple category matches
   */
  _categorizeOne(transaction, categories, returnMany = false, options = DEFAULT_OPTIONS) {
    let emptyResult = returnMany ? [] : {};
    
    // First of all, sanity checks
    if (!categories) {
      return emptyResult;
    }

    if (!transaction.description) {
      // nothing to do, we categorized based on the description
      return emptyResult;
    }

    // Configure our document index
    // Configure our document index
    const index = new this.elasticlunr(function () {
      this.addField('description');
      this.setRef('index');
    });
    
    // Add our tuple
    index.addDoc(transaction);

    const SingleCategorizer = require('./categorizers/SingleCategoryCategorizer');
    const MultipleCategorizer = require('./categorizers/MultipleCategoriesCategorizer');

    const matchers = {
      keyword: this._matchesAnyKeyword,
      phrase: this._matchesAnyPhrase
    };

    const categorizer = returnMany
      ? new MultipleCategorizer(matchers)
      : new SingleCategorizer(matchers);
    
    // Choose which method to use
    return categorizer.categorize(index, categories, options);
  }

  /**
   * Checks if the transactions in the index match the category's phrases.
   * @param {Object} transactionsIndex the elasticlunr index with the transaction(s)
   * to be categorized.
   * @param {Object} category the category to be checked
   * @returns {Boolean} true if there was a match and false otherwise.
   */
  _matchesAnyPhrase(transactionsIndex, category) {
    // guard check if the category has phrases
    if (!category.phrases) {
      return false;
    }
    
    // Let's find out if it matches the whole phrase
    let matchesPhrase = false;
    
    // Check if it matches any of the phrases configured
    category.phrases.forEach(phrase => {
      const searchResult = transactionsIndex.search(phrase, DEFAULT_PHRASE_SEARCH_CONFIG);
      // Did we find something
      if (searchResult.length > 0 && !matchesPhrase) {
        matchesPhrase = true;
      }
    });
    
    return matchesPhrase;
  }
  
  /**
   * Checks if the transactions in the index match the category's keywords.
   * @param {Object} transactionsIndex the elasticlunr index with the transaction(s)
   * to be categorized.
   * @param {Object} category the category to be checked
   * @returns {Boolean} true if there was a match and false otherwise.
   */
  _matchesAnyKeyword(transactionsIndex, category) {
    // should be an array of keywords
    if (!category.keywords) {
      return false;
    }

    // should contain any of the keywords
    // Search our index
    const searchResult = transactionsIndex.search(category.keywords.join(' '), DEFAULT_KEYWORD_SEARCH_CONFIG);
    
    if (searchResult.length > 0) {
      // Found something
      return true;
    }

    return false;
  }

}

module.exports = BankTransactionCategorizer;