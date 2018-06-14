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
	categorize(transactions, categories = {}) {
    
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
   * Categorizes one transaction, returning only the first match.
   * @param {Object} transaction the transaction object to be categorized
   * @param {Array} categories the categories to be used to categorize this transaction.
   * @param {Boolean} [shouldReturnArray=false] if the method should return 
   */
  _categorizeOne(transaction, categories, shouldReturnArray = false) {
    let category = {};
    
    // First of all, sanity checks
    if (!categories) {
      return shouldReturnArray ? [] : category;
    }

    if (!transaction.description) {
      // nothing to do, we categorized based on the description
      return shouldReturnArray ? [] : category;
    }
    
    // If we should return an array, detour to another method
    if (shouldReturnArray) {
      return this._categorizeOneAndReturnManyCategories(transaction, categories);
    }

    categories.some(transactionCategory => {
      // Configure our document index
      const index = new this.elasticlunr(function () {
        this.addField('description');
        this.setRef('index');
      });
      
      // Add our tuple
      index.addDoc(transaction);
      
      // should check if the category has phrases
      if (transactionCategory.phrases) {
        // Let's find out if it matches the whole phrase
        let matchesPhrase = false;
        
        // Check if it matches any of the phrases configured
        transactionCategory.phrases.forEach(phrase => {
          const searchResult = index.search(phrase, DEFAULT_PHRASE_SEARCH_CONFIG);
          // Did we find something
          matchesPhrase = searchResult.length > 0;
        });
        
        if (matchesPhrase) {
          // One phrase matched
          category = transactionCategory;
          return true;
        }
      }
      
      // should be an array of keywords
      // should contain any of the keywords
      if (transactionCategory.keywords) {
        // Search our index
        const searchResult = index.search(transactionCategory.keywords.join(' '), DEFAULT_KEYWORD_SEARCH_CONFIG);
        
        if (searchResult.length > 0) {
          // Found something
          category = transactionCategory;
          return true;
        }
      }
      
      // No dice
      return false;
    });
    
    return category;
  }

  _categorizeOneAndReturnManyCategories(transaction, categories) {
    const categoriesToBeReturned = [];
    
    categories.forEach(transactionCategory => {
      // Configure our document index
      const index = new this.elasticlunr(function () {
        this.addField('description');
        this.setRef('index');
      });
      
      // Add our tuple
      index.addDoc(transaction);
      
      let matchesPhrase = false;

      // should check if the category has phrases
      if (transactionCategory.phrases) {
        // Let's find out if it matches the whole phrase
        
        // Check if it matches any of the phrases configured
        transactionCategory.phrases.forEach(phrase => {
          const searchResult = index.search(phrase, DEFAULT_PHRASE_SEARCH_CONFIG);
          // Did we find something
          if (searchResult.length > 0 && !matchesPhrase) {
            matchesPhrase = true;
          }
        });
        
        if (matchesPhrase) {
          // One phrase matched
          categoriesToBeReturned.push(transactionCategory);
        }
      }
      
      // should be an array of keywords
      // should contain any of the keywords
      // Only run this if a phrase has not been already matched
      if (transactionCategory.keywords && !matchesPhrase) {
        // Search our index
        const searchResult = index.search(transactionCategory.keywords.join(' '), DEFAULT_KEYWORD_SEARCH_CONFIG);
        
        if (searchResult.length > 0) {
          // Found something
          categoriesToBeReturned.push(transactionCategory);
        }
      }
      
    });

    return categoriesToBeReturned;
  }

  categorizeTransactions(transactions, categories) {
    return transactions.map((trx) => {
      
      trx.categories = this._categorizeOne(trx, categories, true);
      
      return trx;
    });
  }
	
}

module.exports = BankTransactionCategorizer;