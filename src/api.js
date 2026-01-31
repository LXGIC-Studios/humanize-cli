/**
 * API integrations for GPTZero and Originality.ai
 */

const https = require('https');

class APIAnalyzer {
  constructor(config = {}) {
    this.gptzeroKey = config.gptzeroKey || process.env.GPTZERO_API_KEY;
    this.originalityKey = config.originalityKey || process.env.ORIGINALITY_API_KEY;
  }

  hasApiKeys() {
    return !!(this.gptzeroKey || this.originalityKey);
  }

  /**
   * Analyze with GPTZero API
   * @param {string} text 
   * @returns {Promise<{score: number, sentences: Array}>}
   */
  async analyzeWithGPTZero(text) {
    if (!this.gptzeroKey) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const data = JSON.stringify({ document: text });
      
      const options = {
        hostname: 'api.gptzero.me',
        path: '/v2/predict/text',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.gptzeroKey,
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            if (result.documents && result.documents[0]) {
              const doc = result.documents[0];
              resolve({
                score: Math.round((doc.completely_generated_prob || 0) * 100),
                sentences: doc.sentences || [],
                classification: doc.class_probabilities || {}
              });
            } else {
              resolve({ score: 0, sentences: [] });
            }
          } catch (e) {
            reject(new Error(`GPTZero parse error: ${e.message}`));
          }
        });
      });

      req.on('error', (e) => reject(new Error(`GPTZero API error: ${e.message}`)));
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('GPTZero API timeout'));
      });
      
      req.write(data);
      req.end();
    });
  }

  /**
   * Analyze with Originality.ai API
   * @param {string} text 
   * @returns {Promise<{score: number, sentences: Array}>}
   */
  async analyzeWithOriginality(text) {
    if (!this.originalityKey) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const data = JSON.stringify({ content: text });
      
      const options = {
        hostname: 'api.originality.ai',
        path: '/api/v1/scan/ai',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-OAI-API-KEY': this.originalityKey,
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            if (result.score) {
              resolve({
                score: Math.round(result.score.ai * 100),
                original: Math.round(result.score.original * 100),
                sentences: result.sentences || []
              });
            } else {
              resolve({ score: 0, sentences: [] });
            }
          } catch (e) {
            reject(new Error(`Originality.ai parse error: ${e.message}`));
          }
        });
      });

      req.on('error', (e) => reject(new Error(`Originality.ai API error: ${e.message}`)));
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Originality.ai API timeout'));
      });
      
      req.write(data);
      req.end();
    });
  }

  /**
   * Run all available API checks
   * @param {string} text 
   * @returns {Promise<{gptzero?: object, originality?: object}>}
   */
  async analyzeAll(text) {
    const results = {};
    const promises = [];

    if (this.gptzeroKey) {
      promises.push(
        this.analyzeWithGPTZero(text)
          .then(r => { results.gptzero = r; })
          .catch(e => { results.gptzeroError = e.message; })
      );
    }

    if (this.originalityKey) {
      promises.push(
        this.analyzeWithOriginality(text)
          .then(r => { results.originality = r; })
          .catch(e => { results.originalityError = e.message; })
      );
    }

    await Promise.all(promises);
    return results;
  }
}

module.exports = { APIAnalyzer };
