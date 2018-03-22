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
     */
	categorize(transactions, categories = {}) {
        
        const categorizedTransactions = {};
        
        transactions.forEach(trx => {
            const category = this._categorizeOne(trx, categories);
            if (Object.keys(category).length !== 0) {
                // Check if it exists
                const existingTransactions = categorizedTransactions[category.id];
                
                if (existingTransactions) {
                    // If one or more transactions already exist, just push
                    existingTransactions.push(trx);
                } else {
                    // If not, create it
                    categorizedTransactions[category.id] = [trx];
                }
            }
        });
        
		return categorizedTransactions;
    }

    _categorizeOne(transaction, categories) {
        let category = {};

        if (categories) {
            categories.some(transactionCategory => {
                // First of all, sanity checks
                if (!transaction.description) {
                    return false; // nothing to do, we categorized based on the description
                }

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
        }

        return category;
    }
	
}

module.exports = BankTransactionCategorizer;